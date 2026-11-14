/**
 * IID Stage 4 — the READ side of the sector-vocabulary seam (`G-7`, `G-14`).
 *
 * THE DEFECT THIS LOCKS
 *   Coverage measurement decides sector membership by string equality: `measureCoverage` filters
 *   `content.issuers` on `issuer.sector === sector` (`coverage/measure.ts`). `IssuerRecord.sector` is the
 *   closed `SectorName` union, but a TypeScript type is erased at runtime, and the sector list itself comes
 *   from a compile-time cast (`Object.keys(SECTOR_METHODS) as SectorName[]`). An issuer whose sector is not
 *   exactly one of the thirteen canonical names therefore matches no sector at all, and before this change
 *   nothing anywhere said that an issuer had been dropped.
 *
 *   `S3-D1` closed the ingestion CLI: `assertValidIssuerSectors` rejects an off-vocabulary roster before
 *   anything is written. But that guard has exactly ONE call site, so it protects one path into a dataset and
 *   none of the ways an already-written dataset can be wrong — a build predating `S3-D1`, or any caller of
 *   `writeDataset` other than the CLI, which is `G-14`'s "nothing prevents the `G-7` class of defect from
 *   re-entering". The read side is where every consumer actually passes through, so that is where this locks.
 *
 * TWO SHAPES, AND WHY BOTH ARE TESTED
 *   (a) the SOLE issuer of a measured sector is respelled — the sector drops out of `completedMeasurements`
 *       and becomes indistinguishable, field for field, from a sector that genuinely has no issuers.
 *   (b) ONE OF TWO issuers of a measured sector is respelled — **the sector stays measured and
 *       `measuredSectors` does not move at all**, while an issuer silently disappears from
 *       `issuersConsidered`. This is the more dangerous shape, and it is why `CPII-01` §12.2's mandated
 *       verification (`measuredSectors > 0` rather than `datasetClass !== 'NONE'`) is necessary but NOT
 *       sufficient: shape (b) passes that check. Only an explicit offender list closes it.
 *
 * WHAT IS PROVEN HERE
 *   1. A canonical dataset reports zero offenders, and the summary SAYS SO — a clean result is affirmative,
 *      not merely an absence, so "checked and clean" cannot be confused with "not checked".
 *   2. Both shapes above are reported: the value, the issuer, the reason, and the fact that `completed`
 *      understates the dataset.
 *   3. The measurement is unchanged. This is disclosure, not repair: no sector is widened, no value is
 *      normalised, and reporting an offender never moves a number that would otherwise have been wrong.
 *   4. All the ways untrusted JSON can fail the vocabulary are classified, and a near miss names the
 *      canonical value while still being rejected.
 *   5. The writer path really is unprotected: a dataset written directly by `writeDataset` with an
 *      off-vocabulary sector is digest-consistent, is ACCEPTED by `readDataset`, and is then reported.
 *   6. The served surface carries the disclosure, adds a note and a status clause, and does not flip any row
 *      to `ISSUED_DATA` — an off-vocabulary sector is not an ingestion issue about that issuer, and routing
 *      it through `issues` would hide a vocabulary defect inside a generic count.
 *   7. The served HTTP route still answers 200 with the disclosure in the body: disclosure, never a gate.
 *   8. The baseline's §23 scenario-8 stage, `G3_WITHHELD`, is exercised — it was reachable and consumed but
 *      had zero test files repo-wide. A fully withheld sector names its missing metrics (`BM_NIM`/`BM_GNPA`/
 *      `BM_CET1`), stays distinct from `UNMEASURED`, never approximates a method, and its issuers' served rows
 *      are `SECTOR_NOT_MEASURED` while the §23 scenario-10 counts still partition exactly. The one asymmetry a
 *      reader could misread — `measuredSectors` still counts it, because a completed measurement is a fact
 *      about the dataset — is pinned rather than smoothed over.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  measureCoverage,
  renderCoverageSummary,
  sectorVocabularyLines,
} from '../../src/investment/coverage/measure';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import {
  handleInvestmentCoverageRequest,
  INVESTMENT_COVERAGE_ROUTES,
} from '../../src/investment/coverage/investmentCoverageEndpoint';
import { SECTOR_NAMES } from '../../src/investment/contracts/operatingMetrics';
import { readDataset } from '../../src/investment/ingestion/writer';
import type { DatasetContent } from '../../src/investment/fundamentals/types';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import { referenceContent, writeTempDataset } from './fixtures';

const OPTIONS = { datasetVersion: 'sha256:stage4', generatedAt: '2026-11-14T00:00:00.000Z' };
const ASOF = '2026-11-14';

/**
 * The other committed vocabulary: `G-7`'s certified v1.1 replay-baseline spelling. `SECTOR_METHODS` keys
 * the sector `Auto`, so an issuer written as `Automobile` matches nothing — and no transformation of
 * `Automobile` produces `Auto`, which is why it classifies as `NOT_IN_VOCABULARY` with no suggestion.
 */
