#!/usr/bin/env python3
"""Read-only verification for IIPS-V3-CAP03-P1C-P1D-EVIDENCE-RECONCILIATION-CORRECTION-2026-10-27-01.

Verifies, from the bytes actually present in the checkout:
  1. the corrected reconciliation package manifest (all 7 listed files),
  2. that the ORIGINAL, UNMODIFIED verify_assessment.py now passes,
  3. that the two capture archives are byte-identical to the identities PR #333 recorded,
  4. that the historical report / assessment.json / verifier were preserved, not edited,
  5. that the v2 instrument identity matches tracker 16.154.8 exactly (64-char digest),
  6. that the malformed 65-char digest appears in no NEW correction record,
  7. that captured_root_safe_instrument.ps1 is the CRLF evidence byte-for-byte and is
     protected by an exact-path '-text' rule.

This script only reads. It invokes nothing, derives no executing instrument, creates no
capture directory, contacts no host, and writes to no repository other than this one.
Exit status is 0 only if every check passes; any mismatch fails closed.
"""
from pathlib import Path
import hashlib, json, subprocess, sys, zipfile

ROOT = Path(__file__).resolve().parents[3]
RECON = ROOT / 'evidence/integration/cap03-p1c-p1d-evidence-reconciliation-2026-10-27'
CORR = Path(__file__).resolve().parent
V2 = ROOT / 'evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1'
V1 = ROOT / 'evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1'
CAP = RECON / 'captured_root_safe_instrument.ps1'
ATTR = ROOT / '.gitattributes'

errors, checks = [], []


def sha(b):
    return hashlib.sha256(b).hexdigest()


def ok(name, cond, detail=''):
    checks.append((name, bool(cond), detail))
    if not cond:
        errors.append('%s%s' % (name, (': ' + detail) if detail else ''))


# ---- 1. corrected reconciliation package manifest -------------------------------------------
man = (RECON / 'SHA256SUMS.txt').read_text(encoding='utf-8').splitlines()
listed = 0
for line in man:
    if not line.strip():
        continue
    parts = line.split()
    if len(parts) < 2:
        errors.append('malformed manifest line: %r' % line)
        continue
    want, name = parts[0], ' '.join(parts[1:]).strip()
    listed += 1
    p = RECON / name
    if not p.is_file():
        errors.append('manifest lists a missing file: %s' % name)
    elif sha(p.read_bytes()).lower() != want.lower():
        errors.append('manifest mismatch: %s listed %s actual %s' % (name, want, sha(p.read_bytes())))
ok('1. reconciliation SHA256SUMS.txt covers 7 files and all match committed bytes',
   listed == 7 and not errors, 'listed=%d' % listed)

# ---- 2. the ORIGINAL verifier, unmodified, must now pass ------------------------------------
vp = RECON / 'verify_assessment.py'
ok('2a. verify_assessment.py preserved at its PR #333 identity',
   sha(vp.read_bytes()) == 'c673f5096d7e77056e679deca6dcd1868a225b1955c23678665d9a845abf3a2f',
   sha(vp.read_bytes()))
r = subprocess.run([sys.executable, str(vp)], capture_output=True, text=True, cwd=str(RECON))
ok('2b. verify_assessment.py PASSES unmodified (exit 0)', r.returncode == 0,
   'exit=%d %s' % (r.returncode, r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr.strip()[:200]))

# ---- 3. capture archives unchanged ------------------------------------------------------------
EA = '950857083cb73295cd3a1da1ac6f339e1adce8f6f210fdd98ec0efb4dc026146'
RA = '1294c4d28713a38770da4e8b93d1a96b01b5379dda39534af2723a3436a42571'
ok('3a. earlier_capture.zip byte-identical to PR #333 identity',
   sha((RECON / 'earlier_capture.zip').read_bytes()) == EA)
ok('3b. root_safe_capture.zip byte-identical to PR #333 identity',
   sha((RECON / 'root_safe_capture.zip').read_bytes()) == RA)
with zipfile.ZipFile(RECON / 'root_safe_capture.zip') as z:
    entry = [n for n in z.namelist() if n.endswith('02-executed-instrument.ps1')][0]
    inner = z.read(entry)

# ---- 4. historical records preserved, not edited ----------------------------------------------
ok('4a. PR #333 reconciliation report preserved byte-for-byte',
   sha((RECON / 'CAP03_P1C_P1D_EVIDENCE_RECONCILIATION_2026-10-27.md').read_bytes())
   == 'aa068ddb1966403348e9098049a36b4723c061a56d8ea11a6940751874253a75')
