#!/usr/bin/env python3
"""Read-only inventory of the real-issuer evidence bundles.

Classifies every tracked file under evidence/real-issuer/ as source data,
derived data, metadata or evidence, by the rules written below, and measures
where third-party text is reproduced. It reads the working tree of the
repository it sits in, writes nothing outside its own folder, contacts no
network host and changes no evidence file.

  python3 build_inventory.py           write inventory.json and print a summary
  python3 build_inventory.py --check   rebuild in memory and compare with inventory.json
"""
import gzip, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = subprocess.check_output(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], text=True).strip()
BASE = 'evidence/real-issuer/'
OUT = os.path.join(HERE, 'inventory.json')

# Files in a `source` directory that are not copies of a filing. Decided by reading each one.
SOURCE_DIR_NOTES = {
    'grammar.txt': 'EVIDENCE',                         # the product's own nil-declaration grammar
    'verification-greps.txt': 'EVIDENCE',              # checks re-run over committed extracts
    'preference-capital-investigation.txt': 'EVIDENCE',
    'index-locator-corroboration.txt': 'EVIDENCE',
    'standalone-sentence-user-report.txt': 'EVIDENCE',
    'access-blockers.txt': 'METADATA',                 # retrieval attempts and their errors
    'access-log.txt': 'METADATA',
    'caption-search-log.txt': 'METADATA',
    'fetch-log.txt': 'METADATA',
    'retrieval-log-s2.txt': 'METADATA',
    'retrieval-log-supplemental.txt': 'METADATA',
}
ISSUER_PATTERNS = [
    ('Infosys', r'infosys'), ('Marico', r'marico'), ('KEC International', r'\bkec\b|kecrpg'),
    ('Zensar Technologies', r'zensar'), ('eClerx Services', r'eclerx'),
    ('Newgen Software', r'newgen'), ('Sasken Technologies', r'sasken'),
]
RELAYS = ['r.jina.ai', 'translate.goog', 'corsproxy.io', 'api.allorigins.win', 'api.codetabs.com',
          'web.archive.org', 'archive.org']
EXCHANGE_HOSTS = ['nsearchives.nseindia.com', 'archives.nseindia.com', 'www.nseindia.com',
                  'www.bseindia.com', 'api.bseindia.com']
URL_RE = re.compile(r'https?://([A-Za-z0-9._-]+)')
PAGE_RE = re.compile(r'PDF page(?: index)?:? *(\d+) of (\d+)', re.I)
BLOCK_START = re.compile(r'^\s*=== (?!END )(?:BEGIN )?.*PAGE \d+.*===\s*$')
BLOCK_END = re.compile(r'^\s*=== END .*===\s*$')


def git(*args):
    return subprocess.check_output(['git', '-C', ROOT] + list(args), text=True)


def norm(line):
    return ' '.join(line.split())


def page_blocks(text):
    """Blocks a run report prints between '=== ... PAGE n ... ===' and '=== END ... ===': filing page text."""
    count, size, inside = 0, 0, False
    for line in text.splitlines():
        if BLOCK_END.match(line):
            inside = False
        elif BLOCK_START.match(line):
            inside = True
            count += 1
        elif inside:
            size += len(line.encode('utf-8')) + 1
    return count, size


def issuer_of(text, bundle):
    head = text[:1500].lower()
    for name, pat in ISSUER_PATTERNS:
        if re.search(pat, head):
            return name
    for name, pat in ISSUER_PATTERNS:
        if re.search(pat, bundle.lower()):
            return name
    return 'UNATTRIBUTED'


def classify(rel, text):
    parts = rel.split('/')
    bundle, name = parts[0], parts[-1]
    in_source = 'source' in parts[1:-1]
    role = parts[1] if len(parts) > 2 else '(root)'
    if in_source:
        if name.endswith('.gz'):
            return role, 'SOURCE', 'exchange-hosted filing file (XBRL instance or rendered filing)'
        if name.endswith('.csv'):
            return role, 'SOURCE', 'exchange price-file extract'
        if name.endswith('.txt'):
            if name in SOURCE_DIR_NOTES:
                kind = SOURCE_DIR_NOTES[name]
                return role, kind, 'retrieval or search log' if kind == 'METADATA' else 'investigation note'
            return role, 'SOURCE', 'text of a filing page or note'
        if name.startswith('quotes'):
            return role, 'SOURCE', 'quotations from a filing, with locators'
        if name == 'kec-q2-fy27-selected-xbrl-facts.json':
            return role, 'DERIVED', 'facts selected from an XBRL instance'
        return role, 'METADATA', 'locator, digest, identity or review record'
    if role in ('ingest-input', 'input'):
        return role, 'DERIVED', 'figures transcribed from filings (ingestion input)'
    if role in ('dataset', 'dataset-v1'):
        return role, 'DERIVED', 'dataset built from an ingestion input'
    if role == 'identity':
        return role, 'METADATA', 'issuer, security and listing identity'
    if role == '(root)' and name == 'digests.json':
        return role, 'METADATA', 'digest ledger of the bundle'
    return role, 'EVIDENCE', 'run output, assessment payload, finding, determination or README'


