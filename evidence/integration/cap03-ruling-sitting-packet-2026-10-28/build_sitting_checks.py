#!/usr/bin/env python3
"""Validate the CAP-03 PA sitting register and generate read-only IPD checks.

Run from the IRR repository root:
    python3 evidence/integration/cap03-ruling-sitting-packet-2026-10-28/build_sitting_checks.py [IPD_CLONE]

Reads: 01-sitting-decision-register.tsv (this folder); the 77-row Table 1 TSV in
cap03-decision-reconciliation-2026-10-28/; the Addendum 1 file.
Writes: 02-validation.txt, 03-cprime-evidence-path-inventory.tsv,
        04-designated-blob-check.txt, 05-remote-verification.txt (this folder).
IPD is read only: git show / rev-parse / diff / log / grep. No IPD write, fetch or checkout.
"""
import csv, os, re, subprocess, sys, datetime

ROOT = os.getcwd()
HERE = os.path.join(ROOT, 'evidence/integration/cap03-ruling-sitting-packet-2026-10-28')
T1 = os.path.join(ROOT, 'evidence/integration/cap03-decision-reconciliation-2026-10-28/02-row-reconciliation.tsv')
ADD = os.path.join(ROOT, 'docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_ADDENDUM_1_2026-10-28.md')
REG = os.path.join(HERE, '01-sitting-decision-register.tsv')
IPD = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ipd-ro5'
C_PRIME = 'a891802e2691bd9c65a67d6abff20d8ce0c26d7d'
BASE = '888eb375eebee01640e44ccdcbb138a71e8c4513'      # verified D2 baseline (PA-5 s.5.5)
PRE = '001c3c80618f2ee1d40e9a90912237e1a06e7b58'        # DA-A1 coordinate (historical/operative basis)
IPD_MAIN = '1ba0740a32e69284d7c524fd6ac8daf5455038d0'
ACT = 'evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md'
ALLOWED_READY = {'ready', 'ready-with-gap', 'ready-after-dep', 'dependent-on-ruling', 'conditional', 'not-applicable'}
ALLOWED_STATUS = {'unresolved', 'unresolved (authority gap)', 'unresolved (open per record)', 'unresolved (trigger met)',
                  'unresolved (IPD-owned)', 'not yet eligible', 'conditional (B-Q1 = B-0)', 'conditional (B-Q1 = B-1)',
                  'conditional (after C-Q1; commit-keyed items after B-Q1)', 'conditional (D-Q = D-2)',
                  'partially applied (revisions 2026-10-28, b, c)', 'dependent'}
OPERATOR_OR_GATED = {'P1-C', 'P1-D', 'L2a', 'L2c', 'S2a', 'G4-S2A', 'L2A', 'L2C', 'A6', 'E9', 'CAP', 'MF', 'E5', 'E6'}
out = []
def say(s=''):
    out.append(s)

def git(*args, repo=None):
    r = subprocess.run(['git', '-C', repo or ROOT] + list(args), capture_output=True, text=True)
    return r.returncode, r.stdout.strip()

# ---------- V1: parse register
rows = list(csv.reader(open(REG, encoding='utf-8'), delimiter='\t'))
H, R = rows[0], rows[1:]
say('== V1 register structure')
say(f'columns={len(H)} rows={len(R)} ragged={sum(1 for r in R if len(r)!=len(H))}')
ids = [r[0] for r in R]
say(f'duplicate item_id: {sorted({i for i in ids if ids.count(i)>1}) or "none"}')
bad_ready = [r[0] for r in R if r[H.index("readiness")] not in ALLOWED_READY]
bad_status = [r[0] for r in R if r[H.index("status")] not in ALLOWED_STATUS]
say(f'readiness vocabulary violations: {bad_ready or "none"}')
say(f'status vocabulary violations: {bad_status or "none"}')
say(f'sitting values: {sorted({r[H.index("sitting")] for r in R})}')

