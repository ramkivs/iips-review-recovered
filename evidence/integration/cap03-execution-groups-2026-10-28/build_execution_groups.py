#!/usr/bin/env python3
"""Read-only: derive the CAP-03 execution-group reconciliation from package Table 1 (PR #352).

Writes nothing except stdout. Inputs: the CAP-03 package on IRR main (or the checked-out copy).
Outputs: per-group counts, owners, IRR-owned items, and transitive dependence on Q-S2-1 / Q-S2-2.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
PKG = ROOT / 'docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md'
lines = PKG.read_text(encoding='utf-8').split('\n')
rows = []
for l in lines:
    if re.match(r'\|\s*\d+\s*\|', l):
        c = [x.strip() for x in l.split('|')[1:-1]]
        if len(c) < 12:
            continue
        m = re.search(r'\*\*([^*]+)\*\*', c[1])
        rid = m.group(1) if m else c[1][:14]
        rows.append({'n': int(c[0]), 'id': rid, 'owner': c[3], 'status': c[4], 'dep': c[7], 'group': c[10], 'next': c[11]})
print(f'rows parsed: {len(rows)} (expected 77)')
ids = [r['id'] for r in rows]

def refs(text):
    out = set()
    for i in ids:
        if re.search(r'(?<![A-Za-z0-9-])' + re.escape(i) + r'(?![A-Za-z0-9-])', text):
            out.add(i)
    return out

graph = {r['id']: refs(r['dep']) - {r['id']} for r in rows}

def reach(seed):
    """Rows that transitively depend on seed (reverse closure)."""
    hit, frontier = set(), {seed}
    while frontier:
        nxt = {n for n, d in graph.items() if n not in hit and d & frontier}
        hit |= nxt
        frontier = nxt
    return hit

q1, q2 = reach('Q-S2-1'), reach('Q-S2-2')
dep_q = q1 | q2
groups = {}
for r in rows:
    g = r['group'].split(' ')[0]
    groups.setdefault(g, []).append(r)

print()
print('group | rows | owners | IRR-owned rows | depends on Q-S2-1/Q-S2-2 (transitive) | row IDs')
for g in sorted(groups, key=lambda x: int(x[1:])):
    rs = groups[g]
    owners = sorted({re.split(r'[ (/;]', r['owner'])[0] for r in rs})
    irr = [r['id'] for r in rs if r['owner'].startswith('IRR')]
    dq = [r['id'] for r in rs if r['id'] in dep_q]
    print(f"{g} | {len(rs)} | {','.join(owners)} | {','.join(irr) or '-'} | {len(dq)}/{len(rs)} {('(' + ','.join(dq) + ')') if dq else ''} | {', '.join(r['id'] for r in rs)}")

print()
print('Items that do NOT transitively depend on Q-S2-1 or Q-S2-2 (independent of the S2 rulings):')
FREE_TEXT = {'IRR-PROC', 'FINAL'}  # dependencies are free text (rulings / all G2-G13); not parsed
indep = [r['id'] for r in rows if r['id'] not in dep_q and r['id'] not in ('Q-S2-1', 'Q-S2-2') and r['id'] not in FREE_TEXT]
print(', '.join(indep))
print('CAVEAT: parsed from explicit row IDs only. Free-text dependencies (IRR-PROC, FINAL) are excluded from this list and must be read from Table 1. E8 depends on Q-P1 (QP1), which is itself independent of Q-S2-1/Q-S2-2.')
print()
print('Rows that depend on S2-ORIG (host-original retrieval):', sorted(n for n, d in graph.items() if 'S2-ORIG' in d) or 'NONE')
print('Rows that depend on IPD-S2REC:', sorted(n for n, d in graph.items() if 'IPD-S2REC' in d) or 'NONE')
print('Rows that depend on Q-B5:', sorted(n for n, d in graph.items() if 'Q-B5' in d) or 'NONE')
print()
print('IRR-owned rows (all groups):')
for r in rows:
    if r['owner'].startswith('IRR'):
        print(f"  {r['n']:>2} {r['id']:<10} {r['group'].split(' (')[0]:<4} status={r['status'][:40]!r} next={r['next'][:60]!r}")
