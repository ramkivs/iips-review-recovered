/**
 * IID-1 — coverage computation (AC-1.9 determinism, counts, and the IID-0 carry-forward disclosures).
 *
 * Coverage is derived from per-row classification, never from an upstream summary. The report also has to
 * keep the IID-0 limitations visible: 3 of 13 sectors measured, 20 XBRL tags mapped, 8 derivations, and a
 * synthetic roster that validates mechanics rather than real-company coverage.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildFinancialCoverageDisclosure,
  buildStatusLine,
  computeIdentityCoverage,
} from '../../src/investment/identity/coverage';
import { stateSummaryLine } from '../../src/investment/identity/coverage';
import { canonicalize } from '../../src/investment/fundamentals/canonical';
import { measureCoverage } from '../../src/investment/coverage/measure';
import { XBRL_TAG_MAP } from '../../src/investment/ingestion/xbrl';
import { DERIVATIONS } from '../../src/investment/fundamentals/derive';
import type { IdentityObservation } from '../../src/investment/identity/types';
import { loadFixtureSources, fixtureObservations, FIXTURE_AS_OF } from './identityFixture';
import { referenceContent, writeTempDataset } from './fixtures';

const sources = loadFixtureSources();
const observations = fixtureObservations();
const disclosure = buildFinancialCoverageDisclosure({});

function reportFor(list: readonly IdentityObservation[], asOf = FIXTURE_AS_OF) {
  return computeIdentityCoverage({
    observations: list,
    sources,
    asOf,
    generatedAt: `${asOf}T00:00:00.000Z`,
    financialCoverage: disclosure,
  });
}

const report = reportFor(observations);

describe('counts', () => {
  test('every state is counted, and the totals are the rows themselves', () => {
    assert.deepEqual(
      { ...report.counts },
      {
        observed: 18,
        assessable: 4,
        RESOLVED: 4,
        AMBIGUOUS: 1,
        UNMATCHED: 3,
        INELIGIBLE: 4,
        OUT_OF_SCOPE_SECURITY: 1,
        STALE_REFERENCE: 2,
        REJECTED_MALFORMED_ISIN: 1,
        ISSUER_KEY_CONFLICT: 1,
        AMBIGUOUS_LISTING: 1,
      },
    );
    const summed = Object.entries(report.counts)
      .filter(([key]) => !['observed', 'assessable'].includes(key))
      .reduce((total, [, value]) => total + value, 0);
    assert.equal(summed, report.counts.observed);
  });

  test('counts are broken down by source surface', () => {
    assert.deepEqual(report.bySource.HOLDING, { observed: 6, resolved: 2, unresolved: 4, assessable: 2 });
    assert.deepEqual(report.bySource.BROKER_PREVIEW, { observed: 4, resolved: 1, unresolved: 3, assessable: 1 });
    assert.deepEqual(report.bySource.WATCHLIST, { observed: 8, resolved: 1, unresolved: 7, assessable: 1 });
  });

  test('the status line states what was and was not assessed', () => {
    assert.equal(
      report.statusLine,
      '4 of 18 observed rows assessed · 9 unresolved · 6 holdings in scope · 1 out-of-scope security · 4 ineligible',
    );
  });

  test('every unresolved row carries a reason and display text', () => {
    assert.equal(report.unresolved.length, 14);
    for (const item of report.unresolved) {
      assert.notEqual(item.reason, null, `${item.observationId} has no reason`);
      assert.notEqual(item.reasonText, null, `${item.observationId} has no display text`);
      assert.equal(item.reasonText!.length > 20, true);
    }
  });

  test('an unresolved row exposes the raw observation but no company metric', () => {
    const item = report.items.find((entry) => entry.observationId === 'H-05')!;
    assert.deepEqual(item.raw, { companyId: 'Banking-H1', quantity: 0 });
    const keys = Object.keys(item);
    assert.equal(keys.some((key) => /marketValue|weight|price|valuation|intrinsic/i.test(key)), false);
  });

  test('the summary line names the state for unresolved rows and the basis for resolved ones', () => {
    const resolved = report.items.find((item) => item.observationId === 'H-01')!;
    const unresolved = report.items.find((item) => item.observationId === 'H-04')!;
    assert.match(stateSummaryLine(resolved), /resolved via ISIN/);
    assert.match(stateSummaryLine(unresolved), /^AMBIGUOUS: /);
  });
});

describe('AC-1.9 — determinism', () => {
  test('100 shuffled observation orderings produce byte-identical reports', () => {
    const baseline = canonicalize(reportFor(observations));
    let seed = 12345;
    const next = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let run = 0; run < 100; run += 1) {
      const shuffled = [...observations];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      assert.equal(canonicalize(reportFor(shuffled)), baseline, `ordering ${run} changed the report`);
    }
  });

  test('reordering the listing map and the roster does not change any resolution', () => {
    const shuffledSources = {
      ...sources,
      roster: { ...sources.roster, issuers: [...sources.roster.issuers].reverse(), securities: [...sources.roster.securities].reverse() },
      listingMap: { ...sources.listingMap, entries: [...sources.listingMap.entries].reverse() },
    };
    const reference = computeIdentityCoverage({
      observations,
      sources,
      asOf: FIXTURE_AS_OF,
      generatedAt: `${FIXTURE_AS_OF}T00:00:00.000Z`,
      financialCoverage: disclosure,
    });
    const reordered = computeIdentityCoverage({
      observations,
      sources: shuffledSources,
      asOf: FIXTURE_AS_OF,
      generatedAt: `${FIXTURE_AS_OF}T00:00:00.000Z`,
      financialCoverage: disclosure,
    });
    const project = (value: typeof reference) =>
      value.items.map((item) => [
        item.observationId,
        item.state,
        item.reason,
        item.resolution.issuerId,
        item.resolution.securityId,
        item.resolution.listingId,
        item.resolution.resolutionBasis,
      ]);
    assert.deepEqual(project(reordered), project(reference));
  });

  test('resolution follows the requested date, not the wall clock', () => {
    const early = reportFor(observations, '2020-03-01');
    const oldco = early.items.find((item) => item.observationId === 'H-06')!;
    const aarav = early.items.find((item) => item.observationId === 'H-01')!;
    assert.equal(oldco.state, 'RESOLVED', 'OLDCO was the effective symbol in March 2020');
    assert.equal(aarav.state, 'STALE_REFERENCE', 'AARAV had not started trading yet');
  });
});

describe('IID-0 carry-forward disclosures', () => {
  test('financial coverage is disclosed separately and states the measured sector count', () => {
    const content = referenceContent();
    const temp = writeTempDataset(content);
    try {
      const sectorReport = measureCoverage(content, {
        datasetVersion: temp.written.manifest.datasetVersion,
        generatedAt: `${FIXTURE_AS_OF}T00:00:00.000Z`,
      });
      const fin = buildFinancialCoverageDisclosure({
        sectorReport,
        manifest: temp.written.manifest,
        unmappedTagsObserved: ['DeferredTaxExpense'],
      });
      assert.equal(fin.measuredSectors, 3);
      assert.equal(fin.totalSectors, 13);
      assert.equal(fin.outstandingSectors.length, 10);
      assert.ok(fin.outstandingSectors.includes('Insurance'));
      assert.equal(fin.xbrlMappedTags, Object.keys(XBRL_TAG_MAP).length);
      // 20 tags before `L-036`/V2; the associates/JV caption adds the two component tags (22).
      assert.equal(fin.xbrlMappedTags, 22);
      assert.equal(fin.derivationItems, DERIVATIONS.length);
      assert.equal(fin.derivationItems, 8);
      assert.deepEqual(fin.unmappedTagsObserved, ['DeferredTaxExpense']);
      assert.equal(fin.datasetClass, 'SYNTHETIC_FIXTURE');
      assert.match(fin.note, /3 of 13 sectors/);
      assert.match(fin.note, /not a covered sector/);
    } finally {
      temp.cleanup();
    }
  });

  test('with no dataset at all the disclosure says so instead of assuming coverage', () => {
    const fin = buildFinancialCoverageDisclosure({});
    assert.equal(fin.measuredSectors, 0);
    assert.equal(fin.totalSectors, 0);
    assert.equal(fin.datasetClass, 'NONE');
    assert.match(fin.note, /0 of 0 sectors/);
  });

  test('the report carries the roster data class so synthetic evidence is labelled', () => {
    assert.equal(report.identitySources.rosterDataClass, 'SYNTHETIC_FIXTURE');
    assert.ok(report.notes.some((note) => /synthetic fixture/.test(note)));
  });

  test('identity coverage is explicitly distinguished from financial coverage', () => {
    assert.ok(report.notes.some((note) => /not a valuation/.test(note)));
    assert.ok(report.notes.some((note) => /EXCHANGE_SYMBOL/.test(note)));
  });

  test('successor reconciliation appears in the report even where nobody holds the successor', () => {
    const demerger = report.successorReconciliations.find((entry) => entry.actionId === 'CA-BODHI-DEMERGER-2025')!;
    assert.ok(demerger !== undefined);
    assert.equal(demerger.measuredWeight, 0.6);
    assert.equal(demerger.unmeasuredWeight, 0.4);
    assert.equal(demerger.reconciles, true);
  });

  test('the status line counts holdings only from the holdings surface', () => {
    const line = buildStatusLine(observations, report.items);
    assert.match(line, /6 holdings in scope/);
  });
});
