#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, zipfile, re, sys
ROOT=Path(__file__).resolve().parent
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
expected={
 'earlier_capture.zip':'950857083cb73295cd3a1da1ac6f339e1adce8f6f210fdd98ec0efb4dc026146',
 'root_safe_capture.zip':'1294c4d28713a38770da4e8b93d1a96b01b5379dda39534af2723a3436a42571',
 'captured_root_safe_instrument.ps1':'804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7'
}
errors=[]
for name,digest in expected.items():
 p=ROOT/name
 if not p.is_file(): errors.append(f'missing: {name}')
 elif sha(p)!=digest: errors.append(f'sha256 mismatch: {name}: {sha(p)} != {digest}')
with zipfile.ZipFile(ROOT/'earlier_capture.zip') as z:
 m=[n for n in z.namelist() if n.endswith('SHA256SUMS.txt')][0]
 for line in z.read(m).decode('utf-8','replace').splitlines():
  hit=re.match(r'^([0-9a-fA-F]{64})\s+(.+?)\s*$',line)
  if not hit: continue
  want,name=hit.groups(); candidates=[n for n in z.namelist() if n.endswith('/'+name)]
  if not candidates: errors.append('earlier manifest missing file: '+name)
  elif hashlib.sha256(z.read(candidates[0])).hexdigest().lower()!=want.lower(): errors.append('earlier manifest hash mismatch: '+name)
with zipfile.ZipFile(ROOT/'root_safe_capture.zip') as z:
 names=[n for n in z.namelist() if not n.endswith('/')]
 if any(n.endswith('SHA256SUMS.txt') for n in names): print('root-safe manifest present')
 else: print('NOTE: root-safe ZIP has no SHA256SUMS.txt')
print('Earlier archive, root-safe archive and captured instrument identity checks:')
for n,h in expected.items(): print(f'  {n}: {sha(ROOT/n)}')
if errors:
 print('FAIL')
 for e in errors: print(' -',e)
 sys.exit(1)
print('PASS: packaged input hashes and earlier archive manifest verified')