const BASELINE_SPELLING = 'Automobile';

const canonical = referenceContent();
const canonicalReport = measureCoverage(canonical, OPTIONS);

/** The sole `Hospitality` issuer — respelling it makes a measured sector disappear entirely (shape a). */
const SOLE_HOSPITALITY = canonical.issuers.find((issuer) => issuer.sector === 'Hospitality')!;
/** One of the two `Technology` issuers — respelling it leaves the sector measured (shape b). */
const ONE_OF_TWO_TECHNOLOGY = canonical.issuers.find((issuer) => issuer.issuerId === 'IN:EQISIN:IN0000000011')!;
/** A sector with no issuer at all: the comparator for "indistinguishable from legitimately empty". */
const EMPTY_SECTOR = 'Auto';

for (const [label, issuer] of [['Hospitality', SOLE_HOSPITALITY], ['Technology', ONE_OF_TWO_TECHNOLOGY]] as const) {
  assert.ok(issuer, `the reference fixture must carry a ${label} issuer for these tests to mean anything`);
}
assert.equal(
  canonical.issuers.filter((issuer) => issuer.sector === SOLE_HOSPITALITY.sector).length,
  1,
  'shape (a) requires the respelled issuer to be the SOLE member of its sector',
);
assert.equal(
  canonical.issuers.filter((issuer) => issuer.sector === ONE_OF_TWO_TECHNOLOGY.sector).length,
  2,
  'shape (b) requires the respelled issuer to be ONE OF TWO members of its sector',
);

/**
 * The same content with one issuer's sector replaced.
 *
 * Typed through `never` deliberately: `IssuerRecord.sector` is *typed* `SectorName` while the runtime value
 * is whatever the file held, so a test that could only express a canonical value could never exercise this.
 */
function withSector(content: DatasetContent, issuerId: string, sector: unknown): DatasetContent {
  return {
    ...content,
    issuers: content.issuers.map((issuer) =>
      issuer.issuerId === issuerId ? ({ ...issuer, sector } as never) : issuer,
    ),
  };
}

const sectorOf = (report: ReturnType<typeof measureCoverage>, name: string) =>
  report.sectors.find((sector) => sector.sector === name)!;

function serve(content: DatasetContent) {
  return buildInvestmentCoverageReport({
    asOf: ASOF,
    generatedAt: OPTIONS.generatedAt,
    manifest: null,
    issuers: content.issuers,
    securities: content.securities,
    periods: content.periods,
    prices: content.prices,
    operatingMetrics: content.operatingMetrics,
    issues: content.issues,
    identitySourcesAvailable: true,
    identitySourceDetail: null,
  });
}

describe('IID Stage 4 — a canonical dataset says so affirmatively', () => {
  it('reports no offender, and the summary states that the vocabulary was actually tested', () => {
    assert.deepEqual(canonicalReport.offVocabularyIssuers, []);
    assert.match(
      renderCoverageSummary(canonicalReport),
      /^sector vocabulary {2}every issuer carries one of the 13 canonical sectors; none was dropped$/m,
    );
    assert.equal(sectorVocabularyLines(canonicalReport).length, 1, 'one line, so ingest output gains no noise');
  });

  it('the clean claim is checkable: every issuer is placed in some sector', () => {
    assert.equal(SECTOR_NAMES.length, 13);
    assert.equal(canonicalReport.sectors.length, SECTOR_NAMES.length);
    const placed = canonicalReport.sectors.flatMap((sector) => sector.issuersConsidered);
    assert.equal(placed.length, canonical.issuers.length);
    assert.equal(canonicalReport.completedMeasurements.length, 3);
  });
});