# ---------- V2: coverage against Table 1
t1 = list(csv.reader(open(T1, encoding='utf-8'), delimiter='\t'))
t1h, t1r = t1[0], t1[1:]
cat = {r[1]: r[2] for r in t1r}
say('\n== V2 coverage against the 77-row Table 1 TSV')
say(f'Table 1 rows={len(t1r)} categories={ {c: sum(1 for r in t1r if r[2]==c) for c in sorted(set(cat.values()))} }')
awaiting = sorted(k for k, v in cat.items() if v == 'AWAIT-PA')
mapped = {}
for r in R:
    t = r[H.index('table1_id')].split(' ')[0]
    if t in cat:
        mapped.setdefault(t, []).append(r[0])
        if r[H.index('table1_category')] != cat[t]:
            say(f'CATEGORY MISMATCH {r[0]}: register={r[H.index("table1_category")]} table1={cat[t]}')
    elif r[H.index('table1_category')] != 'ADDED':
        say(f'UNMAPPED table1_id for {r[0]}: {r[H.index("table1_id")]}')
miss = [k for k in awaiting if k not in mapped]
dup = [k for k, v in mapped.items() if len(v) > 1]
say(f'AWAIT-PA rows in Table 1: {len(awaiting)}; mapped: {sum(1 for k in awaiting if k in mapped)}; missing: {miss or "none"}; duplicated: {dup or "none"}')
added = [r[0] for r in R if r[H.index('table1_category')] == 'ADDED']
say(f'ADDED items (not in Table 1; source-established): {added}')

# ---------- V3: dependency order
say('\n== V3 dependency order (topological; dependency must precede its dependant)')
order = {r[0]: int(r[H.index('order')]) for r in R}
sit = {r[0]: r[H.index('sitting')] for r in R}
deps_ok = True
free_text, external = [], []
for r in R:
    for tok in [t.strip() for t in r[H.index('depends_on')].split(';')]:
        if not tok or tok == 'none':
            continue
        if tok.startswith('EXT:'):
            external.append((r[0], tok)); continue
        tok2 = re.sub(r'\(.*?\)', '', tok).strip()
        m = re.match(r'^([A-Za-z0-9][A-Za-z0-9\-]*)', tok2)
        key = m.group(1) if m else tok2
        if key in order:
            if order[key] >= order[r[0]]:
                deps_ok = False; say(f'ORDER VIOLATION: {r[0]} (order {order[r[0]]}) depends on {key} (order {order[key]})')
            if sit[key].isdigit() and sit[r[0]].isdigit() and int(sit[key]) > int(sit[r[0]]):
                deps_ok = False; say(f'SITTING VIOLATION: {r[0]} sitting {sit[r[0]]} depends on {key} sitting {sit[key]}')
        elif key in cat or key in OPERATOR_OR_GATED or key in ('C-prime-exists',):
            external.append((r[0], key))
        else:
            free_text.append((r[0], tok))
say(f'ordering OK: {deps_ok}')
say(f'external/gated dependencies (not register items; not ordered here): {sorted(set(k for _, k in external))}')
say(f'free-text dependency tokens to review: {free_text or "none"}')

# ---------- V4: Addendum 1 section 7 pointer check
say('\n== V4 every register item_id appears in Addendum 1 section 7')
add_txt = open(ADD, encoding='utf-8').read()
sec7 = add_txt[add_txt.find('## 7.'):] if '## 7.' in add_txt else ''
say(f'section 7 present: {bool(sec7)}')
not_in = [r[0] for r in R if r[0] not in sec7]
say(f'item_ids absent from section 7: {not_in or "none"}')

# ---------- V5: summary counts
say('\n== V5 counts')
for s in ['1', '2', '3', 'IPD']:
    say(f'sitting {s}: {sum(1 for r in R if r[H.index("sitting")]==s)} items')
say('readiness: ' + str({k: sum(1 for r in R if r[H.index("readiness")]==k) for k in sorted(ALLOWED_READY)}))

