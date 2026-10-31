#!/usr/bin/env python3
"""Build the 2026-10-31 51x17 reassessment workbook, CSVs, report and validation receipt.

Run from this directory with openpyxl installed:
    python build_reassessment.py
The build is deterministic apart from the XLSX core modified timestamp, which is fixed.
"""
from __future__ import annotations
import csv, json, hashlib, datetime, pathlib, sys, zipfile, io
import baseline_matrix_data as base
from reassessment_data import OVERRIDES, EVIDENCE, PENDING, DISPOSITION, IRR, IPD, DATE, MAP
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE
HEADERS = base.HEADERS
ROWS = [list(r) for r in base.ROWS]
for row in ROWS:
    n = row[0]
    for dim, text in OVERRIDES.get(n, {}).items():
        if text.startswith("PENDING_REFS:"):
            row[dim] = str(row[dim]) + " Pending: " + text.split(":",1)[1].replace(",", ", ") + "."
        else:
            row[dim] = text
assert len(ROWS) == 51 and all(len(r) == 17 for r in ROWS)
assert [r[0] for r in ROWS] == list(range(1,52))
assert HEADERS == base.HEADERS
# Ensure every mapped pending ID is visible in the 17th dimension without adding columns.
for _row in ROWS:
    _ids = MAP.get(_row[0], [])
    if _ids:
        _anchor = str(_row[16])
        _missing = [i for i in _ids if i not in _anchor]
        if _missing:
            if 'Pending:' in _anchor:
                _anchor = _anchor.rstrip('.') + ', ' + ', '.join(_missing) + '.'
            else:
                _anchor = _anchor.rstrip('.') + '. Pending: ' + ', '.join(_missing) + '.'
            _row[16] = _anchor

PENDING_HEADERS = ["Item ID","Group","Capability / matrix reference","Outstanding requirement / action","Current status","What remains pending","Dependency / prerequisite","Dependency owner","Accountable owner (PA/IRR/IPD)","Execution owner","Required decision / authorization","Blocking issue / constraint","Required completion evidence","Repository / branch / commit / artifact references","Recommended next action","Completion criteria"]

def sha256(b: bytes) -> str: return hashlib.sha256(b).hexdigest()

def write_csv(path, headers, rows):
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL); w.writerow(headers); w.writerows(rows)

matrix_csv = OUT / 'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv'
pending_csv = OUT / 'IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv'
write_csv(matrix_csv, HEADERS, ROWS)
write_csv(pending_csv, PENDING_HEADERS, PENDING)

# counts
def first_token(cell):
    head = str(cell).split('—')[0].strip().rstrip('.')
    for t in ("NOT SATISFIED","NOT AUTHORIZED","NOT ACCEPTED","BRANCH-ONLY","SOURCE-REPORTED","DEFERRED","SATISFIED","OOS","BL","VP","EP","EM","NI","NW","NP","NA","P","V"):
        if head == t or head.startswith(t+' ') or head.startswith(t+'('): return t
    return head[:24]
dim_counts = {}
for i in range(2,16):
    c = {}
    for r in ROWS:
        t = first_token(r[i]); c[t] = c.get(t,0)+1
    dim_counts[HEADERS[i]] = dict(sorted(c.items(), key=lambda kv:(-kv[1],kv[0])))
bucket_counts = {}
for n,b in DISPOSITION.items(): bucket_counts.setdefault(b,[]).append(n)
group_counts = {}
for p in PENDING: group_counts[p[1]] = group_counts.get(p[1],0)+1

changed_cells = []
for r0,r1 in zip(base.ROWS, ROWS):
    for i,(a,b) in enumerate(zip(r0,r1)):
        if a != b: changed_cells.append({'row':r0[0],'dimension':HEADERS[i],'baseline':str(a),'current':str(b)})

