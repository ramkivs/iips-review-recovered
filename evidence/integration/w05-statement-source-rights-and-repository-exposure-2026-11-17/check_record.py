#!/usr/bin/env python3
"""Checks the W05 assessment record against its evidence. Read-only; exit 1 on any failure."""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = subprocess.check_output(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], text=True).strip()
RECORD = 'docs/integration/W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md'
OWN = os.path.relpath(HERE, ROOT).replace(os.sep, '/')
fails = []


def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + ((' :: ' + str(detail)) if detail and not ok else ''))
    if not ok:
        fails.append(name)


def fmt(n):
    return f'{n:,}'


with open(os.path.join(ROOT, RECORD), encoding='utf-8') as fh:
    record = fh.read()
with open(os.path.join(HERE, 'inventory.json'), encoding='utf-8') as fh:
    inv = json.load(fh)
with open(os.path.join(HERE, 'portfolio-source-gap.json'), encoding='utf-8') as fh:
    gap = json.load(fh)
s, files = inv['summary'], inv['files']
src = [f for f in files if f['class'] == 'SOURCE']
txt = [f for f in src if f['path'].endswith('.txt')]
reports = [r for r in s['nonSourceFilesReproducingFilingText'] if r['pageBlocks']]


def has(text):
    return text in record


# Inventory figures as the record states them.
check('total files and bytes', has(f"{len(files)} files, {fmt(s['bytesUnderRealIssuer'])} bytes"))
check('bundles', has(f"{len(set(f['bundle'] for f in files))} bundles"))
for klass, label in (('SOURCE', '**Source data**'), ('DERIVED', '**Derived data**'), ('METADATA', '**Metadata**'), ('EVIDENCE', '**Evidence**')):
    c = s['byClass'][klass]
    check('class row ' + klass, has(f"| {label} | {c['files']} | {fmt(c['bytes'])} |"))
check('source text files and bytes', has(f"{len(txt)} text files of filing pages and notes ({fmt(sum(f['bytes'] for f in txt))} bytes)"))
by_issuer = {k: v['files'] for k, v in s['sourceTextByIssuer'].items()}
want = {'Marico': 'Marico', 'KEC International': 'KEC', 'Infosys': 'Infosys', 'Zensar Technologies': 'Zensar',
        'eClerx Services': 'eClerx', 'Newgen Software': 'Newgen', 'Sasken Technologies': 'Sasken'}
check('source text by issuer', set(by_issuer) == set(want) and all(has(f"{want[k]} {n}") for k, n in by_issuer.items()), by_issuer)
gz = [f for f in src if f['path'].endswith('.gz')]
check('exchange-hosted files', len(gz) == 4 and has(f"({fmt(sum(f['bytes'] for f in gz))} bytes; {fmt(sum(f['unpackedBytes'] for f in gz))} unpacked)"))
check('quotation files and price row', sum(1 for f in src if f['kind'].startswith('quotations')) == 6
      and sum(1 for f in src if f['path'].endswith('.csv')) == 1 and has('6 files of quotations') and has('1 row of a BSE price file'))
check('run reports that print pages', len(reports) == 5 and has(
    f"| 5 | {fmt(sum(r['pageBlockBytes'] for r in reports))} of {fmt(sum(r['fileBytes'] for r in reports))} |")
      and has(f"print {sum(r['pageBlocks'] for r in reports)} filing pages"))
check('result row 4', has(f"{len(src)} source files ({fmt(s['byClass']['SOURCE']['bytes'])} bytes)")
      and has(f"({fmt(sum(r['pageBlockBytes'] for r in reports))} bytes)"))
hosts = {k: v['files'] for k, v in s['sourceTextByOriginHost'].items()}
issuer_hosts = ['www.kecrpg.com', 'marico.com', 'www.infosys.com', 'www.rpggroup.com', 'eclerx.com']
check('origin hosts', has(f"issuer websites for {sum(hosts[h] for h in issuer_hosts)} of the {len(txt)} text files")
      and all(has(f"`{h.replace('www.', '')}` {hosts[h]}") for h in issuer_hosts)
      and has(f"`bseindia.com` for {hosts['www.bseindia.com']}") and has(f"the NSE archive for {hosts['nsearchives.nseindia.com']}")
      and has(f"{hosts['(none in header)']} name their document without an address"), hosts)
pages = {}
for f in src:
    if f.get('page'):
        pages.setdefault((f['issuer'], f['pagesInDocument']), set()).add(f['page'])
check('pages per document', all(has(t) for t in (
    f"{len(pages[('Marico', 259)])} of 259 pages and {len(pages[('Marico', 224)])} of 224",
    f"{len(pages[('KEC International', 215)])} of 215 and {len(pages[('KEC International', 206)])} of 206",
    f"{len(pages[('Zensar Technologies', 167)])} of 167 and {len(pages[('Zensar Technologies', 180)])} of 180")), {k: len(v) for k, v in pages.items()})