describe('IID Stage 4 — shape (a): the sole issuer of a measured sector is respelled', () => {
  const report = measureCoverage(withSector(canonical, SOLE_HOSPITALITY.issuerId, BASELINE_SPELLING), OPTIONS);

  it('the sector drops out and becomes indistinguishable from a sector with no issuers at all', () => {
    const dropped = sectorOf(report, SOLE_HOSPITALITY.sector);
    const empty = sectorOf(report, EMPTY_SECTOR);
    assert.equal(dropped.stage, 'UNMEASURED');
    assert.deepEqual(dropped.issuersConsidered, []);
    assert.ok(!report.completedMeasurements.includes(SOLE_HOSPITALITY.sector as never));
    assert.ok(report.outstandingSectors.includes(SOLE_HOSPITALITY.sector as never));
    // The dangerous part, stated exactly: every field that tells a reader whether this sector has data
    // agrees with a sector that legitimately has no issuers, so the zero reads as an absence of data rather
    // than a dropped issuer. `usableMethods`/`withheldMethods` are deliberately NOT compared: they come from
    // each sector's own method matrix, so they differ between two different sectors by design and are not a
    // signal a reader could use to tell "no issuers" from "issuer lost".
    assert.equal(dropped.stage, empty.stage);
    assert.equal(dropped.measured, empty.measured);
    assert.deepEqual(dropped.issuersConsidered, empty.issuersConsidered);
    assert.equal(dropped.annualPeriodsConsidered, empty.annualPeriodsConsidered);
    assert.equal(dropped.statementCoveragePct, empty.statementCoveragePct);
    assert.equal(dropped.operatingMetricCoveragePct, empty.operatingMetricCoveragePct);
    assert.equal(report.completedMeasurements.length, canonicalReport.completedMeasurements.length - 1);
  });

  it('and the report names the value, the issuer and the consequence', () => {
    assert.equal(report.offVocabularyIssuers.length, 1);
    const offender = report.offVocabularyIssuers[0]!;
    assert.equal(offender.issuerId, SOLE_HOSPITALITY.issuerId);
    assert.equal(offender.legalName, SOLE_HOSPITALITY.legalName);
    assert.equal(offender.received, JSON.stringify(BASELINE_SPELLING));
    assert.equal(offender.reason, 'NOT_IN_VOCABULARY');
    assert.equal(offender.suggestion, null, 'no trimming or case-folding turns one word into another');
    assert.match(JSON.stringify(report), /Automobile/);
  });

  it('the summary says the completed count UNDERSTATES the dataset, and names the remedy', () => {
    const lines = sectorVocabularyLines(report);
    assert.match(lines[0]!, /OFF-VOCABULARY/);
    assert.match(lines[0]!, /UNDERSTATES/);
    assert.match(lines[0]!, /1 of 5 issuer\(s\)/);
    assert.ok(lines.some((line) => line.includes(SOLE_HOSPITALITY.issuerId)), 'named by id');
    assert.ok(lines.some((line) => line.includes(BASELINE_SPELLING)), 'and by the value as written');
    const summary = renderCoverageSummary(report);
    assert.match(summary, /correct the sector at source and re-ingest/);
    assert.match(summary, /never rewrites a sector/);
  });
});

describe('IID Stage 4 — shape (b): one of two issuers is respelled and NO aggregate moves', () => {
  const content = withSector(canonical, ONE_OF_TWO_TECHNOLOGY.issuerId, BASELINE_SPELLING);
  const report = measureCoverage(content, OPTIONS);
  const served = serve(content);

  it('the sector stays measured, so measuredSectors — the check CPII-01 §12.2 mandates — still passes', () => {
    assert.equal(report.completedMeasurements.length, canonicalReport.completedMeasurements.length);
    assert.ok(report.completedMeasurements.includes(ONE_OF_TWO_TECHNOLOGY.sector as never));
    assert.equal(served.measuredSectors, 3, 'greater than zero, so the mandated verification is satisfied');
    // …while an issuer has silently left the measurement. This is why measuredSectors > 0 is not enough.
    assert.deepEqual(sectorOf(report, ONE_OF_TWO_TECHNOLOGY.sector).issuersConsidered, ['IN:EQISIN:IN0000000029']);
    assert.equal(sectorOf(canonicalReport, ONE_OF_TWO_TECHNOLOGY.sector).issuersConsidered.length, 2);
  });

  it('and the report is the only thing that reveals the loss', () => {
    assert.equal(report.offVocabularyIssuers.length, 1);
    assert.equal(report.offVocabularyIssuers[0]!.issuerId, ONE_OF_TWO_TECHNOLOGY.issuerId);
    assert.equal(served.offVocabularyIssuers.length, 1);
    assert.match(served.statusLine, /1 issuer\(s\) excluded from measurement by an off-vocabulary sector\.$/);
  });

  it('the issuer count in the served report is unchanged, so nothing was dropped from the surface', () => {
    assert.equal(served.counts.observed, canonical.issuers.length);
    assert.equal(served.issuers.length, canonical.issuers.length);
  });
});