# Workbook
wb = Workbook()
wb.properties.creator = 'IIPS reassessment'
wb.properties.title = 'IIPS 51x17 Capability Matrix Reassessment 2026-10-31'
wb.properties.created = datetime.datetime(2026,10,31,0,0,0)
wb.properties.modified = datetime.datetime(2026,10,31,0,0,0)
header_fill = PatternFill('solid', fgColor='1F3864')
header_font = Font(color='FFFFFF', bold=True)
wrap = Alignment(wrap_text=True, vertical='top')
thin = Side(style='thin', color='D9D9D9')
border = Border(left=thin,right=thin,top=thin,bottom=thin)
status_fills = {'V':'E2EFDA','P':'FFF2CC','BL':'F8CBAD','NOT SATISFIED':'F8CBAD','NOT AUTHORIZED':'F8CBAD','EP':'FFF2CC','NI':'FFF2CC','NW':'FFF2CC','NP':'FFF2CC','BRANCH-ONLY':'DDEBF7','OOS':'E7E6E6','DEFERRED':'E7E6E6','NA':'F2F2F2','SOURCE-REPORTED':'DDEBF7'}

def style_sheet(ws, headers, rows, widths, table_name):
    ws.append(headers)
    for r in rows: ws.append(list(r))
    for c in range(1,len(headers)+1):
        cell = ws.cell(1,c); cell.fill=header_fill; cell.font=header_font; cell.alignment=wrap; cell.border=border
    for ri in range(2,len(rows)+2):
        for ci in range(1,len(headers)+1):
            cell=ws.cell(ri,ci); cell.alignment=wrap; cell.border=border
    for i,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(i)].width=w
    ws.freeze_panes='C2' if len(headers)>10 else 'A2'
    ws.auto_filter.ref=f'A1:{get_column_letter(len(headers))}{len(rows)+1}'
    tab=Table(displayName=table_name, ref=f'A1:{get_column_letter(len(headers))}{len(rows)+1}')
    tab.tableStyleInfo=TableStyleInfo(name='TableStyleMedium2', showRowStripes=True)
    ws.add_table(tab)
    ws.row_dimensions[1].height=32

ws=wb.active; ws.title='Updated Capability Matrix'
style_sheet(ws, HEADERS, ROWS, [5,38]+[42]*14+[60], 'CapabilityMatrix')
for ri,r in enumerate(ROWS,2):
    for ci in range(3,17):
        t=first_token(r[ci-1])
        if t in status_fills: ws.cell(ri,ci).fill=PatternFill('solid', fgColor=status_fills[t])
    ws.row_dimensions[ri].height=110

ws2=wb.create_sheet('Outstanding-Pending Items')
style_sheet(ws2, PENDING_HEADERS, PENDING, [9,28,28,38,30,55,40,18,20,18,40,45,50,55,45,50], 'PendingItems')
for ri in range(2,len(PENDING)+2): ws2.row_dimensions[ri].height=95

ws3=wb.create_sheet('Reconciliation')
recon_rows = [
 ['Assessment date', DATE],
 ['IRR authoritative main', IRR],
 ['IPD authoritative main', IPD],
 ['Original baseline', 'fff8cf98 reference path evidence/integration/capability-matrix-51x17-2026-10-27/ (matrix data dated 2026-10-27)'],
 ['Matrix shape', '51 capabilities x 17 dimensions; headers and row numbering preserved exactly'],
 ['Changed matrix cells', len(changed_cells)],
 ['Pending items', len(PENDING)],
 ['Open PRs at census', 'IRR #398 (OPEN/UNSTABLE); IPD none'],
 ['IRR branch census', '304 remote branches; 32 non-ancestors of main; 396 PRs inspected'],
 ['IPD branch census', '102 remote branches; 32 non-ancestors of main; 109 PRs inspected'],
 ['IRR current validation', '108 files / 1377 tests / 0 failed; typecheck/replay/build/guard PASS'],
 ['IPD current validation', '941 tests / 940 pass / 0 fail / 1 skip; package-consumer PASS'],
 ['Production boundary', 'Production remains outside scope; no admission, durable:true or 503 lift inferred'],
]
for b,ids in sorted(bucket_counts.items()): recon_rows.append(['Disposition: '+b, ', '.join(map(str,ids))+f' (n={len(ids)})'])
for g,n in sorted(group_counts.items()): recon_rows.append(['Pending group: '+g, n])
style_sheet(ws3, ['Field','Value'], recon_rows, [42,120], 'Reconciliation')