# Wording corrected on 2026-11-17 (tracker section 16.290). The counts are unchanged. The record no longer says that
# all of these files "sit in admitted bundles": the S4-R3 re-admission covers ingestion inputs and the candidate dataset.
three = ('REL-1-INFOSYS-2026-11-06', 'WI7-CONSUMER-MARICO-2026-11-07', 'WI8-INDUSTRIALS-KEC-2026-11-07')
s4r3 = 'S4-R3-FILING-REFRESH-2026-11-14'
per = {b: sum(1 for f in src if f['bundle'] == b) for b in three + (s4r3,)}
in_three = sum(per[b] for b in three)
tail = 'where the re-admission of 2026-11-14 covers only the specified ingestion inputs and the candidate dataset.'
check('source files in the three admitted bundles, and in the S4-R3 bundle separately', per[three[0]] == 0
      and not any('/ingest-input/' in f['path'] for f in src if f['bundle'] == s4r3)
      and has(f"They carry {in_three + per[s4r3]} of the {len(src)} source files. {in_three} sit in the three bundles admitted on "
              f"2026-11-13: `REL-1` none, `WI7` {per[three[1]]}, `WI8` {per[three[2]]}. The other {per[s4r3]} sit in the S4-R3 "
              f"bundle, {tail}")
      and has(f"{in_three} of the {len(src)} source files sit in the three bundles admitted on 2026-11-13, and {per[s4r3]} more "
              f"sit in the S4-R3 bundle, {tail}")
      and not has('sit in admitted bundles') and not has('Where the admitted bundles stand'), per)
any_source = s['filesInAnySourceDirectory']['all']
check('files in a source directory', has(f"{any_source['files']} ({fmt(any_source['bytes'])} bytes)"))
marked = s['evidenceFilesCarryingTheLicenceMarker']
check('licence marker', has(f"stands in {len(marked)} evidence files") and sum(1 for p in marked if p.startswith('evidence/real-issuer/')) == 8)
check('files to hold locally', has(f"the {len(src) + len(reports)} files") and has(f"The {len(src)} source files and the five run reports"))

# Portfolio figures.
check('surface rows', gap['surface']['dataRows'] == 68 and gap['surfaceRowsWithoutAnAdmittedSource'] == 68
      and gap['surfaceRowsWithAnyBundleIssuer'] == 0 and has('**68 of 68**'))
check('surface digest', gap['surface']['sha256'].startswith('2dc1d1fb'))

# Text searches the record cites.
def grep_count(needle, where):
    out = subprocess.run(['git', '-C', ROOT, 'grep', '-l', '-F', needle, '--', where], capture_output=True, text=True).stdout
    return len(out.split())
check('files naming r.jina.ai', grep_count('r.jina.ai', 'evidence/real-issuer') == 17 and has('17 files name `r.jina.ai`'))
check('files naming the Internet Archive', grep_count('web.archive.org', 'evidence/real-issuer') == 7 and has('seven name the Internet Archive'))

# Records left unchanged, and the publication added only new files.
base = subprocess.run(['git', '-C', ROOT, 'merge-base', 'HEAD', 'origin/main'], capture_output=True, text=True).stdout.strip()
for path, v in gap['recordsLeftUnchanged'].items():
    now = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', 'HEAD:' + path], text=True).strip()
    then = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', base + ':' + path], text=True).strip() if base else now
    check('unchanged ' + os.path.basename(path), now == v['blob'] == then)
# The commit that published the record (PR #578). The wording corrections came later and changed the record and this file.
PUBLISHED = 'fc96425d4cf941256075eebeda869d79cbd12cee'
pub = subprocess.run(['git', '-C', ROOT, 'diff', '--name-status', PUBLISHED + '^', PUBLISHED], capture_output=True, text=True)
status = [l for l in pub.stdout.split('\n') if l.strip()]
bad = [l for l in status if not l.startswith('A\t') or not (l.endswith(RECORD) or ('\t' + OWN + '/') in l)]
check('the publication commit added only new files, in the record and its evidence folder',
      pub.returncode == 0 and len(status) == 8 and not bad, bad[:3] or pub.stderr.strip()[:160])

# Links of the record and of the README.
link = re.compile(r'\]\(([^)#\s]+)(?:#[^)]*)?\)')
for doc in (RECORD, OWN + '/README.md'):
    with open(os.path.join(ROOT, doc), encoding='utf-8') as fh:
        targets = [t for t in link.findall(fh.read()) if not re.match(r'[a-z]+://', t)]
    missing = [t for t in targets if not os.path.exists(os.path.normpath(os.path.join(ROOT, os.path.dirname(doc), t)))]
    check(f'links of {os.path.basename(doc)} ({len(targets)})', not missing, missing)

# The record keeps the status and names no holding.
check('status line', has('**IN PROGRESS, NOT COMPLETE, NOT ACCEPTED**') and has('`L-041` and `L-042` remain OPEN'))
check('result row 7 says narrowed, not settled',
      has('The rights side of the source is narrowed for personal, local, manual use once D1 is given.') and not has('is settled'))
with open(os.path.join(ROOT, gap['surface']['path']), encoding='utf-8') as fh:
    rows = [l.split(',') for l in fh.read().splitlines()[1:]]
leaks = [r[1] for r in rows if r[1].strip() in record] + [r[0] for r in rows if len(r[0].strip()) > 6 and r[0].strip() in record]
for name in ('inventory.json', 'portfolio-source-gap.json', 'external-sources.json', 'README.md'):
    with open(os.path.join(HERE, name), encoding='utf-8') as fh:
        body = fh.read()
    leaks += [r[1] for r in rows if r[1].strip() in body]
check('no holding identifier or name copied into the record or its evidence', not leaks, leaks[:3])

print(f'{"OK" if not fails else "FAILED"}: {len(fails)} failure(s)')
sys.exit(1 if fails else 0)
