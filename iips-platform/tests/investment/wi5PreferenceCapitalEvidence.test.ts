/**
 * WI-5 — the niL that was not there.
 *
 * `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-2026-11-07/` records a real issuer whose audited consolidated statements
 * contain a sentence that reads like a nil declaration — "The Company has only one class of equity shares having a par
 * value of Rs 10 per share." — and no declaration at all. The first pass of this work item recorded that sentence as a
 * `PREFERENCE_CAPITAL` nil; the review withdrew it, because the sentence is scoped by its heading to equity shares and
 * says nothing about preference shares, and because presentation completeness is not a declaration.
 *
 * The failure mode this test guards is a relapse: someone re-reading the bundle, seeing a plausible sentence and a
 * balance sheet with no preference line, and quietly putting the nil back. So the test asserts, from committed bytes
 * only:
 *
 *   1. the input carries no nil cell at all, and the columns that are genuinely empty stay empty rather than zeroed;
 *   2. the filed dash on borrowings is a number (an explicit zero), never re-spelled as a nil;
 *   3. the quotes file classifies every quoted sentence for what it does *not* establish, and records the retraction;
 *   4. the corrected payload says `MISSING`/`NOT_REPORTED` for preference capital at all three observation points, and
 *      contains no `NIL_BY_DISCLOSURE` anywhere;
 *   5. the withdrawn payload still says what it said — it is retained under `artifact/superseded/`, not deleted — so the
 *      retraction is auditable and cannot be mistaken for the current artifact;
 *   6. the persisted payload digests to the value the run recorded, and every committed file hashes to `digests.json`.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI5-PREFERENCE-CAPITAL-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
/** Extracts keep the text layer's line breaks; compare on collapsed whitespace, never on reflowed wording. */
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

const csv = read('ingest-input', 'periods.csv').trimEnd().split('\n');
const header = csv[0].split(',');
const rows = csv.slice(1).map((line) => {
  const cells = line.split(',');
  const record: Record<string, string> = {};
  header.forEach((name, i) => (record[name] = cells[i] ?? ''));
  return record;
});
const byYear = Object.fromEntries(rows.map((r) => [r.fiscal_year, r]));
const quotes = readJson('source', 'quotes.json');
const payload = readJson('artifact', 'assessment-payload-wi5.json');
const correctedRun = readJson('runs', 'cli-wi5-corrected.json');
const readback = readJson('runs', '06-payload-verify.json');

