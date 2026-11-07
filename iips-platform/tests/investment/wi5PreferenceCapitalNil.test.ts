/**
 * WI-5 — the second issuer's one nil must stay exactly one nil.
 *
 * `evidence/real-issuer/WI5-PREFERENCE-CAPITAL-NIL-2026-11-07/` records an explicit nil-by-disclosure taken from
 * eClerx Services Limited's audited consolidated statements: the FY2024 `PREFERENCE_CAPITAL` cell carries the
 * filer's own sentence from Note 13, and nothing else in the dataset is a nil. The temptation this test exists to
 * block is spillover — a nil for *one* line item being pushed onto the borrowings columns because the balance
 * sheet happens to print a dash there, or a nil being copied onto the older periods that the filing does not
 * support.
 *
 *   1. the declaration is a single cell, on the FY2024 row, with the wording the source note actually uses;
 *   2. the three periods are consecutive audited consolidated periods of the same issuer;
 *   3. borrowings are numbers — including the filed dash at 2024-03-31, recorded as an explicit zero, which is a
 *      different claim about the source than a nil and must not be re-spelled as one;
 *   4. the current-maturities column is empty in every period: the filer presents no such caption, and an empty
 *      cell is not a zero;
 *   5. the nil's provenance resolves to the extract that quotes it, and every committed file still hashes to the
 *      digest recorded in `digests.json`.
 *
 * Nothing here asserts a borrowings nil, because the filing contains no sentence declaring one.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI5-PREFERENCE-CAPITAL-NIL-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
/** Extracts keep the text layer's line breaks; compare on collapsed whitespace, never on reflowed wording. */
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const csv = read('ingest-input', 'periods.csv').trimEnd().split('\n');
const header = csv[0].split(',');
const rows = csv.slice(1).map((line) => {
  const cells = line.split(',');
  const record: Record<string, string> = {};
  header.forEach((name, i) => (record[name] = cells[i] ?? ''));
  return record;
});
const quotes = readJson('source', 'quotes.json');
const NIL_COLUMNS = [
  'LONG_TERM_BORROWINGS',
  'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
  'PREFERENCE_CAPITAL',
];

describe('WI-5 — one declaration, on one period, in the filer\'s words', () => {
  test('exactly one cell in the dataset is a nil declaration, and it is FY2024 PREFERENCE_CAPITAL', () => {
    const nilCells: { fiscalYear: string; column: string; text: string }[] = [];
    for (const row of rows) {
      for (const column of header) {
        if ((row[column] ?? '').trim().startsWith('NIL')) nilCells.push({ fiscalYear: row.fiscal_year, column, text: row[column] });
      }
    }
    assert.equal(nilCells.length, 1, `expected one nil cell, found ${JSON.stringify(nilCells)}`);
    assert.equal(nilCells[0].column, 'PREFERENCE_CAPITAL');
    assert.equal(nilCells[0].fiscalYear, '2024');
  });

  test('the nil carries the wording quoted from Note 13, and that wording is in the committed extract', () => {
    const cell = rows.find((r) => r.fiscal_year === '2024')!.PREFERENCE_CAPITAL;
    assert.match(cell, /^NIL: \S/);
    const wording = cell.replace(/^NIL: /, '');
    const q1 = quotes.quotes.find((q: any) => q.quoteId === 'Q1');
    assert.equal(wording, q1.exactWording);
    assert.equal(q1.governedLineItem, 'PREFERENCE_CAPITAL');
    assert.equal(q1.statementScope, 'CONSOLIDATED');
    assert.equal(q1.period, '2024-03-31');
    assert.equal(q1.page, 223);
    assert.equal(q1.note, 'Note 13 Share capital');
    assert.ok(flat(read('source', 'consol-fy24-note-13-share-capital.txt')).includes(flat(wording)));
  });

  test('the nil row carries provenance: a filing reference and a filing date', () => {
    const row = rows.find((r) => r.fiscal_year === '2024')!;
    assert.equal(row.filing_ref, 'ECLERX-INDAS-CONSOL-FY24');
    assert.equal(row.filed_at, '2024-05-16');
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
  });

  test('no borrowings cell is a nil: the filed dash is an explicit zero, the older periods are numbers', () => {
    const byYear = Object.fromEntries(rows.map((r) => [r.fiscal_year, r]));
    assert.equal(byYear['2024'].LONG_TERM_BORROWINGS, '0');
    assert.equal(byYear['2024'].SHORT_TERM_BORROWINGS, '0');
    assert.equal(byYear['2023'].LONG_TERM_BORROWINGS, '6.77');
    assert.equal(byYear['2023'].SHORT_TERM_BORROWINGS, '3.08');
    assert.equal(byYear['2022'].LONG_TERM_BORROWINGS, '0.50');
    assert.equal(byYear['2022'].SHORT_TERM_BORROWINGS, '0.91');
    for (const row of rows) {
      for (const column of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS']) {
        assert.doesNotMatch(row[column], /NIL/);
      }
    }
  });

  test('the borrowings evidence separates a dash from a declaration and from an exclusion', () => {
    const shape = quotes.quotes.map((q: any) => [q.quoteId, q.kind]);
    assert.deepEqual(shape, [
      ['Q1', 'EXPLICIT_CLASS_STATEMENT'],
      ['Q2', 'FILED_ZERO_NOT_A_NIL'],
      ['Q3', 'REPORTED_VALUE'],
      ['Q4', 'EXCLUSION_NOT_A_NIL'],
    ]);
    const q4 = quotes.quotes.find((q: any) => q.quoteId === 'Q4');
    assert.match(q4.exactWording, /other than derivatives and lease liabilities/);
    assert.ok(flat(read('source', 'consol-fy24-note-40-financial-risk-management.txt')).includes(flat(q4.exactWording)));
    for (const q of quotes.quotes) {
      assert.ok(String(q.doesNotEstablish).length >= 40, `quote ${q.quoteId} must state what it does not establish`);
    }
  });

  test('current maturities are empty in all three periods — an absent caption is not a zero', () => {
    for (const row of rows) assert.equal(row.CURRENT_MATURITIES_OF_LONG_TERM_DEBT, '');
    for (const column of NIL_COLUMNS.filter((c) => c !== 'PREFERENCE_CAPITAL')) {
      for (const row of rows) assert.equal((row[column] ?? '').trim().startsWith('NIL'), false);
    }
  });

  test('every committed file in the bundle still hashes to the digest recorded beside it', () => {
    const digests = readJson('digests.json').files as Record<string, { sha256: string; bytes: number }>;
    const files = Object.keys(digests).sort();
    assert.ok(files.length >= 14, `expected the whole bundle, found ${files.length} files`);
    for (const file of files) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), digests[file].sha256, `${file} digest drift`);
      assert.equal(bytes.byteLength, digests[file].bytes, `${file} byte-count drift`);
    }
  });
});