describe('IID Stage 4 — every way untrusted JSON can fail the vocabulary is classified', () => {
  const cases: readonly [unknown, string, string | null][] = [
    ['hospitality', 'CASE', 'Hospitality'],
    ['HOSPITALITY', 'CASE', 'Hospitality'],
    [' Hospitality ', 'WHITESPACE', 'Hospitality'],
    ['Hospitality ', 'WHITESPACE', 'Hospitality'],
    [' hospitality ', 'WHITESPACE', 'Hospitality'],
    [BASELINE_SPELLING, 'NOT_IN_VOCABULARY', null],
    ['Materials & Metals', 'NOT_IN_VOCABULARY', null],
    ['Telecommunications', 'NOT_IN_VOCABULARY', null],
    ['', 'EMPTY', null],
    ['   ', 'WHITESPACE_ONLY', null],
    [null, 'NULL', null],
    [42, 'NOT_A_STRING', null],
    [['Hospitality'], 'NOT_A_STRING', null],
  ];

  for (const [sector, reason, canonicalSector] of cases) {
    it(`${JSON.stringify(String(sector))} is ${reason} and is never normalised into a measurement`, () => {
      const report = measureCoverage(withSector(canonical, SOLE_HOSPITALITY.issuerId, sector), OPTIONS);
      assert.equal(report.offVocabularyIssuers.length, 1);
      const offender = report.offVocabularyIssuers[0]!;
      assert.equal(offender.reason, reason);
      assert.equal(offender.suggestion?.sector ?? null, canonicalSector);
      // The decisive assertion: the issuer did NOT re-enter its sector. A near miss with a named canonical
      // value is still a rejection — reporting the fix is not applying it.
      assert.deepEqual(sectorOf(report, SOLE_HOSPITALITY.sector).issuersConsidered, []);
      assert.ok(!report.completedMeasurements.includes(SOLE_HOSPITALITY.sector as never));
    });
  }

  it('a missing sector key is reported as MISSING rather than treated as an unnamed sector', () => {
    const content: DatasetContent = {
      ...canonical,
      issuers: canonical.issuers.map((issuer) =>
        issuer.issuerId === SOLE_HOSPITALITY.issuerId
          ? (Object.fromEntries(Object.entries(issuer).filter(([key]) => key !== 'sector')) as never)
          : issuer,
      ),
    };
    const report = measureCoverage(content, OPTIONS);
    assert.equal(report.offVocabularyIssuers.length, 1);
    assert.equal(report.offVocabularyIssuers[0]!.reason, 'MISSING');
  });

  it('reports EVERY offending issuer, not just the first', () => {
    let content = canonical;
    for (const issuer of canonical.issuers) content = withSector(content, issuer.issuerId, BASELINE_SPELLING);
    const report = measureCoverage(content, OPTIONS);
    assert.equal(report.offVocabularyIssuers.length, canonical.issuers.length);
    assert.equal(report.completedMeasurements.length, 0, 'nothing is measured when nothing matches');
    assert.match(sectorVocabularyLines(report)[0]!, /5 of 5 issuer\(s\) OFF-VOCABULARY/);
  });
});

describe('IID Stage 4 — the writer path is unprotected, so the read side is what closes G-14', () => {
  it('assertValidIssuerSectors has exactly one call site: the ingestion CLI', () => {
    const root = join(__dirname, '..', '..', 'src', 'investment');
    const calls: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
          walk(path);
          continue;
        }
        if (!entry.endsWith('.ts')) continue;
        const lines = readFileSync(path, 'utf8').split('\n');
        lines.forEach((line, index) => {
          const code = line.replace(/\/\/.*$/, '');
          if (!code.includes('assertValidIssuerSectors(')) return;
          if (code.includes('function assertValidIssuerSectors')) return;
          if (/^\s*import\b/.test(code) || /^\s*\*/.test(code)) return;
          calls.push(`${path.slice(root.length + 1)}:${index + 1}`);
        });
      }
    };
    walk(root);
    assert.deepEqual(
      calls.map((call) => call.replace(/:\d+$/, '')),
      ['cli/ingest.ts'],
      'the write-side guard is expected to have exactly one call site — that is WHY the read side must report',
    );
  });

  it('writeDataset persists an off-vocabulary sector, readDataset accepts it, and measurement reports it', () => {
    const temp = writeTempDataset(withSector(canonical, SOLE_HOSPITALITY.issuerId, BASELINE_SPELLING));
    try {
      // Digest-consistent, so the reader's integrity check passes: this is NOT the tamper case, which the
      // reader already refuses. It is the case the reader cannot catch, because nothing was corrupted.
      const read = readDataset(temp.dir);
      assert.equal(read.content.issuers.length, canonical.issuers.length);
      assert.equal(
        read.content.issuers.find((issuer) => issuer.issuerId === SOLE_HOSPITALITY.issuerId)!.sector,
        BASELINE_SPELLING,
        'the writer persisted the off-vocabulary value verbatim',
      );
      const report = measureCoverage(read.content, {
        datasetVersion: read.manifest.datasetVersion,
        generatedAt: OPTIONS.generatedAt,
      });
      assert.equal(report.offVocabularyIssuers.length, 1);
      assert.equal(report.offVocabularyIssuers[0]!.reason, 'NOT_IN_VOCABULARY');
      assert.ok(!report.completedMeasurements.includes(SOLE_HOSPITALITY.sector as never));
    } finally {
      temp.cleanup();
    }
  });

  it('a canonical dataset written the same way reports nothing, so the check has no false positives', () => {
    const temp = writeTempDataset(canonical);
    try {
      const read = readDataset(temp.dir);
      const report = measureCoverage(read.content, {
        datasetVersion: read.manifest.datasetVersion,
        generatedAt: OPTIONS.generatedAt,
      });
      assert.deepEqual(report.offVocabularyIssuers, []);
      assert.equal(report.completedMeasurements.length, 3);
      assert.equal(sectorVocabularyLines(report).length, 1);
    } finally {
      temp.cleanup();
    }
  });
});

