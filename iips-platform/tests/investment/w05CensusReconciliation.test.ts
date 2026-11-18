/**
 * W05 — census reconciliation harness tests (PR #598 final targeted review, item 2).
 *
 * THESE TESTS USE SYNTHETIC, DECLARED ROWS. They are NOT the W04 revision-1 holdings (those rows
 * are in no repository and were never supplied to this codebase) and they are NOT the 68-row
 * published Dhan CSV census. They pin the harness MECHANICS only: rows are consumed verbatim, the
 * run reconciles holding by holding, every identity disagreement between the census's stored
 * security identity and the run's resolution story is disclosed (D2), and no revision-1 coverage
 * figure is ever produced or claimed from rows that are not the revision-1 rows.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  observationsFromCensusRows,
  runCensusReconciliation,
  type CensusHoldingRow,
} from '../../src/investment/lifecycle/censusReconciliation';
import { loadFixtureSources } from './identityFixture';
import { ISSUER_A, ISSUER_B, suitableEntry } from './w05LifecycleFixture';

const AS_OF = '2026-09-15';

function row(overrides: Partial<CensusHoldingRow> & { holdingId: string }): CensusHoldingRow {
  return {
    portfolioId: 'PORT-SYNTHETIC',
    portfolioRevision: 'rev-test-1',
    symbol: null,
    isin: null,
    exchange: null,
    quantity: 10,
    storedSecurityIdentity: null,
    category: 'MISSING_OR_UNRESOLVED',
    ...overrides,
  };
}

describe('W05 — census reconciliation harness: declared synthetic rows, holding by holding', () => {
  test('the run reconciles every row and never asserts a revision-1 figure', () => {
    const rows: CensusHoldingRow[] = [
      // Resolves on ISIN; the census stored an identity. Both sides identify.
      row({ holdingId: 'R-1', isin: 'IN0000000011', symbol: 'AARAV', exchange: 'NSE', storedSecurityIdentity: 'IN0000000011', category: 'QUALIFIED' }),
      // D2 PIN: no ISIN, symbol+exchange only, census stored NO identity. The run RESOLVEDS on
      // EXCHANGE_SYMBOL — the run reports what the census does not support. Disclosed disagreement.
      row({ holdingId: 'R-2', symbol: 'AARAV', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
      // Neither side identifies.
      row({ holdingId: 'R-3', symbol: 'NOSUCH', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
      // The census stored an identity the run cannot use. Disclosed disagreement.
      row({ holdingId: 'R-4', symbol: 'NOSUCH2', exchange: 'NSE', storedSecurityIdentity: 'SEC-ORPHAN-1', category: 'AMBIGUOUS' }),
      // Excluded from the roadmap's eligible set E by designation: never rows, never unresolved.
      row({ holdingId: 'R-5', isin: 'IN0000000029', symbol: 'BODHI', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' }),
    ];

    const result = runCensusReconciliation({
      asOf: AS_OF,
      rows,
      identitySources: loadFixtureSources(),
      datasets: [suitableEntry([ISSUER_A], { datasetVersion: 'sha256:1111000000000000000000000000000000000000000000000000000000000000' })],
      eligibleSet: {
        basis: 'synthetic product-scope designation (test)',
        exclusions: [{ observationId: 'R-5', reason: 'instrument class outside product scope' }],
      },
    });

    assert.equal(result.summary.rowsSupplied, 5);
    assert.equal(result.summary.runResolved, 2, 'R-1 (ISIN) and R-2 (exchange+symbol)');
    assert.equal(result.summary.runUnresolved, 2, 'R-3 and R-4');
    assert.equal(result.summary.excludedFromEligibleSet, 1, 'R-5 is itemised under E exclusions only');
    assert.equal(result.eligibleSet.size, 4);
    assert.equal(result.eligibleSet.exclusions.length, 1);
    assert.equal(result.eligibleSet.exclusions[0]!.observationId, 'R-5');
    assert.equal(result.eligibleSet.exclusions[0]!.reason, 'instrument class outside product scope');

    // The headline refuses to present any revision-1 figure.
    assert.match(result.summary.headline, /no revision-1 coverage figure is asserted/);
    assert.ok(result.notes.some((note) => /D1 keeps the censuses apart/.test(note)));

    // Holding-by-holding entries carry the census story and the run story side by side.
    const byId = new Map(result.entries.map((entry) => [entry.holdingId, entry]));
    assert.deepEqual(byId.get('R-1')!.census, { category: 'QUALIFIED', storedSecurityIdentity: 'IN0000000011' });
    assert.equal(byId.get('R-1')!.run.disposition, 'RESOLVED');
    assert.equal(byId.get('R-1')!.run.resolutionBasis, 'ISIN');
    assert.equal(byId.get('R-1')!.run.issuerId, ISSUER_A);
    assert.equal(byId.get('R-1')!.run.contributesToFinancialRatioNumerator, true);
    assert.equal(byId.get('R-2')!.run.contributesToFinancialRatioNumerator, true);
    assert.equal(byId.get('R-3')!.run.disposition, 'UNRESOLVED');
    assert.equal(byId.get('R-3')!.run.issuerId, null);
    assert.equal(byId.get('R-5')!.run.disposition, 'EXCLUDED_FROM_E');

    // The four disagreement states are all reachable and counted.
    assert.deepEqual(result.summary.agreement, {
      BOTH_IDENTIFIED: 1,
      BOTH_UNIDENTIFIED: 2,
      CENSUS_ONLY: 1,
      RUN_ONLY: 1,
    });

    // The category × disposition table is the reconciliation the operator reads.
    const table = new Map(result.summary.categoryByDisposition.map((entry) => [entry.category, entry]));
    assert.deepEqual(table.get('QUALIFIED'), { category: 'QUALIFIED', resolved: 1, unresolved: 0, excludedFromEligibleSet: 0 });
    assert.deepEqual(table.get('MISSING_OR_UNRESOLVED'), {
      category: 'MISSING_OR_UNRESOLVED',
      resolved: 1,
      unresolved: 1,
      excludedFromEligibleSet: 1,
    });
    assert.deepEqual(table.get('AMBIGUOUS'), { category: 'AMBIGUOUS', resolved: 0, unresolved: 1, excludedFromEligibleSet: 0 });
  });

  test('D2 nuance pinned: census NULL stored identity + run RESOLVED on EXCHANGE_SYMBOL is a disclosed disagreement', () => {
    const result = runCensusReconciliation({
      asOf: AS_OF,
      rows: [row({ holdingId: 'R-2', symbol: 'AARAV', exchange: 'NSE', category: 'MISSING_OR_UNRESOLVED' })],
      identitySources: loadFixtureSources(),
      datasets: [],
    });

    const entry = result.entries[0]!;
    assert.equal(entry.census.storedSecurityIdentity, null);
    assert.equal(entry.run.disposition, 'RESOLVED');
    assert.equal(entry.run.resolutionBasis, 'EXCHANGE_SYMBOL', 'the run resolved on exchange+symbol alone');
    assert.equal(entry.identityAgreement.state, 'RUN_ONLY');
    assert.equal(entry.identityAgreement.agrees, false, 'the run reports what the census does not support');
    assert.match(entry.identityAgreement.note!, /census stored NO security identity/);
    assert.match(entry.identityAgreement.note!, /EXCHANGE_SYMBOL/);
    assert.match(entry.identityAgreement.note!, /D2/);
    assert.match(entry.identityAgreement.note!, /disclosed disagreement, never a reconciliation win/);
  });

  test('without installed identity sources the run resolves nothing and says so per holding', () => {
    const result = runCensusReconciliation({
      asOf: AS_OF,
      rows: [
        row({ holdingId: 'R-1', isin: 'IN0000000011', symbol: 'AARAV', exchange: 'NSE' }),
        row({ holdingId: 'R-2', symbol: 'AARAV', exchange: 'NSE', storedSecurityIdentity: 'IN0000000011', category: 'QUALIFIED' }),
      ],
      identitySources: null,
      datasets: [],
    });

    assert.equal(result.summary.runResolved, 0);
    assert.equal(result.summary.runUnresolved, 2);
    assert.equal(result.entries[0]!.identityAgreement.state, 'BOTH_UNIDENTIFIED');
    assert.equal(result.entries[0]!.identityAgreement.agrees, true);
    assert.equal(result.entries[1]!.identityAgreement.state, 'CENSUS_ONLY');
    assert.equal(result.entries[1]!.identityAgreement.agrees, false);
    assert.match(result.entries[1]!.identityAgreement.note!, /disclosed disagreement/);
  });

  test('census rows are consumed verbatim — no field is normalised, guessed, or filled in', () => {
    const rows = [row({ holdingId: 'R-9', symbol: 'a arav ', isin: ' in0000000011 ', quantity: null, category: 'UNAVAILABLE' })];
    const observations = observationsFromCensusRows(rows);
    assert.equal(observations.length, 1);
    assert.equal(observations[0]!.observationId, 'R-9');
    assert.equal(observations[0]!.symbol, 'a arav ', 'the row is consumed exactly as stored');
    assert.equal(observations[0]!.isin, ' in0000000011 ');
    assert.equal(observations[0]!.quantity, null);
    assert.equal(observations[0]!.upstreamStatus, 'UNAVAILABLE');
    assert.equal(observations[0]!.raw.storedSecurityIdentity, null);
    assert.equal(observations[0]!.raw.category, 'UNAVAILABLE');
  });
});
