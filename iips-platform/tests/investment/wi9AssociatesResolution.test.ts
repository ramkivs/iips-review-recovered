/**
 * WI-9 — `L-036`: the answer stays "no carrying value", and the two halves of the acceptance criterion are pinned.
 *
 * The investigation is finished and its negative is easy to erode, so this file guards it from the places erosion
 * actually happens: a silent figure entering the payload, a review flag that quietly ages without saying so, a
 * "resolved" status that creeps in because the representational half was fixed, and a V2 dataset that an operator
 * still cannot get through the ingestion path (the defect this work item corrected).
 *
 *   1. the filed text of every WI-4 extract still contains no equity-method caption, and Note 2.5 still ties to the
 *      filed investment totals to the rupee in all three periods — the arithmetic that rules out a hidden component;
 *   2. the committed payload for the unchanged WI-3 dataset carries no associates figure: `NOT_COMPUTABLE`,
 *      `POLICY_ZERO_UNAVAILABLE`, one `POLICY_ZERO` substitution, and a review that is due and inert;
 *   3. the review control is arithmetic on published dates (2024-03-31 + 180 = 2024-09-27, 950 days elapsed) and its
 *      persisted block carries no clock, so waiting cannot mint a version;
 *   4. the grammar the content was built under survives a write and a read — V2 stays V2, V1 stays V1 — and a V2
 *      dataset that *carries* the line item is actually treated as a reported value rather than a policy zero;
 *   5. the record says `PARTIALLY RESOLVED` on both sides, the dataset did not change, and the IX policy and the D-2
 *      nil semantics are untouched.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../src/investment/assessment/engine';
import { VALUATION_POLICY } from '../../src/investment/assessment/policy';
import { readDataset, writeDataset } from '../../src/investment/ingestion/writer';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { referenceInputs } from './fixtures';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI9-L036-ASSOCIATES-2026-11-07');
const WI4 = join(ROOT, 'evidence', 'real-issuer', 'WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06');
const WI3 = join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06');

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;

const sourceMap = readJson(join(BUNDLE, 'source', 'source-map.json'));
const determination = readJson(join(BUNDLE, 'determination-l036.json'));
const readback = readJson(join(BUNDLE, 'runs', '03-readback.json'));
const payloadBytes = readFileSync(join(BUNDLE, 'artifact', 'assessment-payload-l036.json'));
const payload = JSON.parse(payloadBytes.toString('utf8')) as Record<string, any>;
const wi3Payload = readJson(join(WI3, 'artifact', 'assessment-payload-wi3.json'));

const ITEM = 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES' as const;
const V1 = 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const;
const V2 = 'IIPS_INVESTMENT_FUNDAMENTALS_V2' as const;
const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

const MARKER = /^OBSERVATION RECORDED WITH THE EXTRACT/m;
const filedText = (file: string) => {
  const body = readFileSync(join(WI4, 'source', file), 'utf8');
  const at = MARKER.exec(body);
  return at ? body.slice(0, at.index) : body;
};

/** The annotations say the caption is absent; the filed text must not contain it at all. */
const EQUITY_CAPTION =
  /investments? (?:in |accounted for using the )?(?:associates?|joint venture)|equity[- ]method|share of (?:profit|loss)[^\n]{0,40}(?:associate|joint)/i;