describe('IID Stage 4 — the served surface discloses it without moving any position', () => {
  const clean = serve(canonical);
  const dirty = serve(withSector(canonical, SOLE_HOSPITALITY.issuerId, BASELINE_SPELLING));

  it('a canonical dataset serves an empty list and no note', () => {
    assert.deepEqual(clean.offVocabularyIssuers, []);
    assert.ok(!clean.notes.some((note) => /off-vocabulary|canonical sector names/i.test(note)));
    assert.doesNotMatch(clean.statusLine, /off-vocabulary/);
    assert.equal(clean.measuredSectors, 3);
  });

  it('carries the served shape, without leaking the input-file roster index', () => {
    assert.equal(dirty.offVocabularyIssuers.length, 1);
    const served = dirty.offVocabularyIssuers[0]!;
    assert.equal(served.issuerId, SOLE_HOSPITALITY.issuerId);
    assert.equal(served.legalName, SOLE_HOSPITALITY.legalName);
    assert.equal(served.sectorAsWritten, JSON.stringify(BASELINE_SPELLING));
    assert.equal(served.reason, 'NOT_IN_VOCABULARY');
    assert.equal(served.canonicalSector, null);
    assert.equal(served.correction, null);
    assert.ok(!('index' in served), 'the served shape must not leak a position in a file this read never saw');
  });

  it('a near miss serves the canonical value and the correction, so the note is actionable', () => {
    const served = serve(withSector(canonical, SOLE_HOSPITALITY.issuerId, 'hospitality')).offVocabularyIssuers[0]!;
    assert.equal(served.reason, 'CASE');
    assert.equal(served.canonicalSector, 'Hospitality');
    assert.equal(served.correction, 'match case exactly');
  });

  it('adds exactly one note, naming the issuer, the value and the consequence', () => {
    const extra = dirty.notes.filter((note) => !clean.notes.includes(note));
    assert.equal(extra.length, 1);
    assert.match(extra[0]!, /1 issuer\(s\) carry a sector that is not one of the 13 canonical sector names/);
    assert.ok(extra[0]!.includes(SOLE_HOSPITALITY.legalName), 'names the issuer');
    assert.match(extra[0]!, /Automobile/);
    assert.match(extra[0]!, /UNDERSTATES this dataset/);
    assert.match(extra[0]!, /trimmed, case-folded or otherwise normalised/);
    assert.match(extra[0]!, /correct the sector at source and re-ingest/);
  });

  it('the status line gains a clause only when true, so a clean dataset renders byte-identically', () => {
    assert.match(dirty.statusLine, /1 issuer\(s\) excluded from measurement by an off-vocabulary sector\.$/);
    assert.doesNotMatch(clean.statusLine, /off-vocabulary/);
    assert.match(clean.statusLine, /sector\(s\) measured\.$/);
  });

  it('DISCLOSURE, NOT A GATE: the ingestion-issue channel and every row state stay honest', () => {
    assert.equal(dirty.measuredSectors, clean.measuredSectors - 1);
    assert.equal(dirty.totalSectors, clean.totalSectors);
    assert.equal(dirty.issuers.length, clean.issuers.length, 'no issuer row was dropped');
    assert.deepEqual(dirty.issues, clean.issues, 'the ingestion-issue channel is untouched');
    // The hazard this avoids: routing the finding through `issues` would bucket it against the issuer and
    // flip that row to ISSUED_DATA, hiding a vocabulary defect inside a generic ingestion-issue count.
    const row = dirty.issuers.find((issuer) => issuer.issuerId === SOLE_HOSPITALITY.issuerId)!;
    assert.notEqual(row.state, 'ISSUED_DATA');
    assert.deepEqual(row.issueCodes, []);
    assert.equal(row.state, 'SECTOR_NOT_MEASURED', 'the honest state for an issuer in an unmeasured sector');
    assert.equal(dirty.counts.ISSUED_DATA, 0);
    assert.equal(dirty.counts.SECTOR_NOT_MEASURED, clean.counts.SECTOR_NOT_MEASURED + 1);
    // Identity disclosure is a separate axis and must not be disturbed by this one.
    assert.equal(dirty.identitySourcesAvailable, true);
    assert.equal(dirty.identitySourceDetail, null);
  });
});