ok('4b. assessment.json preserved byte-for-byte',
   sha((RECON / 'assessment.json').read_bytes())
   == '0c27c832d19f067c7f14683f0532f60ccead94f3571600c80febfff5358e8578')

# ---- 5. v2 instrument identity matches 16.154.8 exactly ---------------------------------------
V2_SHA = '13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e'
V2_BLOB = '191f5828461286b0f6fcb688b023da5dfc68a265'
b = V2.read_bytes()
gb = subprocess.run(['git', '-C', str(ROOT), 'hash-object', str(V2)], capture_output=True, text=True).stdout.strip()
ok('5a. v2 instrument is 10,990 bytes', len(b) == 10990, str(len(b)))
ok('5b. v2 SHA-256 equals the 64-char digest recorded by 16.154.8', sha(b) == V2_SHA, sha(b))
ok('5c. that digest is exactly 64 hex characters', len(V2_SHA) == 64 and all(c in '0123456789abcdef' for c in V2_SHA))
ok('5d. v2 Git blob equals 191f5828...', gb == V2_BLOB, gb)
ok('5e. v1 original instrument unchanged (eaea3f7f... / 85ac7271...)',
   sha(V1.read_bytes()) == '85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b'
   and len(V1.read_bytes()) == 10231)

# ---- 6. the malformed digest appears in no NEW correction record ------------------------------
MAL = '13783385cb8a7964387868ad96f05956cceb9b7d4ead0488c0cfe72b325e6748e'
hits = [p.name for p in CORR.iterdir() if p.is_file() and MAL in p.read_text(encoding='utf-8', errors='replace')
        and p.name not in ('01-digest-occurrence-census.json', 'verify_correction.py')]
ok('6. malformed 65-char digest appears in no new correction record (census/verifier excepted, where it is the subject)',
   not hits, str(hits))

# ---- 7. byte-preserving evidence storage ------------------------------------------------------
cap = CAP.read_bytes()
ok('7a. captured_root_safe_instrument.ps1 equals the archive original byte-for-byte', cap == inner)
ok('7b. it is 11,257 bytes with CRLF line endings', len(cap) == 11257 and cap.count(b'\r\n') == 214,
   'len=%d crlf=%d' % (len(cap), cap.count(b'\r\n')))
ok('7c. its SHA-256 is the value SHA256SUMS.txt published',
   sha(cap) == '804a832296f326dff5ea1a8b3b0c779c3a7721d2db931e9a462ead648f5f6bd7', sha(cap))
attr = ATTR.read_text(encoding='utf-8')
rule = 'evidence/integration/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/captured_root_safe_instrument.ps1 -text'
ok('7d. .gitattributes carries the exact-path -text rule', rule in attr)
ca = subprocess.run(['git', '-C', str(ROOT), 'check-attr', 'text', '--',
                     'evidence/integration/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/captured_root_safe_instrument.ps1'],
                    capture_output=True, text=True).stdout.strip()
ok('7e. git resolves text=unset for that path', ca.endswith('text: unset'), ca)
staged = subprocess.run(['git', '-C', str(ROOT), 'ls-files', '-s', '--',
                         'evidence/integration/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/captured_root_safe_instrument.ps1'],
                        capture_output=True, text=True).stdout.split()
ok('7f. staged/committed blob is the CRLF blob 8a913f9a...',
   len(staged) > 1 and staged[1] == '8a913f9a7223ef7c6d32d5a5274c84c21e8ec0d0',
   staged[1] if len(staged) > 1 else 'not staged')

print('CAP-03 evidence-reconciliation correction - read-only verification')
print('repository root: %s' % ROOT)
for name, passed, detail in checks:
    print('  [%s] %s%s' % ('PASS' if passed else 'FAIL', name, ('  (%s)' % detail) if detail and not passed else ''))
print('checks: %d  passed: %d  failed: %d' % (len(checks), len(checks) - len(errors), len(errors)))
if errors:
    print('FAIL')
    for e in errors:
        print(' -', e)
    sys.exit(1)
print('PASS: byte-preserving evidence storage restored; original verifier passes unmodified; '
      'historical records and both capture archives preserved; v2 identity confirmed as a valid 64-char digest.')