describe('the negative is still the filed text — no caption, and the note still ties', () => {
  test('all sixteen extracts hash to the digests recorded in this bundle', () => {
    const extracts = sourceMap.extracts as Record<string, { sha256: string; bytes: number }>;
    assert.equal(Object.keys(extracts).length, 16);
    for (const [file, record] of Object.entries(extracts)) {
      const bytes = readFileSync(join(WI4, 'source', file));
      assert.equal(bytes.length, record.bytes, `size drift: ${file}`);
      assert.equal(sha256(bytes), record.sha256, `digest drift: ${file}`);
    }
  });

  test('no filed extract contains an associates/JV or equity-method caption', () => {
    for (const [file, hits] of Object.entries(sourceMap.filedTextCaptionScan as Record<string, string[]>)) {
      assert.deepEqual(hits, [], `${file} now contains ${JSON.stringify(hits)}`);
      assert.doesNotMatch(filedText(file), EQUITY_CAPTION, `${file} filed text gained a caption`);
    }
    // and the extracts that mention the caption do so only in the annotation that reports its absence
    for (const [file, count] of Object.entries(sourceMap.annotationMentionsOfTheAbsentCaption as Record<string, number>)) {
      if (count > 0) assert.ok(MARKER.test(readFileSync(join(WI4, 'source', file), 'utf8')), `annotation marker lost: ${file}`);
    }
  });

  test('Note 2.5 decomposes to the filed investment total in all three periods', () => {
    const checks = sourceMap.note25Reconciliation as Record<string, any>[];
    assert.deepEqual(checks.map((c) => c.period), ['2024-03-31', '2023-03-31', '2023-03-31', '2022-03-31']);
    for (const check of checks) {
      assert.equal(check.nonCurrent + check.current, check.noteTotal, `does not tie @${check.period}`);
      assert.equal(check.reconciles, true);
    }
    // The three filed totals, restated here so a drift in the extracts is caught even if the JSON is edited too.
    const totals = Object.fromEntries(checks.map((c) => [c.period, c.noteTotal]));
    assert.equal(totals['2024-03-31'], 24623);
    assert.equal(totals['2022-03-31'], 20324);
    assert.ok(determination.periods.every((p: any) => p.equityMethodInterestFound === false));
  });
});