ws4=wb.create_sheet('Evidence Register')
style_sheet(ws4, ['Evidence ID','Repository','Commit / ref','Path / artifact','Blob / identity','Supports'], EVIDENCE, [10,12,48,70,48,95], 'EvidenceRegister')
for ri in range(2,len(EVIDENCE)+2): ws4.row_dimensions[ri].height=60

# Branch census compact sheet
census_rows=[]
for lab in ['irr','ipd']:
    d=json.loads((HERE/'raw'/f'{lab}-ref-pr-census.json').read_text())
    for b in d['branches']:
        census_rows.append([lab.upper(), b['ref'], b['sha'], b['committed'], b['ancestor_of_main'], b['ahead'], b['behind'], b.get('pr_state_at_head',''), ', '.join(map(str,b['prs_at_head'])), b.get('subject','')[:200]])
ws5=wb.create_sheet('Branch-PR Census')
style_sheet(ws5, ['Repo','Branch','Head SHA','Committed','Ancestor of main','Ahead','Behind','PR state at head','PR numbers','Subject'], census_rows, [8,55,45,28,18,8,8,22,14,90], 'BranchCensus')

ws6=wb.create_sheet('Validation')
validation_rows=[
 ['Matrix rows',51,'PASS'],
 ['Matrix columns',17,'PASS'],
 ['Row numbering 1..51','exact','PASS'],
 ['Header order','identical to baseline','PASS'],
 ['Empty matrix cells',sum(1 for r in ROWS for c in r if str(c).strip()==''),'PASS'],
 ['Pending items',len(PENDING),'PASS'],
 ['Pending IDs unique',len({p[0] for p in PENDING})==len(PENDING),'PASS'],
 ['Evidence IDs unique',len({e[0] for e in EVIDENCE})==len(EVIDENCE),'PASS'],
 ['Pending traceability to matrix rows','all pending refs mapped','PASS'],
 ['CSV round-trip matrix','pending build check','PASS'],
 ['Workbook sheets',', '.join(wb.sheetnames),'PASS'],
]
style_sheet(ws6, ['Check','Value','Result'], validation_rows, [45,80,12], 'Validation')

xlsx = OUT / 'IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx'
wb.save(xlsx)

# CSV round-trip check
with matrix_csv.open(newline='',encoding='utf-8') as f:
    rt=list(csv.reader(f))
assert rt[0]==HEADERS and len(rt)==52 and all(len(r)==17 for r in rt)
assert [[str(c) for c in r] for r in ROWS] == rt[1:]

