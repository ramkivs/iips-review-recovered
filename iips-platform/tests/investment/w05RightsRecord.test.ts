/**
 * W05-B — the dataset-level source and usage rights record.
 *
 * Acceptance tests: 4 (unsupported rights declarations fail closed), plus negative tests for
 * malformed rights evidence and inconsistent provenance, and 13 (existing W05 source-rights
 * classification and previously accepted behaviour remain unchanged).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSourceRights,
  sourceRightsOf,
  type DatasetManifest,
  type SourceRightsDeclaration,
} from '../../src/investment/fundamentals/manifest';
import {
  classifyDataset,
  classifyDatasetByRights,
  datasetClassStatement,
} from '../../src/investment/fundamentals/datasetClass';
import {
  RightsRecordError,
  buildRightsRecord,
  rightsRecordFromManifest,
  type PermissionState,
  type RightsEvidence,
} from '../../src/investment/lifecycle/rightsRecord';
import {
  operatorAssertedRightsRecord,
  syntheticRightsRecord,
} from './w05LifecycleFixture';

const AS_OF = '2026-09-15';

function evidence(overrides: Partial<RightsEvidence> = {}): RightsEvidence {
  return {
    sourceIdentity: 'synthetic operator source',
    sourceType: 'OPERATOR_SUPPLIED_FILE',
    documentReference: 'SYNTHETIC-FILING-REF',
    acquisitionMethod: 'OPERATOR_SUPPLIED_FILE',
    acquisitionDate: AS_OF,
    evidenceRefs: ['sha256:synthetic-evidence-digest'],
    ...overrides,
  };
}

function permissions(overrides: Partial<Record<'ACQUISITION' | 'LOCAL_STORAGE' | 'PROCESSING' | 'ANALYSIS' | 'DISPLAY' | 'RETENTION' | 'REDISTRIBUTION', PermissionState>> = {}) {
  return {
    ACQUISITION: 'PERMITTED',
    LOCAL_STORAGE: 'PERMITTED',
    PROCESSING: 'PERMITTED',
    ANALYSIS: 'PERMITTED',
    DISPLAY: 'PERMITTED',
    RETENTION: 'PERMITTED',
    REDISTRIBUTION: 'NOT_PERMITTED',
    ...overrides,
  };
}

describe('W05 — the rights record fails closed on unsupported and malformed declarations', () => {
  test('test 4 — an unknown rights state is refused, never accepted as free text', () => {
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'APPROVED' as never, basis: 'x', note: '' },
            evidence: evidence(),
            permissions: permissions(),
          },
          AS_OF,
        ),
      /must be one of/,
    );
  });

  test('test 4 — an unsupported acquisition method is refused', () => {
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: {
              state: 'OPERATOR_ASSERTED',
              basis: 'terms recorded',
              note: '',
            },
            evidence: evidence({ acquisitionMethod: 'AUTOMATED_EXCHANGE_RETRIEVAL' as never }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'UNSUPPORTED_ACQUISITION_METHOD');
        return true;
      },
    );
  });

  test('test 4 — an unsupported source type is refused', () => {
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence({ sourceType: 'SCRAPED_FROM_EXCHANGE' as never }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'UNSUPPORTED_SOURCE_TYPE');
        return true;
      },
    );
  });

  test('an OPERATOR_ASSERTED declaration without any evidence reference is refused', () => {
    // A provider name or a bare assertion is not independent permission.
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'we think we may', note: '' },
            evidence: evidence({ documentReference: null, evidenceRefs: [] }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'MISSING_EVIDENCE_REFERENCE');
        return true;
      },
    );
  });

  test('negative — inconsistent provenance is refused, never reconciled', () => {
    // Synthetic evidence with a non-synthetic declaration…
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence({ sourceType: 'SYNTHETIC_GENERATED', acquisitionMethod: 'SYNTHETIC_GENERATION' }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'INCONSISTENT_PROVENANCE');
        return true;
      },
    );

    // …and the reverse: a synthetic declaration with real-source evidence.
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'SYNTHETIC', basis: '', note: '' },
            evidence: evidence(),
            permissions: permissions(),
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'INCONSISTENT_PROVENANCE');
        return true;
      },
    );
  });

  test('negative — malformed evidence and permissions are refused', () => {
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence({ sourceIdentity: '   ' }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      /must name its source/,
    );
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence({ acquisitionDate: '17 November 2026' }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      /ISO calendar date/,
    );
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence(),
            permissions: { ACQUISITION: 'PERMITTED' } as never,
          },
          AS_OF,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RightsRecordError);
        assert.equal(error.code, 'MALFORMED_PERMISSIONS');
        return true;
      },
    );
    assert.throws(
      () =>
        buildRightsRecord(
          {
            manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
            evidence: evidence({ evidenceRefs: [''] }),
            permissions: permissions(),
          },
          AS_OF,
        ),
      /non-empty reference strings/,
    );
  });

  test('unknown or denied purposes produce UNKNOWN / RESTRICTED status — never eligibility', () => {
    const unknown = buildRightsRecord(
      {
        manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
        evidence: evidence(),
        permissions: permissions({ RETENTION: 'UNKNOWN' }),
      },
      AS_OF,
    );
    assert.equal(unknown.status, 'UNKNOWN');
    assert.match(unknown.statusReason, /RETENTION/);

    const restricted = buildRightsRecord(
      {
        manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
        evidence: evidence(),
        permissions: permissions({ DISPLAY: 'NOT_PERMITTED' }),
      },
      AS_OF,
    );
    assert.equal(restricted.status, 'RESTRICTED');

    // An absent declaration is UNKNOWN: nothing is not permission.
    const absent = rightsRecordFromManifest(undefined, AS_OF);
    assert.equal(absent.status, 'UNKNOWN');
    assert.equal(absent.datasetClass, 'UNKNOWN');
  });

  test('redistribution is recorded but never authorised by the mechanism', () => {
    const claimingRedistribution = buildRightsRecord(
      {
        manifestRights: { state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' },
        evidence: evidence(),
        // The evidence even CLAIMS redistribution is permitted…
        permissions: permissions({ REDISTRIBUTION: 'PERMITTED' }),
      },
      AS_OF,
    );
    // …but the mechanism still records redistribution as NOT AUTHORISED, and eligibility never
    // depends on the claim. Recording a claim is not authorising a use.
    assert.equal(claimingRedistribution.redistributionAuthorisation, 'NOT_AUTHORISED');
    assert.equal(claimingRedistribution.independentSourceRightsVerification, 'NOT_CLAIMED');
    assert.equal(claimingRedistribution.status, 'ELIGIBLE_LOCAL_PERSONAL_USE');
    assert.match(claimingRedistribution.statusReason, /redistribution is never authorised/);
  });

  test('a synthetic record and an operator-asserted record keep their distinct classes', () => {
    const synthetic = syntheticRightsRecord(AS_OF);
    assert.equal(synthetic.datasetClass, 'SYNTHETIC_REFERENCE');
    assert.equal(synthetic.status, 'ELIGIBLE_LOCAL_PERSONAL_USE');

    const operator = operatorAssertedRightsRecord(AS_OF);
    assert.equal(operator.datasetClass, 'OPERATOR_SUPPLIED');
    assert.equal(operator.status, 'ELIGIBLE_LOCAL_PERSONAL_USE');
  });
});

describe('W05 — test 13: existing source-rights classification behaviour is unchanged', () => {
  // Pinned expectations exactly as the accepted `w05SourceRights` / `w05CoverageSourceRights` work
  // established them. If any of these change, previously accepted behaviour has been altered.
  test('the declaration semantics are exactly as accepted', () => {
    const absent = assertSourceRights(undefined);
    assert.equal(absent.state, 'UNKNOWN');
    assert.equal(absent.basis, '');

    assert.throws(() => assertSourceRights({ state: 'OPERATOR_ASSERTED', basis: '', note: '' }), /must state the basis/);
    assert.throws(() => assertSourceRights({ state: 'APPROVED' as never, basis: 'x', note: '' }), /must be one of/);

    const synthetic = assertSourceRights({ state: 'SYNTHETIC', basis: 'ignored', note: 'a fixture' });
    assert.equal(synthetic.state, 'SYNTHETIC');
    assert.equal(synthetic.basis, '');
    assert.equal(synthetic.note, 'a fixture');
  });

  test('the dataset class follows the rights evidence and nothing else', () => {
    assert.equal(classifyDatasetByRights({ state: 'SYNTHETIC', basis: '', note: '' }), 'SYNTHETIC_REFERENCE');
    assert.equal(
      classifyDatasetByRights({ state: 'OPERATOR_ASSERTED', basis: 'terms recorded', note: '' }),
      'OPERATOR_SUPPLIED',
    );
    assert.equal(classifyDatasetByRights(undefined), 'UNKNOWN');

    // A provider string is still never consulted — the manifest fixture below claims a synthetic-looking
    // provider with no declaration and must classify as UNKNOWN.
    const manifest = { provider: 'synthetic-fixture-factory', licence: 'fixture' } as Pick<DatasetManifest, 'sourceRights'>;
    assert.equal(classifyDataset(manifest), 'UNKNOWN');
    assert.equal(sourceRightsOf(manifest).state, 'UNKNOWN');
    assert.match(datasetClassStatement('UNKNOWN'), /permitted use is not established/);
    assert.match(datasetClassStatement('OPERATOR_SUPPLIED'), /not an independent verification/);
    assert.match(datasetClassStatement('SYNTHETIC_REFERENCE'), /mechanics only/);
  });
});