# ---------- V6: C-prime and pre-baseline facts (IPD, read only)
say('\n== V6 IPD facts (read only; IPD clone: %s)' % IPD)
for label, args in [
    ('IPD main resolves', ['rev-parse', 'origin/main']),
    ('C-prime is ancestor of origin/main', ['merge-base', '--is-ancestor', C_PRIME, 'origin/main']),
    ('D2 base is ancestor of C-prime', ['merge-base', '--is-ancestor', BASE, C_PRIME]),
    ('DA-A1 coordinate is ancestor of D2 base', ['merge-base', '--is-ancestor', PRE, BASE]),
]:
    rc, o = git(*args, repo=IPD)
    say(f'{label}: {"yes" if rc == 0 else "no"}')
rc, o = git('grep', '-c', 'executingCommit', C_PRIME, '--', 'src/persistence/gateAPrimeProvisioning.ts', repo=IPD)
say(f'executingCommit occurrences in C-prime provisioning module: {o or "0"} (git grep)')
rc, o = git('diff', '--name-only', PRE, C_PRIME, repo=IPD)
nonev = [p for p in o.splitlines() if not p.startswith('evidence/')]
say(f'non-evidence paths {PRE[:8]}..{C_PRIME[:8]}: {nonev}')
rc, o = git('diff', '--name-only', PRE, C_PRIME, '--', 'evidence/', repo=IPD)
ev = o.splitlines()
say(f'evidence paths {PRE[:8]}..{C_PRIME[:8]}: {len(ev)}')
rc, o = git('diff', '--name-only', PRE, BASE, '--', 'evidence/', repo=IPD)
say(f'evidence paths {PRE[:8]}..{BASE[:8]}: {len(o.splitlines())}; identical set to the above: {set(o.splitlines()) == set(ev)}')
rc, o = git('diff', '--name-only', BASE, C_PRIME, '--', 'evidence/', repo=IPD)
say(f'evidence paths {BASE[:8]}..{C_PRIME[:8]}: {len(o.splitlines())}')
rc, o = git('rev-list', '--parents', '-n1', 'a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe', repo=IPD)
say(f'PR #102 merge a9cd18e8 parents: {o}')
rc, o = git('diff', '--name-only', 'db84ac12f297eec2bb159ae785c3cc584f7d7e34', 'a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe', repo=IPD)
say(f'paths changed by PR #102 vs its first parent db84ac12: {o.splitlines()}')