def build():
    listing = git('ls-files', '-s', '--', BASE).splitlines()
    files = []
    for row in listing:
        meta, path = row.split('\t', 1)
        blob = meta.split()[1]
        rel = path[len(BASE):]
        if '/' not in rel:
            continue                                   # .gitattributes and similar at the folder root
        with open(os.path.join(ROOT, path), 'rb') as fh:
            raw = fh.read()
        if path.endswith('.gz'):
            text = gzip.decompress(raw).decode('utf-8', 'replace')
            unpacked = len(text.encode('utf-8'))
        else:
            text = raw.decode('utf-8', 'replace')
            unpacked = None
        role, klass, kind = classify(rel, text)
        files.append({'path': path, 'bundle': rel.split('/')[0], 'role': role, 'class': klass, 'kind': kind,
                      'bytes': len(raw), 'blob': blob, '_text': text, '_unpacked': unpacked})

    # Lines of filing text: the body of every SOURCE text file, header lines (#...) left out.
    source_lines = set()
    for f in files:
        if f['class'] == 'SOURCE' and f['path'].endswith('.txt'):
            body = [l for l in f['_text'].splitlines() if not l.startswith('#')]
            f['bodyBytes'] = len('\n'.join(body).encode('utf-8'))
            for l in body:
                n = norm(l)
                if len(n) >= 50:
                    source_lines.add(n)

    for f in files:
        text = f.pop('_text')
        unpacked = f.pop('_unpacked')
        if unpacked is not None:
            f['unpackedBytes'] = unpacked
        head = '\n'.join(text.splitlines()[:15])
        hosts = sorted(set(h.lower() for h in URL_RE.findall(text)))
        f['relaysNamed'] = [r for r in RELAYS if any(h == r or h.endswith('.' + r) or h.endswith(r) and r == 'translate.goog' for h in hosts)]
        f['exchangeHostsNamed'] = [h for h in EXCHANGE_HOSTS if h in hosts]
        if f['class'] == 'SOURCE':
            f['issuer'] = issuer_of(text, f['bundle'])
            origin = URL_RE.findall(head)
            f['originHost'] = origin[0].lower() if origin else None
            m = PAGE_RE.search(head)
            if m:
                f['page'], f['pagesInDocument'] = int(m.group(1)), int(m.group(2))
        else:
            lines = [norm(l) for l in text.splitlines()]
            copied = [l for l in lines if len(l) >= 50 and l in source_lines]
            f['filingLinesReproduced'] = len(copied)
            f['filingBytesReproduced'] = sum(len(l.encode('utf-8')) for l in copied)
        if f['class'] != 'SOURCE':
            f['pageBlocks'], f['pageBlockBytes'] = page_blocks(text)
            f['filingTextBytes'] = max(f['pageBlockBytes'], f['filingBytesReproduced'])

    def tally(rows, key):
        out = {}
        for r in rows:
            k = key(r)
            o = out.setdefault(k, {'files': 0, 'bytes': 0})
            o['files'] += 1
            o['bytes'] += r['bytes']
        return dict(sorted(out.items()))

    src = [f for f in files if f['class'] == 'SOURCE']
    src_txt = [f for f in src if f['path'].endswith('.txt')]
    own = os.path.relpath(HERE, ROOT).replace(os.sep, '/')
    licence_marked = sorted(git('grep', '-l', '-i', '-E', 'not[ -]redistributable', '--', 'evidence',
                                ':!' + own).split())
    summary = {
        'filesUnderRealIssuer': len(files),
        'bytesUnderRealIssuer': sum(f['bytes'] for f in files),
        'byClass': tally(files, lambda r: r['class']),
        'byClassAndKind': tally(files, lambda r: r['class'] + ' | ' + r['kind']),
        'filesInAnySourceDirectory': tally([f for f in files if '/source/' in f['path']], lambda r: 'all'),
        'sourceTextByIssuer': tally(src_txt, lambda r: r['issuer']),
        'sourceTextByOriginHost': tally(src_txt, lambda r: r['originHost'] or '(none in header)'),
        'sourceTextBodyBytes': sum(f.get('bodyBytes', 0) for f in src_txt),
        'sourceByBundle': tally(src, lambda r: r['bundle']),
        'distinctSourceBlobs': len(set(f['blob'] for f in src)),
        'nonSourceFilesReproducingFilingText': sorted(
            [{'path': f['path'], 'class': f['class'], 'fileBytes': f['bytes'], 'pageBlocks': f['pageBlocks'],
              'pageBlockBytes': f['pageBlockBytes'], 'linesAlsoInASourceFile': f['filingLinesReproduced'],
              'filingTextBytes': f['filingTextBytes']}
             for f in files if f['class'] != 'SOURCE' and (f['filingLinesReproduced'] >= 5 or f['pageBlocks'])],
            key=lambda r: (-r['filingTextBytes'], r['path'])),
        'filingTextBytesOutsideSourceFiles': sum(
            f['filingTextBytes'] for f in files
            if f['class'] != 'SOURCE' and (f['filingLinesReproduced'] >= 5 or f['pageBlocks'])),
        'filesNamingARelay': tally([f for f in files if f['relaysNamed']], lambda r: ', '.join(r['relaysNamed'])),
        'filesNamingAnExchangeHost': len([f for f in files if f['exchangeHostsNamed']]),
        'evidenceFilesCarryingTheLicenceMarker': licence_marked,
    }
    return {'schema': 'w05-real-issuer-exposure-inventory/1', 'base': BASE,
            'rules': 'see build_inventory.py: classify() and SOURCE_DIR_NOTES', 'summary': summary, 'files': files}


def main():
    doc = build()
    text = json.dumps(doc, indent=1, ensure_ascii=False, sort_keys=True) + '\n'
    if '--check' in sys.argv:
        with open(OUT, encoding='utf-8') as fh:
            same = fh.read() == text
        print('inventory.json equal to a fresh build:', same)
        sys.exit(0 if same else 1)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print(json.dumps(doc['summary'], indent=1, ensure_ascii=False))
    print('sha256', hashlib.sha256(text.encode('utf-8')).hexdigest(), 'bytes', len(text.encode('utf-8')))


if __name__ == '__main__':
    main()
