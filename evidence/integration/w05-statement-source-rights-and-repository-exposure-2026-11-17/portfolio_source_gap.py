#!/usr/bin/env python3
"""Which rows of the committed 68-row holdings surface have an admitted statement source?

Read-only. Compares the ISIN column of the committed surface with every ISIN named in the
real-issuer bundles. It writes counts and the bundle-side identifiers only: no holding name,
ISIN, quantity or value of the portfolio is copied into its output.

  python3 portfolio_source_gap.py           write portfolio-source-gap.json
  python3 portfolio_source_gap.py --check   compare with the committed file
"""
import csv, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = subprocess.check_output(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], text=True).strip()
SURFACE = 'evidence/integration/b04-dhan-isin-nse-2026-11-06/source.csv'
OUT = os.path.join(HERE, 'portfolio-source-gap.json')
# The three issuers of decision O3, as their bundles identify them (ingest-input/roster.json).
ADMITTED = {
    'Infosys Limited': 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input/roster.json',
    'Marico Limited': 'evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input/roster.json',
    'KEC International Limited': 'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input/roster.json',
}
ISIN = re.compile(r'\bIN[EF][0-9A-Z]{9}\b')
RECORDS = [
    'docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md',
    'docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md',
    'docs/integration/IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md',
    'docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md',
]


def sha(path):
    with open(os.path.join(ROOT, path), 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def build():
    with open(os.path.join(ROOT, SURFACE), encoding='utf-8', newline='') as fh:
        rows = list(csv.DictReader(fh))
    held = {r['ISIN Code'].strip() for r in rows}
    out = subprocess.run(['git', '-C', ROOT, 'grep', '-h', '-o', '-E', ISIN.pattern, '--', 'evidence/real-issuer'],
                         capture_output=True, text=True).stdout.split()
    bundle_isins = sorted(set(out))
    admitted = {}
    for name, roster in ADMITTED.items():
        with open(os.path.join(ROOT, roster), encoding='utf-8') as fh:
            admitted[name] = {'roster': roster, 'isins': sorted(set(ISIN.findall(fh.read())))}
    admitted_isins = sorted({i for v in admitted.values() for i in v['isins']})
    return {
        'schema': 'w05-portfolio-source-gap/1',
        'surface': {'path': SURFACE, 'sha256': sha(SURFACE), 'dataRows': len(rows), 'distinctIsins': len(held)},
        'admittedIssuers': admitted,
        'isinsNamedInTheRealIssuerBundles': bundle_isins,
        'surfaceRowsWithAnAdmittedIssuer': len(held & set(admitted_isins)),
        'surfaceRowsWithAnyBundleIssuer': len(held & set(bundle_isins)),
        'surfaceRowsWithoutAnAdmittedSource': len(held - set(admitted_isins)),
        'recordsLeftUnchanged': {p: {'sha256': sha(p),
                                     'blob': subprocess.check_output(['git', '-C', ROOT, 'rev-parse', 'HEAD:' + p], text=True).strip()}
                                 for p in RECORDS},
    }


def main():
    text = json.dumps(build(), indent=1, ensure_ascii=False) + '\n'
    if '--check' in sys.argv:
        with open(OUT, encoding='utf-8') as fh:
            same = fh.read() == text
        print('portfolio-source-gap.json equal to a fresh build:', same)
        sys.exit(0 if same else 1)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print(text)


if __name__ == '__main__':
    main()