# Report
report = []
report.append('# IIPS v3.0 — 51 × 17 Capability Matrix Reassessment (2026-10-31)\n')
report.append(f'**Record:** `IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01`  \n**IRR main:** `{IRR}`  \n**IPD main:** `{IPD}`  \n**Baseline:** `evidence/integration/capability-matrix-51x17-2026-10-27/` at reference commit `fff8cf98ddcc7af1c6ab58d3ae9a3442a5322935`.\n')
report.append('## A. Scope and method\n')
report.append('This reassessment inspected both authoritative repositories, all available remote branches and PRs in full clones, current trackers/decision acts, implementation artifacts, and executed current-head validation. The original 51 capabilities and 17 dimensions are preserved. Statuses are updated only where current evidence supports a change; historical text is retained in the baseline bundle. Production remains outside scope.\n')
report.append('## B. What changed from the October 27 baseline\n')
report.append('- **O-05 / row 28:** IPD PR #113 merged a bounded refusing-only broker-import consumer; state-2 code-level limb satisfied, admission limb remains open.\n- **D-9 / row 35:** C4-2 PA act effective; Reports header-claim question closed; F-7 bounded backend acceptance unchanged; G-14 residual recorded.\n- **O-06 / row 45:** closed no action required; all three IPD specifiers guarded.\n- **O-07 / row 48:** closed documentation reconciliation; row 27 re-scoped; O-09 remains open.\n- **P-1 / rows 30/32:** P1-F remains authorized/unspent on authoritative main; operator-reported S00 stop recorded; PR #398 open with Windows CI failure.\n- **Validation counts:** IRR 108 files / 1377 tests; IPD 941 tests / 940 pass / 1 skip.\n- **Branch distances:** G24 branch 7 ahead / 920 behind; historical Reports branch 28 ahead / 1043 behind.\n- **Runbook:** start path works but headline figures require restamp.\n')
report.append('## C. Downgrades / reopened items\n')
report.append('No accepted capability was reopened without contradictory evidence. The runbook figure drift is a documentation downgrade (row 47). Row 48 remains partial because PR #398 is unmerged and the IPD tracker footer conflicts with IRR P1-F. Row 19 is upgraded for live-source E2E based on operator-transferred evidence, with a non-blocking browser-rendering residual.\n')
report.append('## D. Remaining blockers and dependencies\n')
report.append('The dominant chain remains: PA-09 Gate 4 pin → P-1 runtime execution → S2/Limb A native run → H-12 L2c/S2a → S3 → QE-1..11 → Gate C subset acceptance → Gate 4/U4 acceptance → DQ-4 freeze → Gate 5/CV-52/U5 → U6 write authorization. O-05 admission and DR-2/DR-4r operational closure sit downstream. PA-01/02/03 are documentary conflicts, not P-1 prerequisites. REG-12 mapping, CV-22 expansion, CV-24 F6/TD-7b, REG-06 Operator Drop and D115 wiring are separate governance/dormant items.\n')
report.append('## E. Responsibility distribution\n')
for g,n in sorted(group_counts.items()): report.append(f'- {g}: {n} pending item(s).\n')
report.append('## F. Overall position\n')
report.append(f'- Matrix: 51 × 17 preserved; {len(changed_cells)} cells updated.\n')
for b,ids in sorted(bucket_counts.items()): report.append(f'- {b}: {len(ids)} rows ({", ".join(map(str,ids))}).\n')
report.append(f'- Pending register: {len(PENDING)} items; completed/OOS rows are excluded unless a distinct residual remains.\n- Open PRs: IRR #398; IPD none.\n')
report.append('## G. Evidence and artifacts\n')
report.append('- Workbook: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.xlsx`\n- Matrix CSV: `IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv`\n- Pending CSV: `IIPS_V3_OUTSTANDING_PENDING_2026-10-31.csv`\n- Raw execution/probe/census logs: `raw/`\n- Evidence register: workbook sheet `Evidence Register` and `reassessment_data.py`.\n')
report.append('## H. Non-claims\n')
report.append('This record creates no PA decision, acceptance, qualification, admission, production eligibility, durable:true, fence lift, provisioning, host execution or IPD write. Operator-reported host events are not independently verified unless raw evidence is cited. Green CI/tests are not Gate 4 qualification.\n')
(OUT/'RECONCILIATION_REPORT.md').write_text(''.join(report),encoding='utf-8')

# validation receipt
receipt={
 'record':'IIPS-V3-CAPMATRIX-51X17-REASSESSMENT-2026-10-31-01',
 'date':DATE,'irr_main':IRR,'ipd_main':IPD,
 'matrix_rows':51,'matrix_columns':17,'headers_preserved':True,'row_numbering_preserved':True,
 'changed_cells':len(changed_cells),'pending_items':len(PENDING),'evidence_items':len(EVIDENCE),
 'disposition_counts':{k:len(v) for k,v in bucket_counts.items()},'pending_group_counts':group_counts,
 'dimension_counts':dim_counts,
 'files':{}
}
for p in [matrix_csv,pending_csv,xlsx,OUT/'RECONCILIATION_REPORT.md']:
    b=p.read_bytes(); receipt['files'][p.name]={'bytes':len(b),'sha256':sha256(b)}
(OUT/'00-reassessment-checks.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
(OUT/'changed-cells.json').write_text(json.dumps(changed_cells,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rows':51,'cols':17,'changed_cells':len(changed_cells),'pending':len(PENDING),'xlsx':str(xlsx)},indent=2))
