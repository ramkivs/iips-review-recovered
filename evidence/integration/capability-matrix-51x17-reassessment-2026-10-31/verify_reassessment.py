#!/usr/bin/env python3
"""Verify the reassessment bundle locally. Requires openpyxl.

    python verify_reassessment.py

Checks shape, headers, numbering, CSV/XLSX consistency, pending traceability,
evidence IDs, filters/tables, and SHA256SUMS if present. No network required.
"""
from __future__ import annotations
import csv, hashlib, json, pathlib, sys
from openpyxl import load_workbook
import baseline_matrix_data as base

HERE = pathlib.Path(__file__).resolve().parent
fails=[]
def check(name, ok, detail=''):
    print(('PASS' if ok else 'FAIL')+': '+name+((' — '+detail) if detail else ''))
    if not ok: fails.append(name)

xlsx=HERE/'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx'
mcsv=HERE/'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv'
pcsv=HERE/'IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv'
wb=load_workbook(xlsx)
ws=wb['Updated Capability Matrix']; wp=wb['Outstanding-Pending Items']
check('workbook sheets', wb.sheetnames[:2]==['Updated Capability Matrix','Outstanding-Pending Items'], ', '.join(wb.sheetnames))
check('matrix shape 51x17', ws.max_row==52 and ws.max_column==17, f'{ws.max_row-1}x{ws.max_column}')
headers=[ws.cell(1,c).value for c in range(1,18)]
check('headers preserved', headers==base.HEADERS)
rows=[[ws.cell(r,c).value for c in range(1,18)] for r in range(2,53)]
check('row numbering', [r[0] for r in rows]==list(range(1,52)))
check('no empty matrix cells', all(str(c).strip() for r in rows for c in r))
with mcsv.open(newline='',encoding='utf-8') as f: mr=list(csv.reader(f))
check('matrix CSV shape', len(mr)==52 and all(len(r)==17 for r in mr))
check('matrix CSV/XLSX equal', mr[0]==headers and [[str(c) for c in r] for r in rows]==mr[1:])
with pcsv.open(newline='',encoding='utf-8') as f: pr=list(csv.reader(f))
check('pending CSV shape', len(pr)==wp.max_row and all(len(r)==16 for r in pr), f'{len(pr)-1} items x 16')
pids=[r[0] for r in pr[1:]]
check('pending IDs unique', len(pids)==len(set(pids)))
anchors=' '.join(str(r[16]) for r in rows)
missing=[i for i in pids if i not in anchors]
check('pending traceability', not missing, ','.join(missing))
check('matrix filter', ws.auto_filter.ref=='A1:Q52')
check('pending filter', wp.auto_filter.ref==f'A1:P{wp.max_row}')
check('matrix table', 'CapabilityMatrix' in ws.tables)
check('pending table', 'PendingItems' in wp.tables)
er=wb['Evidence Register']; eids=[er.cell(r,1).value for r in range(2,er.max_row+1)]
check('evidence IDs unique', len(eids)==len(set(eids)))
# every evidence ID cited in matrix/pending/report exists
cited=set()
import re
text=anchors+' '+' '.join(' '.join(str(c) for c in r) for r in pr[1:])+(HERE/'RECONCILIATION_REPORT.md').read_text()
for m in re.findall(r'E\d{3}', text): cited.add(m)
check('cited evidence IDs exist', cited.issubset(set(eids)), ','.join(sorted(cited-set(eids))))
sums=HERE/'SHA256SUMS.txt'
if sums.exists():
    ok=True; bad=[]
    for line in sums.read_text().splitlines():
        if not line.strip(): continue
        h,rel=line.split('  ',1); p=HERE/rel
        if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=h: ok=False; bad.append(rel)
    check('SHA256SUMS', ok, ','.join(bad))
p08=next(r for r in pr[1:] if r[0]=='P-08')
check('P-08 completed/reconciled', p08[4]=='COMPLETED — IPD REG-06; IRR RECONCILED' and p08[1]=='Completed / reconciled items')
check('P-08 current IPD merge/PR/head/blob', all(x in p08[13] for x in ['eb9289222e2bdfd0e79381d4d81f7f81715e019b','PR #117','5b2c03dc8888aa40a4dd967ef6e7f3b76731c01e','c1c666149c2d907026df3d9a2d184d2b9a2383c0']))
r29=next(r for r in rows if r[0]==29)
check('row 29 IPD completed and IRR reconciled', r29[3].startswith('V — IPD product admission and implementation COMPLETED') and 'IRR RECONCILED' in r29[3] and r29[13].startswith('V — IPD REG-06 admission/implementation completed'))
check('row 29 current technical evidence', './operator-drop' in r29[4] and 'durable' in r29[7].lower() and 'series-qualified' in r29[6] and '987/986/0/1' in r29[9])
check('row 29 not active-pending anchor', 'Completed/reconciled: P-08' in r29[16] and 'Pending: P-08' not in r29[16] and 'Resolved governance deferral: P-08' not in r29[16])
check('row 29 separate boundaries', 'Production/AD-17/M-2 not authorized' in r29[12] and 'O-05' in r29[12] and 'P-1' in r29[12])
check('P-08 owners', p08[8].startswith('IRR') and p08[9].startswith('IPD'))
check('six worksheets', wb.sheetnames==['Updated Capability Matrix','Outstanding-Pending Items','Reconciliation','Evidence Register','Branch-PR Census','Validation'])
formula_cells=[(ws.title,c.coordinate) for ws in wb.worksheets for row in ws.iter_rows() for c in row if c.data_type=='f']
check('formula inventory', formula_cells==[], 'no formulas in source-derived workbook; CSV/XLSX equality is authoritative')
error_cells=[(ws.title,c.coordinate,c.value) for ws in wb.worksheets for row in ws.iter_rows() for c in row if c.data_type=='e']
check('no worksheet error cells', not error_cells)
check('all tables/filters/freeze panes', all(len(ws.tables)==1 and ws.auto_filter.ref and ws.freeze_panes for ws in wb.worksheets))
check('overall', not fails)
sys.exit(1 if fails else 0)