describe('the committed payload keeps the answer it published', () => {
  test('the artifact is the canonical payload, and the separate-process readback recomputed the same bytes', () => {
    const digest = sha256(payloadBytes);
    assert.equal(digest, readback.payloadSha256);
    assert.equal(payloadBytes.length, readback.payloadBytes);
    assert.equal(readback.storedPayloadDigest, digest);
    assert.equal(readback.recomputedPayloadDigest, digest);
    assert.equal(readback.digestMatch, true);
    assert.equal(payload.artifact.subjectScope, 'hc:IN:CIN:L85110KA1981PLC013115');
  });

  test('no associates figure exists: unavailable, policy zero, one substitution, and a null value', () => {
    const cs = payload.fundamentals.capitalStructure;
    assert.deepEqual(cs.associatesAndJV, { presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', value: null });
    assert.equal(cs.equityBridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(cs.equityBridge.policyVersion, 'associates-treatment/1.0.0');
    assert.equal(cs.equityBridge.substitutedInputs.length, 1);
    assert.deepEqual(cs.equityBridge.substitutedInputs[0], {
      input: 'associatesAndJV',
      presence: 'NOT_COMPUTABLE',
      reason: 'NOT_REPORTED',
      treatment: 'POLICY_ZERO',
    });
    assert.equal(determination.answers.carryingValueEstablished, false);
    // the WI-3 dataset still has no such column, so nothing could have been ingested
    assert.equal(sourceMap.conclusion.includes('no equity-method investment caption'), true);
  });

  test('the dataset this payload came from is the unchanged WI-3 dataset', () => {
    assert.equal(
      payload.data.datasetVersion,
      'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
    );
    assert.equal(payload.data.datasetVersion, payload.data.contentDigest);
    assert.equal(determination.dataset.changed, false);
    assert.equal(determination.dataset.committedDatasetVersion, payload.data.datasetVersion);
  });

  test('the limitation sentences are published with the assessment', () => {
    const limitations = (payload.limitations as string[]).filter((line) => /ssociate/.test(line));
    assert.ok(limitations.some((line) => /substitutes zero for that term under policy associates-treatment\/1\.0\.0/.test(line)));
    assert.ok(limitations.some((line) => /Associates\/JV review required \(REVIEW_DUE\)/.test(line)));
    assert.ok(limitations.some((line) => /fell due on 2024-09-27/.test(line)));
    assert.ok(limitations.every((line) => /no figure has been established|not an issuer-reported nil/.test(line)));
    assert.deepEqual(limitations, readback.limitationsAssociates);
  });
});

describe('the 180-day review control is arithmetic, in force, and inert', () => {
  const review = () => payload.fundamentals.capitalStructure.associatesJVReview;

  test('the window is the published one, anchored on the evidence date, not on the clock', () => {
    assert.equal(review().reviewPolicyVersion, 'associates-review/1.0.0');
    assert.equal(review().clockStart, '2024-03-31');
    assert.equal(review().clockStartBasis, 'DATASET_PERIOD_END');
    assert.equal(review().reviewAgeDays, 180);
    assert.equal(review().reviewDueOn, '2024-09-27');
    assert.equal(review().reviewAgeDays, VALUATION_POLICY.associatesReview.reviewAgeDays);

    const anchor = Date.parse(`${review().clockStart}T00:00:00Z`);
    const due = Date.parse(`${review().reviewDueOn}T00:00:00Z`);
    assert.equal((due - anchor) / 86_400_000, 180, '180 calendar days, exactly');
  });

  test('the flag is due at this assessment clock, and it says so', () => {
    const clock = Date.parse(payload.asOf.generatedAt);
    const elapsed = Math.floor((clock - Date.parse(`${review().clockStart}T00:00:00Z`)) / 86_400_000);
    assert.equal(elapsed, 950);
    assert.equal(elapsed, payload.asOf.stalenessDays);
    assert.equal(review().status, 'REVIEW_DUE');
    assert.equal(review().reviewRequired, true);
    assert.equal(review().reviewDueOn < payload.asOf.generatedAt.slice(0, 10), true);
    assert.match(review().reason, /180-day/);
    assert.equal(readback.reviewBlockHasClockMembers.length, 0);
    assert.ok(!('elapsedDays' in review()) && !('asOf' in review()), 'the persisted block must not carry a clock');
  });

  test('the flag changes no value: the valuation is byte-identical to the Work Item 3 artifact', () => {
    assert.deepEqual(payload.valuation.intrinsic, wi3Payload.valuation.intrinsic);
    assert.deepEqual(payload.valuation.marginOfSafety, wi3Payload.valuation.marginOfSafety);
    assert.equal(determination.valuationImpact.marginOfSafety, 'unchanged');
    assert.equal(determination.reviewControl.inert, true);
  });

  test('the review boundary is unchanged: 179 not due, 180 due, 181 due (existing suite)', () => {
    const integrity = readFileSync(join(process.cwd(), 'tests', 'investment', 'assessment-valuation-integrity.test.ts'), 'utf8');
    assert.match(integrity, /179 days is not due/);
    assert.match(integrity, /exactly 180 days is due/);
    assert.match(integrity, /more than\s+180 days is due/);
  });
});

describe('the grammar a dataset was built under survives the round trip', () => {
  const roundTrip = (schema: string) => {
    const dir = mkdtempSync(join(tmpdir(), 'wi9-schema-'));
    const content = buildDatasetContent({ ...referenceInputs(), datasetSchema: schema as never });
    assert.equal(content.datasetSchema, schema);
    const written = writeDataset({
      dir,
      content,
      provider: 'synthetic-fixture',
      licence: 'CC0-1.0',
      now: '2026-07-25T00:00:00Z',
      importRunId: 'run:wi9-schema',
    });
    const back = readDataset(dir);
    return { manifest: readJson(join(written.dir, 'manifest.json')), back };
  };

  test('V2 content is written and read as V2', () => {
    const { manifest, back } = roundTrip(V2);
    assert.equal(manifest.datasetSchema, V2);
    assert.equal(back.content.datasetSchema, V2);
  });

  test('V1 content is written and read as V1 — the default is untouched', () => {
    const { manifest, back } = roundTrip(V1);
    assert.equal(manifest.datasetSchema, V1);
    assert.equal(back.content.datasetSchema, V1);
  });

  test('a V2 dataset that carries the line item is treated as reported, not zeroed', () => {
    const base = referenceInputs();
    const metadata =
      'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale';
    const text =
      `${metadata},${ITEM}\n` +
      'IN:EQISIN:IN0000000029,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-BODHI-FY26,2026-05-16,CRORE,8000\n';
    const content = buildDatasetContent({ ...base, periodCsv: { name: 'periods.csv', text }, xbrlFiles: [], datasetSchema: V2 });
    assert.equal(content.periods[0]?.values[ITEM]?.value, 80_000_000_000);
    assert.equal(content.issues.filter((entry) => entry.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2').length, 0);

    const result = assessCompany({
      issuerId: 'IN:EQISIN:IN0000000029',
      legalName: 'Bodhi',
      sector: 'Industrials',
      securityId: 'IN:EQISIN:IN0000000029',
      dataset: content as never,
      datasetVersion: 'content:fixture',
      contentDigest: 'sha256:fixture',
      provider: 'synthetic-fixture',
      identity: {
        bindingRef: 'binding:fixture',
        rosterVersion: 'sha256:roster-fixture',
        listingMapVersion: 'sha256:listing-fixture',
        corporateActionTableVersion: 'sha256:ca-fixture',
      },
      generatedAt: '2026-07-25',
      knownAsOf: '2026-07-23T17:44:46Z',
    });
    const cs = (result.payload as Record<string, any>).fundamentals.capitalStructure;
    assert.equal(cs.associatesAndJV.presence, 'PRESENT');
    assert.equal(cs.associatesAndJV.value, 80_000_000_000);
    assert.notEqual(cs.equityBridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(cs.associatesJVReview.reviewRequired, false);
  });
});

describe('the bundle manifest covers what it says it covers', () => {
  test('every digested file re-hashes to its recorded digest, and the exclusions are the reporting runs', () => {
    const manifest = readJson(join(BUNDLE, 'digests.json'));
    const files = manifest.files as Record<string, { sha256: string; bytes: number }>;
    for (const [file, record] of Object.entries(files)) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(bytes.length, record.bytes, `size drift: ${file}`);
      assert.equal(sha256(bytes), record.sha256, `digest drift: ${file}`);
    }
    assert.ok(Object.keys(files).length >= 12, `only ${Object.keys(files).length} files digested`);
    // The three files that cannot be digested: the manifest itself and the two runs that report on it.
    assert.match(manifest.note, /cannot digest the runs that report on it/);
    assert.ok(!('digests.json' in files));
  });
});

describe('the record is honest about what is and is not resolved', () => {
  test('the limitation stays PARTIALLY RESOLVED, and the record says why', () => {
    assert.equal(determination.limitationStatus.before, 'PARTIALLY RESOLVED');
    assert.equal(determination.limitationStatus.after, 'PARTIALLY RESOLVED');
    assert.equal(determination.limitationStatus.resolved, false);
    assert.match(determination.limitationStatus.why, /carrying-value criterion is not met/);
    assert.match(determination.limitationStatus.whatWouldResolve, /declaring the balance nil/);
  });

  test('the V2 operator gap is recorded as corrected, not as a remaining limitation', () => {
    assert.equal(determination.answers.v2OperatorPathWasUnreachable, true);
    assert.equal(determination.answers.v2OperatorPathNowReachable, true);
    assert.equal(determination.productDefectFoundAndCorrected.id, 'V2-OPERATOR-PATH-UNREACHABLE');
    const ingest = readFileSync(join(process.cwd(), 'src', 'investment', 'cli', 'ingest.ts'), 'utf8');
    assert.match(ingest, /dataset-schema/);
    assert.match(ingest, /assertSupportedDatasetSchema/);
    const writer = readFileSync(join(process.cwd(), 'src', 'investment', 'ingestion', 'writer.ts'), 'utf8');
    assert.match(writer, /datasetSchema: options\.content\.datasetSchema|datasetSchema: content\.datasetSchema/);
  });

  test('IX policy and D-2 semantics are untouched by this work item', () => {
    const ix = VALUATION_POLICY.policyDefaultAssumptionCaps;
    assert.equal(ix.maxAggregateReduction, 0.35);
    assert.deepEqual(ix.categoryPenalties, { DISCOUNT_RATE: 0.2, TARGET_MULTIPLE: 0.15 });
    assert.equal(ix.application, 'ADDITIVE_BY_CATEGORY');
    assert.equal(ix.factor, null);
    assert.equal(ix.confidenceFloor, null);
    assert.equal(determination.boundaries.ixPolicyUnchanged, true);
    assert.equal(determination.boundaries.d2SemanticsUnchanged, true);
    assert.equal(determination.boundaries.noNewPersistence, true);
    assert.equal(determination.boundaries.wi3ArtifactsPreserved, true);
    // the WI-3 artifact is still the pre-IX record it always was; nothing here rewrote it
    assert.equal(wi3Payload.confidence.combined, 0.6736);
    assert.deepEqual(wi3Payload.confidence.caps, ['STALE_DATA', 'DILUTION_PROXY']);
    // The live payload carries the two authorized assumption caps as categories, not as extra factors.
    const caps = payload.confidence.assumptionCaps as Record<string, any>[];
    assert.deepEqual(caps.map((cap) => [cap.cap, cap.category, cap.penaltyRate, cap.factor]), [
      ['POLICY_DEFAULT_WACC', 'DISCOUNT_RATE', 0.2, null],
      ['POLICY_DEFAULT_MULTIPLE', 'TARGET_MULTIPLE', 0.15, null],
    ]);
    assert.equal(caps.reduce((sum, cap) => sum + (cap.applied ? cap.penaltyRate : 0), 0), 0.35);
  });
});