describe('IID Stage 4 — the served HTTP route answers 200 with the disclosure in the body', () => {
  it('still 200, and the body carries the offender, the note and the status clause', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      {
        readInvestmentCoverage: () => serve(withSector(canonical, SOLE_HOSPITALITY.issuerId, BASELINE_SPELLING)),
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 200, 'disclosure must never turn into a page-level failure');
    const body = JSON.parse(response.body) as ReturnType<typeof serve>;
    assert.equal(body.offVocabularyIssuers.length, 1);
    assert.equal(body.offVocabularyIssuers[0]!.sectorAsWritten, JSON.stringify(BASELINE_SPELLING));
    assert.match(body.statusLine, /off-vocabulary sector/);
    assert.ok(body.notes.some((note) => /UNDERSTATES this dataset/.test(note)));
  });

  it('a canonical dataset serves 200 with an empty list, so the field is always present', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      { readInvestmentCoverage: () => serve(canonical), today: () => ASOF },
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    const body = JSON.parse(response.body) as ReturnType<typeof serve>;
    assert.ok('offVocabularyIssuers' in body, 'the field is required, so a consumer can rely on its presence');
    assert.deepEqual(body.offVocabularyIssuers, []);
    assert.equal(body.measuredSectors, 3);
  });
});

/* --------------------------------------------------------------------------------------------- *
 * IID Stage 4 — the §23 scenario-8 stage: `G3_WITHHELD`.
 *
 * `G3_WITHHELD` was reachable in `coverage/measure.ts` and consumed in `coverage/investmentCoverage.ts`
 * (a `G3_WITHHELD` sector is deliberately NOT `sectorMeasured`, so its issuers' rows are
 * `SECTOR_NOT_MEASURED`), but before this block nothing in the repository tested it: a repo-wide search
 * for the literal found it in two source files and zero test files. Scenario 8 of the baseline's §23 demo
 * is precisely this stage — Banking/Insurance/Capital Markets/Telecom `WITHHELD`, naming the missing
 * metrics (`BM_NIM`/`BM_GNPA`/`BM_CET1`), "never approximated" — so an untested stage is an unmet
 * Stage 4 limb, not a cosmetic gap.
 *
 * The stage rule is `measure.ts`: `measured` is "issuers AND annual periods exist"; the stage then splits
 * on method results. So `G3_WITHHELD` means a sector that WAS measured and whose measurement concluded
 * that nothing is computable. That is a stronger statement than `UNMEASURED` (no data at all), and the two
 * must not collapse — `Insurance` in this same fixture is the `UNMEASURED` comparator: it has an admitted
 * issuer and zero periods.
 * --------------------------------------------------------------------------------------------- */

const BANKING = canonical.issuers.find((issuer) => issuer.sector === 'Banking')!;
assert.ok(BANKING, 'the reference fixture must carry a Banking issuer for scenario 8 to be testable');

/**
 * Removes line items and operating-metric records for one issuer, so a sector's methods can be driven to
 * WITHHELD one input class at a time. Both `values` and `derived` are stripped: `presentLineItem` consults
 * `values` first and falls back to `derived`, so clearing only one would leave the item present.
 */
function withoutInputs(
  content: DatasetContent,
  issuerId: string,
  items: readonly LineItemId[],
  metricPrefixes: readonly string[],
): DatasetContent {
  const strip = <T,>(record: Readonly<Partial<Record<LineItemId, T>>>): Partial<Record<LineItemId, T>> => {
    const copy: Partial<Record<LineItemId, T>> = { ...record };
    for (const item of items) delete copy[item];
    return copy;
  };
  return {
    ...content,
    periods: content.periods.map((period) =>
      period.issuerId === issuerId
        ? { ...period, values: strip(period.values), derived: strip(period.derived) }
        : period,
    ),
    operatingMetrics: content.operatingMetrics.filter(
      (metric) => !(metric.issuerId === issuerId && metricPrefixes.some((prefix) => metric.metricId.startsWith(prefix))),
    ),
  };
}

/** The two inputs of Banking's only metric-free method, `DIVIDEND_DISCOUNT`. */
const DIVIDEND_DISCOUNT_INPUTS: readonly LineItemId[] = ['DIVIDENDS_PAID', 'EPS_DILUTED'];