describe('WI-5 — no nil was declared, and the withdrawal is on the record', () => {
  test('the input carries no nil cell at all, and preference capital is empty in every period', () => {
    const nilCells: string[] = [];
    for (const row of rows) {
      for (const column of header) {
        const value = (row[column] ?? '').trim();
        if (value.startsWith('NIL') || value.startsWith('nil')) nilCells.push(`${row.fiscal_year}/${column}`);
      }
    }
    assert.deepEqual(nilCells, []);
    for (const row of rows) assert.equal(row.PREFERENCE_CAPITAL, '');
    assert.equal(quotes.conclusion.preferenceCapitalNilDeclared, false);
  });

  test('the filed dash is an explicit zero, the older periods are numbers, and no borrowings cell is a nil', () => {
    assert.equal(byYear['2024'].LONG_TERM_BORROWINGS, '0');
    assert.equal(byYear['2024'].SHORT_TERM_BORROWINGS, '0');
    assert.equal(byYear['2023'].LONG_TERM_BORROWINGS, '6.77');
    assert.equal(byYear['2023'].SHORT_TERM_BORROWINGS, '3.08');
    assert.equal(byYear['2022'].LONG_TERM_BORROWINGS, '0.50');
    assert.equal(byYear['2022'].SHORT_TERM_BORROWINGS, '0.91');
    for (const row of rows) {
      for (const column of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS']) {
        assert.match(row[column], /^\d+(\.\d+)?$/, `${row.fiscal_year}/${column} must stay numeric`);
      }
    }
  });

  test('an absent caption stays absent: current maturities are empty in all three periods', () => {
    for (const row of rows) assert.equal(row.CURRENT_MATURITIES_OF_LONG_TERM_DEBT, '');
  });

  test('three consecutive audited consolidated periods of one issuer, in one scale and taxonomy', () => {
    assert.equal(rows.length, 3);
    assert.deepEqual(rows.map((r) => r.fiscal_year), ['2024', '2023', '2022']);
    assert.deepEqual(rows.map((r) => r.period_end), ['2024-03-31', '2023-03-31', '2022-03-31']);
    for (const row of rows) {
      assert.equal(row.issuer_id, 'IN:CIN:L72200MH2000PLC125319');
      assert.equal(row.statement_scope, 'CONSOLIDATED');
      assert.equal(row.taxonomy, 'INDAS');
      assert.equal(row.basis, 'AS_FILED');
      assert.equal(row.source_scale, 'MILLION');
      assert.equal(row.period_type, 'ANNUAL');
    }
    assert.deepEqual(rows.map((r) => r.filing_ref), ['ECLERX-INDAS-CONSOL-FY24', 'ECLERX-INDAS-CONSOL-FY23', 'ECLERX-INDAS-CONSOL-FY23']);
  });

  test('the quoted sentence is classified for what it does not establish, and the retraction is recorded', () => {
    const q1 = quotes.quotes.find((q: any) => q.quoteId === 'Q1');
    assert.equal(q1.kind, 'SCOPED_CLASS_STATEMENT_NOT_A_NIL');
    assert.equal(q1.result, 'NOT_A_QUALIFYING_NIL');
    assert.equal(q1.page, 223);
    assert.equal(q1.heading, 'Terms / rights attached to equity shares');
    assert.equal(q1.statementScope, 'CONSOLIDATED');
    assert.equal(q1.period, '2024-03-31');
    assert.ok(flat(read('source', 'consol-fy24-note-13-share-capital.txt')).includes(flat(q1.exactWording)));
    assert.ok(flat(read('source', 'consol-fy24-note-13-share-capital.txt')).includes(flat(q1.heading)));
    assert.match(q1.doesNotEstablish, /preference/i);
    assert.match(String(quotes.conclusion.withdrawnClaim), /287622ae69fbe39bc2cfb7804983877042a32fbfbf7ffbbad3b711aaf9b00eb3/);
    for (const q of quotes.quotes) {
      assert.equal(q.result, 'NOT_A_QUALIFYING_NIL', `quote ${q.quoteId} must be classified as non-qualifying`);
      assert.ok(String(q.doesNotEstablish).length >= 40, `quote ${q.quoteId} must state what it does not establish`);
      assert.doesNotMatch(String(q.exactWording), /^\s*NIL\b/i);
    }
    const kinds = quotes.quotes.map((q: any) => q.kind);
    assert.equal(kinds.some((k: string) => /DECLARED|NIL_BY_DISCLOSURE/.test(k)), false);
  });

  test('the corrected payload reports preference capital as NOT_REPORTED at every observation point', () => {
    const annual = payload.fundamentals.annual[0].values.PREFERENCE_CAPITAL;
    const component = payload.fundamentals.capitalStructure.components.preferenceCapital;
    const summary = payload.fundamentals.capitalStructure.preferenceCapital;
    for (const [label, obs] of [['annual', annual], ['component', component], ['summary', summary]] as const) {
      assert.equal(obs.presence, 'MISSING', `${label} presence`);
      assert.equal(obs.reason, 'NOT_REPORTED', `${label} reason`);
      assert.equal(obs.value, null, `${label} value`);
      assert.equal(obs.note, undefined, `${label} must carry no quoted nil wording`);
      assert.equal(obs.source, undefined, `${label} must carry no source`);
    }
    assert.equal(JSON.stringify(payload).includes('NIL_BY_DISCLOSURE'), false);
    assert.equal(payload.fundamentals.capitalStructure.grossDebt.presence, 'MISSING');
    assert.equal(payload.fundamentals.capitalStructure.netDebt.presence, 'MISSING');
    assert.equal(payload.completeness.adequacy, 'SUFFICIENT');
    assert.equal(payload.quality.verdict, 'MATERIAL_CONCERNS');
    assert.equal(payload.confidence.combined, 0.321);
  });

  test('the withdrawn payload is retained, still says NIL_BY_DISCLOSURE, and is not the current artifact', () => {
    const withdrawn = readJson('artifact', 'superseded', 'assessment-payload-wi5-withdrawn-preference-nil.json');
    const obs = withdrawn.fundamentals.capitalStructure.preferenceCapital;
    assert.equal(obs.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(obs.reason, 'DECLARED_NIL_IN_SOURCE');
    assert.match(obs.note, /only one class of equity shares/);
    assert.notEqual(withdrawn.data.datasetVersion, payload.data.datasetVersion);
    assert.match(read('README.md'), /withdrawn/i);
  });

  test('the persisted payload digests to the value the run recorded, and the run matches the readback', () => {
    const payloadText = read('artifact', 'assessment-payload-wi5.json').replace(/\n$/, '');
    assert.equal(sha256(payloadText), readback.readPayloadDigest);
    assert.equal(readback.chainHeadPayloadDigest, readback.readPayloadDigest);
    assert.equal(readback.digestMatchesChainHead, true);
    assert.equal(correctedRun.chain.versions[0].payloadDigest, readback.readPayloadDigest);
    assert.equal(correctedRun.dataset.datasetVersion, payload.data.datasetVersion);
    assert.equal(correctedRun.status, 'OK');
    assert.equal(payload.data.datasetVersion, 'sha256:7aa6e3f90ef0b2591b20ade967f41e2f876d012e6e58a03918eb0eafa1071e75');
  });

  test('every committed file still hashes to the digest recorded beside it', () => {
    const digests = readJson('digests.json');
    const files = Object.keys(digests.files).sort();
    assert.equal(digests.fileCount, files.length);
    assert.ok(files.length >= 20, `expected the whole bundle, found ${files.length} files`);
    for (const file of files) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), digests.files[file].sha256, `${file} digest drift`);
      assert.equal(bytes.byteLength, digests.files[file].bytes, `${file} byte-count drift`);
    }
  });
});
