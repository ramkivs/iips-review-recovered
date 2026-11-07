/**
 * WI-6 — the work item that ends in "no".
 *
 * `evidence/real-issuer/WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07/` records a search that did not find a qualifying nil for a
 * second Technology issuer. A negative work item is the easiest kind to fake in either direction: by promoting a dash, an
 * absent caption or a scoped sentence into a nil, or by quietly deleting the candidates that did not work out. This test
 * holds the bundle to the honest version of events:
 *
 *   1. nothing was accepted — the candidate register has no accepted verdict, and the bundle carries no dataset, payload
 *      or nil declaration of its own;
 *   2. the two candidates whose filings were read stay rejected on their own numbers — Newgen's borrowings are non-zero
 *      and Sasken's share-class sentence is the scoped construction withdrawn in WI-5, never a nil;
 *   3. the candidates that could not be read are recorded as blocked with the exact HTTP failures, not as findings;
 *   4. the historical bundles are untouched: WI-3's and WI-5's own `digests.json` still verify from this checkout;
 *   5. the register says the objective is unmet and leaves `L-036` and `L-035` where they were.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const register = readJson('candidates.json');
const candidates = register.candidates as Record<string, any>[];
const REGISTER_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'), 'utf8');

const verifyBundleDigests = (bundleName: string) => {
  const dir = join(EVIDENCE, bundleName);
  const manifest = JSON.parse(readFileSync(join(dir, 'digests.json'), 'utf8')) as Record<string, any>;
  const files = Object.keys(manifest.files).sort();
  assert.ok(files.length > 0, `${bundleName}: no files digested`);
  for (const file of files) {
    const bytes = readFileSync(join(dir, file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.files[file].sha256, `${bundleName}/${file} digest drift`);
  }
  return files.length;
};

describe('WI-6 — no qualifying nil was found, and nothing pretends otherwise', () => {
  test('the candidate register accepts nobody and names the two issuers excluded by instruction', () => {
    assert.equal(register.entity, undefined);
    assert.equal(register.result.accepted, 0);
    assert.equal(register.result.decision, 'NO_QUALIFYING_NIL_FOUND');
    assert.match(register.result.consequence, /no nil declared/);
    const excluded = (register.excludedByInstruction as Record<string, any>[]).map((e) => e.legalName);
    assert.deepEqual(excluded, ['Infosys Limited', 'eClerx Services Limited']);
    assert.equal(candidates.length, register.result.totalCandidates);
    assert.equal(register.result.examinedThisPass + register.result.carriedForwardFromWI5 + register.result.blocked, register.result.totalCandidates);
    for (const candidate of candidates) {
      assert.notEqual(candidate.verdict, 'ACCEPTED', `${candidate.legalName} must not be accepted`);
      assert.ok(String(candidate.reason).length >= 30, `${candidate.legalName} must state why`);
      assert.ok(Array.isArray(candidate.sector) || typeof candidate.sector === 'string');
    }
  });

  test('the bundle holds no dataset, no payload and no nil of its own', () => {
    assert.equal(existsSync(join(BUNDLE, 'ingest-input')), false);
    assert.equal(existsSync(join(BUNDLE, 'artifact')), false);
    const all = ['README.md', 'candidates.json', 'runs/commands.txt', 'source/access-blockers.txt'].map((p) => read(p)).join('\n');
    assert.doesNotMatch(all, /^\s*(PREFERENCE_CAPITAL|LONG_TERM_BORROWINGS|SHORT_TERM_BORROWINGS)\s*=\s*NIL:/m);
    assert.match(flat(all), /no dataset was ingested/i);
    assert.match(flat(all), /no nil was declared/i);
  });

  test('Newgen stays rejected on its own numbers', () => {
    const candidate = candidates.find((c) => c.legalName.startsWith('Newgen'));
    assert.equal(candidate!.verdict, 'REJECTED');
    assert.equal(candidate!.evidenceClass, 'PRIMARY_TEXT_READ');
    const extract = flat(read('source', 'newgen-fy24-note-19-borrowings.txt'));
    assert.match(extract, /Current maturities of deferred payment liabilities 219\.92 203\.50/);
    assert.match(extract, /Deferred payment liabilities - 220\.05/);
    assert.match(extract, /not a nil candidate/);
    assert.doesNotMatch(extract, /NIL_BY_DISCLOSURE/);
  });

  test('Sasken\'s equity-class sentence is recorded as the scoped construction, never as a nil', () => {
    const candidate = candidates.find((c) => c.legalName.startsWith('Sasken'));
    assert.equal(candidate!.verdict, 'REJECTED');
    const extract = flat(read('source', 'sasken-fy24-note-15-equity-share-capital.txt'));
    assert.match(extract, /The Company has only one class of equity shares having a par value of ` 10 per share\./);
    assert.match(extract, /does NOT establish/i);
    assert.match(extract, /preference share capital/i);
    assert.match(extract, /withdrawn as a nil in WI-5/i);
    const capital = flat(read('source', 'sasken-fy24-note-32-capital-management.txt'));
    assert.match(capital, /adjusted net debt is defined as total liabilities less cash and cash equivalents/);
  });

  test('the unreadable filings are recorded as blocked, with the exact statuses', () => {
    assert.equal(candidates.find((c) => c.legalName.startsWith('Zensar'))!.verdict, 'BLOCKED_NOT_ESTABLISHED');
    assert.equal(candidates.find((c) => c.legalName.startsWith('Birlasoft'))!.verdict, 'REJECTED');
    const blockers = read('source', 'access-blockers.txt');
    assert.match(blockers, /HTTP 403 Forbidden/);
    assert.match(blockers, /Anonymous caller does not have storage\.objects\.get access/);
    assert.match(blockers, /HTTP 404/);
    assert.match(blockers, /reference #18\.1668dc17\.1794028603\.32167b5a/);
    assert.match(flat(blockers), /never "probably nil"/);
    assert.match(flat(blockers), /accepted on the strength of a secondary source/);
  });

  test('the historical bundles are untouched — WI-3 and WI-5 still verify against their own manifests', () => {
    const wi3 = verifyBundleDigests('WI3-BORROWINGS-NIL-2026-11-06');
    const wi5 = verifyBundleDigests('WI5-PREFERENCE-CAPITAL-2026-11-07');
    assert.ok(wi3 >= 15, `WI-3 manifest looks short: ${wi3}`);
    assert.ok(wi5 >= 20, `WI-5 manifest looks short: ${wi5}`);
    const wi5Payload = readFileSync(join(EVIDENCE, 'WI5-PREFERENCE-CAPITAL-2026-11-07', 'artifact', 'assessment-payload-wi5.json'), 'utf8');
    assert.equal(JSON.parse(wi5Payload).fundamentals.capitalStructure.preferenceCapital.presence, 'MISSING');
  });

  test('the register records the negative outcome without moving any status', () => {
    assert.match(REGISTER_MD, /## 17\.11 WI-6/);
    const section = REGISTER_MD.slice(REGISTER_MD.indexOf('## 17.11'));
    assert.match(section, /Outcome: negative/);
    assert.match(section, /no nil declared/);
    assert.match(flat(section), /L-036` remains \*\*`PARTIALLY RESOLVED`\*\*/);
    assert.match(flat(section), /L-035` remains \*\*`OPEN`\*\*/);
    assert.match(section, /Zensar/);
  });

  test('every committed file in the bundle still hashes to the digest recorded beside it', () => {
    const digests = readJson('digests.json');
    const files = Object.keys(digests.files).sort();
    assert.equal(digests.fileCount, files.length);
    assert.ok(files.length >= 7, `expected the whole bundle, found ${files.length}`);
    for (const file of files) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), digests.files[file].sha256, `${file} digest drift`);
      assert.equal(bytes.byteLength, digests.files[file].bytes, `${file} byte-count drift`);
    }
  });
});