open(os.path.join(HERE, '02-validation.txt'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')

# ---------- 03: evidence-path inventory (factual; classification NOT made)
rc, o = git('diff', '--name-status', PRE, C_PRIME, '--', 'evidence/', repo=IPD)
lines = []
hdr = ['path', 'change_in_range', 'bundle', 'file_type', 'introduced_or_last_changed_commit', 'subject', 'before_D2_baseline', 'scope_classification']
lines.append('\t'.join(hdr))
for ln in o.splitlines():
    st, p = ln.split('\t', 1)
    if st == 'A':
        rc2, c = git('log', '--diff-filter=A', '--format=%h', f'{PRE}..{BASE}', '--', p, repo=IPD)
        commit = c.splitlines()[-1] if c else ''
    else:
        rc2, c = git('log', '--format=%h', f'{PRE}..{BASE}', '--', p, repo=IPD)
        commit = c.splitlines()[0] if c else ''
    rc3, subj = git('log', '-1', '--format=%s', commit, repo=IPD) if commit else (1, '')
    rc4, fl = git('merge-base', '--is-ancestor', commit, BASE, repo=IPD) if commit else (1, '')
    bundle = p.split('/')[1] if p.count('/') >= 2 else '(loose file)'
    ext = os.path.splitext(p)[1].lower() or '(none)'
    ftype = {'.md': 'documentary', '.txt': 'text record', '.py': 'script (.py)', '.json': 'data (json)',
             '.diff': 'patch text', '.mjs': 'script (.mjs)'}.get(ext, 'other')
    if os.path.basename(p) == 'SHA256SUMS' or os.path.basename(p).startswith('SHA256SUMS'):
        ftype = 'checksum list'
    lines.append('\t'.join([p, st, bundle, ftype, commit, subj.replace('\t', ' '), 'yes' if rc4 == 0 else 'no',
                            'NOT CLASSIFIED: formal s.4.6 step 2 literal scope is non-evidence paths; scope reading is PA question A-Q3 / C-5']))
open(os.path.join(HERE, '03-cprime-evidence-path-inventory.tsv'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')

# ---------- 04: designated-blob check (act s.2.1 vs observed)
rc, act = git('show', f'{IPD_MAIN}:{ACT}', repo=IPD)
act_blob = git('rev-parse', f'{IPD_MAIN}:{ACT}', repo=IPD)[1]
rows04 = []
for m in re.finditer(r'^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{40})`', act, re.M):
    n, p, b = int(m.group(1)), m.group(2), m.group(3)
    obs = {}
    for c in ['5fc74085', PRE[:8], IPD_MAIN[:8]]:
        rc5, o5 = git('rev-parse', '-q', '--verify', f'{c}:{p}', repo=IPD)
        obs[c] = o5[:8] if rc5 == 0 else 'absent'
    rows04.append((n, p, b[:8], obs, obs[IPD_MAIN[:8]] == b[:8]))
txt = [f'act: {ACT} at {IPD_MAIN[:8]}; act blob {act_blob[:8]}',
       f'designated rows parsed: {len(rows04)}',
       'item | path | designated | 5fc74085 | 001c3c80 | 1ba0740a | matches designated at 1ba0740a']
for n, p, b, obs, ok in rows04:
    txt.append(f'{n} | {p} | {b} | {obs["5fc74085"]} | {obs[PRE[:8]]} | {obs[IPD_MAIN[:8]]} | {"yes" if ok else "NO"}')
txt.append(f'matches at 1ba0740a: {sum(1 for r in rows04 if r[4])} of {len(rows04)}; mismatches: {[r[0] for r in rows04 if not r[4]]}')
open(os.path.join(HERE, '04-designated-blob-check.txt'), 'w', encoding='utf-8').write('\n'.join(txt) + '\n')

# ---------- 05: remote verification (ls-remote and gh; read only)
def ls(url, ref):
    r = subprocess.run(['git', 'ls-remote', url, ref], capture_output=True, text=True)
    return r.stdout.split()[0] if r.stdout.strip() else 'NOT FOUND'
rem = [f'verified (UTC) {datetime.datetime.utcnow().isoformat(timespec="seconds")}Z',
       f'IRR main: {ls("origin", "refs/heads/main")}',
       f'IRR session branch: {ls("origin", "refs/heads/arena/b776c15a-iips-review-recovered")}',
       f'IPD main: {ls("https://github.com/ramkivs/iips-production-market-data", "refs/heads/main")}']
for label, args in [('PR #353', ['pr', 'view', '353', '-R', 'ramkivs/iips-review-recovered', '--json', 'state,isDraft,mergedAt,headRefOid']),
                    ('IRR open PRs', ['pr', 'list', '-R', 'ramkivs/iips-review-recovered', '--state', 'open', '--json', 'number']),
                    ('IPD open PRs', ['pr', 'list', '-R', 'ramkivs/iips-production-market-data', '--state', 'open', '--json', 'number'])]:
    r = subprocess.run(['gh'] + args, capture_output=True, text=True)
    rem.append(f'{label}: {r.stdout.strip() or r.stderr.strip()}')
open(os.path.join(HERE, '05-remote-verification.txt'), 'w', encoding='utf-8').write('\n'.join(rem) + '\n')
print('\n'.join(out))
print('written: 02, 03, 04, 05')