/** Every Banking metric removed, line items intact: two methods withheld, one still usable ⇒ `G2_PARTIAL`. */
const metricsOnlyAbsent = withoutInputs(canonical, BANKING.issuerId, [], ['BM_']);
/** That plus `DIVIDEND_DISCOUNT`'s inputs removed: every method withheld ⇒ `G3_WITHHELD`. */
const fullyWithheld = withoutInputs(canonical, BANKING.issuerId, DIVIDEND_DISCOUNT_INPUTS, ['BM_']);

describe('IID Stage 4 — §23 scenario 8: a fully withheld sector is named, not approximated', () => {
  it('starts from a measured Banking sector, so the G3 result below is a change and not the fixture default', () => {
    const banking = sectorOf(canonicalReport, 'Banking');
    assert.equal(banking.stage, 'G2_PARTIAL');
    assert.equal(banking.measured, true);
    assert.deepEqual(banking.usableMethods, ['DIVIDEND_DISCOUNT']);
    assert.deepEqual(banking.withheldMethods, ['RESIDUAL_INCOME', 'PB_RELATIVE']);
  });

  it('withholds the two metric-dependent methods and names the missing Banking metrics', () => {
    const banking = sectorOf(measureCoverage(metricsOnlyAbsent, OPTIONS), 'Banking');
    assert.equal(banking.stage, 'G2_PARTIAL');
    const residual = banking.methods.find((method) => method.methodId === 'RESIDUAL_INCOME')!;
    assert.equal(residual.state, 'WITHHELD');
    assert.equal(residual.reason, 'MANDATORY_METRIC_MISSING');
    for (const metric of ['BM_CET1', 'BM_GNPA', 'BM_NIM']) {
      assert.ok(residual.missing.includes(metric), `RESIDUAL_INCOME must name ${metric} as missing`);
    }
    const pb = banking.methods.find((method) => method.methodId === 'PB_RELATIVE')!;
    assert.equal(pb.state, 'WITHHELD');
    assert.equal(pb.reason, 'MANDATORY_METRIC_MISSING');
    assert.deepEqual(pb.missing, ['BM_GNPA']);
  });

  it('reaches G3_WITHHELD when the last usable method also loses its inputs', () => {
    const banking = sectorOf(measureCoverage(fullyWithheld, OPTIONS), 'Banking');
    assert.equal(banking.stage, 'G3_WITHHELD');
    assert.equal(banking.measured, true, 'the sector WAS measured; its measurement concluded nothing is computable');
    assert.deepEqual(banking.usableMethods, []);
    assert.equal(banking.withheldMethods.length, banking.methods.length, 'every declared method is withheld');
    for (const method of banking.methods) {
      assert.equal(method.state, 'WITHHELD');
      assert.ok(method.reason !== null, 'a withheld method always carries a reason — never a silent pass');
      assert.ok(method.missing.length > 0, 'and it names what is missing');
      assert.deepEqual(method.issuersAvailable, [], 'no issuer is available for it');
    }
  });

  it('keeps G3_WITHHELD distinct from UNMEASURED, which is what Insurance in this fixture is', () => {
    const report = measureCoverage(fullyWithheld, OPTIONS);
    const banking = sectorOf(report, 'Banking');
    const insurance = sectorOf(report, 'Insurance');
    assert.equal(banking.stage, 'G3_WITHHELD');
    assert.equal(insurance.stage, 'UNMEASURED');
    assert.equal(insurance.issuersConsidered.length, 1, 'Insurance HAS an admitted issuer');
    assert.equal(insurance.annualPeriodsConsidered, 0, 'and no period at all — a different fact from Banking');
    assert.equal(banking.annualPeriodsConsidered > 0, true);
    assert.ok(
      report.completedMeasurements.includes('Banking'),
      'a completed measurement is a fact about the dataset: Banking was measured and is reported as measured',
    );
    assert.ok(
      report.outstandingSectors.includes('Insurance'),
      'Insurance is outstanding, because nothing was measured for it',
    );
  });

  it('never approximates: the served row for a G3 issuer is SECTOR_NOT_MEASURED, not COVERED', () => {
    const report = serve(fullyWithheld);
    const row = report.issuers.find((issuer) => issuer.issuerId === BANKING.issuerId)!;
    assert.equal(row.state, 'SECTOR_NOT_MEASURED');
    assert.equal(row.annualPeriods > 0, true, 'it has financials, so NO_FINANCIALS would be a lie');
    assert.deepEqual(row.issueCodes, [], 'and nothing was wrong with its data, so ISSUED_DATA would be a lie too');
    assert.equal(serve(canonical).issuers.find((i) => i.issuerId === BANKING.issuerId)!.state, 'COVERED',
      'the same issuer IS covered before its last method is withheld — so this is the stage rule, not a constant');
  });

  it('keeps the §23 scenario-10 arithmetic exact while a sector is fully withheld', () => {
    const report = serve(fullyWithheld);
    const states = ['COVERED', 'NO_FINANCIALS', 'SECTOR_NOT_MEASURED', 'ISSUED_DATA'] as const;
    const total = states.reduce((sum, state) => sum + report.counts[state], 0);
    assert.equal(report.counts.observed, report.issuers.length);
    assert.equal(total, report.counts.observed, 'the four states partition the observed population exactly');
    assert.equal(report.counts.ISSUED_DATA, 0);
    assert.equal(report.counts.NO_FINANCIALS, 1, 'the period-less Insurance issuer, which is a different fact again');
    assert.equal(report.counts.SECTOR_NOT_MEASURED, 1, 'the Banking issuer, whose sector is now fully withheld');
    assert.equal(report.counts.COVERED, 3, 'and the two Technology issuers plus Hospitality are untouched');
    for (const state of states) {
      assert.equal(
        report.issuers.filter((issuer) => issuer.state === state).length,
        report.counts[state],
        `each count agrees with its own rows, so the split is not a separate arithmetic (${state})`,
      );
    }
    const before = serve(canonical).counts;
    assert.equal(before.COVERED - report.counts.COVERED, 1, 'exactly one issuer moved, and it moved COVERED -> SECTOR_NOT_MEASURED');
    assert.equal(before.SECTOR_NOT_MEASURED + 1, report.counts.SECTOR_NOT_MEASURED);
    assert.equal(before.observed, report.counts.observed, 'no issuer entered or left the surface');
  });

  it('shows the one asymmetry a reader could misread, and pins it rather than hiding it', () => {
    /*
     * `measuredSectors` counts a completed MEASUREMENT (`measure.ts`: issuers and annual periods exist), so a
     * `G3_WITHHELD` sector is still in it — while `investmentCoverage.ts` deliberately excludes `G3_WITHHELD`
     * from `sectorMeasured`, so that sector's issuers are `SECTOR_NOT_MEASURED`. Both are correct statements
     * about different things: the sector WAS measured, and the measurement's conclusion is that no method is
     * computable for it. Neither number is adjusted here, because "3 sectors measured" is the dataset fact and
     * the per-issuer rows are the usability fact. What is not acceptable is a reader inferring one from the
     * other, so the pair is pinned together and the withholding is stated in the same report.
     */
    const report = serve(fullyWithheld);
    assert.equal(report.measuredSectors, 3, 'Banking is still a completed measurement');
    assert.equal(report.counts.SECTOR_NOT_MEASURED, 1, 'and its issuer is still not covered');
    const banking = sectorOf(measureCoverage(fullyWithheld, OPTIONS), 'Banking');
    assert.equal(banking.stage, 'G3_WITHHELD');
    assert.deepEqual(banking.usableMethods, []);
    assert.ok(
      report.notes.some((note) => typeof note === 'string') && report.statusLine.length > 0,
      'the report still carries its notes and status line, so the withholding is stated, not implied',
    );
  });

  it('prints the withheld stage in the summary with zero usable methods', () => {
    const summary = renderCoverageSummary(measureCoverage(fullyWithheld, OPTIONS));
    const line = summary.split('\n').find((entry) => entry.trimStart().startsWith('Banking'))!;
    assert.ok(line.includes('G3_WITHHELD'), `the stage is printed verbatim: ${line}`);
    assert.ok(line.includes('usable 0'), `and usable is zero: ${line}`);
    assert.ok(line.includes('withheld 3'), `every declared Banking method is counted as withheld: ${line}`);
    /*
     * The point of printing the stage: a reader of the ingest output can separate "measured, and nothing is
     * computable" from "never measured", even though both show `usable 0`. Banking also stays OUT of the
     * `outstanding` line while Insurance is on it, because Banking was measured.
     */
    const insurance = summary.split('\n').find((entry) => entry.trimStart().startsWith('Insurance'))!;
    assert.ok(insurance.includes('UNMEASURED'), `the comparator prints its own, different stage: ${insurance}`);
    assert.ok(line.includes('usable 0') && insurance.includes('usable 0'), 'both show usable 0 ...');
    assert.notEqual(line.trim().split(/\s+/)[1], insurance.trim().split(/\s+/)[1], '... but the stages differ');
    const outstanding = summary.split('\n').find((entry) => entry.startsWith('outstanding'))!;
    assert.ok(!outstanding.split(', ').includes('Banking'), 'Banking is not outstanding: it was measured');
    assert.ok(outstanding.split(', ').includes('Insurance'), 'Insurance is outstanding: nothing was measured for it');
  });
});
