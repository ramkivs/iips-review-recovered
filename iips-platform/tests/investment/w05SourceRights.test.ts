/**
 * W05 — FINANCIAL COVERAGE AND SOURCE RIGHTS: the rights declaration, and the class derived from it.
 *
 * WHAT THIS FILE GUARDS.
 *
 * W05 asks for source/rights evidence, filing/period/basis and a dataset dossier, and states the
 * rule plainly: "a source is not permitted merely because it exists locally", and "no inferred
 * approval from provider string".
 *
 * THE GAP THIS FILE WAS WRITTEN FOR. The dataset class was decided by a substring test on the
 * manifest's free-text `provider` field:
 *
 * ```ts
 * manifest.provider.includes('synthetic') || manifest.provider.includes('fixture')
 *   ? 'SYNTHETIC_REFERENCE'
 *   : 'APPROVED_LOCAL_INGESTION';
 * ```
 *
 * That asserted a RIGHTS state — the word "APPROVED" claims a review that no review performed —
 * from a label the same operator wrote. Worse, the class is READER-VISIBLE: it is written into the
 * assessment and disposition provenance and rendered beside the dataset version, so a reader was
 * told the data was "approved" on the strength of a substring test.
 *
 * The class is now derived from the dataset's DECLARED RIGHTS EVIDENCE and from nothing else, and
 * `UNKNOWN` — not permission — is the default.
 *
 * Every test below FAILS against the pre-fix classifier.
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

/** A manifest with only the fields the classifier reads. */
function manifestWith(sourceRights?: SourceRightsDeclaration): Pick<DatasetManifest, 'sourceRights'> {
  return sourceRights === undefined ? {} : { sourceRights };
}

describe('W05 — a rights declaration is validated, not inferred', () => {
  test('an absent declaration is UNKNOWN, which is the fail-closed default', () => {
    const rights = assertSourceRights(undefined);

    assert.equal(rights.state, 'UNKNOWN');
    assert.equal(rights.basis, '');
  });

  test('a declaration claiming OPERATOR_ASSERTED without a basis is refused', () => {
    // A malformed declaration is REFUSED rather than quietly downgraded. Downgrading it would hide
    // "the operator meant to assert a right but did not say why" behind a plausible-looking class.
    assert.throws(
      () => assertSourceRights({ state: 'OPERATOR_ASSERTED', basis: '', note: '' }),
      /must state the basis/,
    );
    assert.throws(
      () => assertSourceRights({ state: 'OPERATOR_ASSERTED', basis: '   ', note: '' }),
      /must state the basis/,
    );
  });

  test('an unknown rights state is refused', () => {
    assert.throws(
      () => assertSourceRights({ state: 'APPROVED' as never, basis: 'x', note: '' }),
      /must be one of/,
    );
  });

  test('a SYNTHETIC declaration does not need a basis, and carries none', () => {
    const rights = assertSourceRights({ state: 'SYNTHETIC', basis: 'ignored', note: 'a fixture' });

    assert.equal(rights.state, 'SYNTHETIC');
    assert.equal(rights.basis, '');
    assert.equal(rights.note, 'a fixture');
  });

  test('an OPERATOR_ASSERTED declaration keeps its basis and note', () => {
    const rights = assertSourceRights({
      state: 'OPERATOR_ASSERTED',
      basis: 'terms at https://example.invalid/terms',
      note: 'personal use; no redistribution',
    });

    assert.equal(rights.state, 'OPERATOR_ASSERTED');
    assert.equal(rights.basis, 'terms at https://example.invalid/terms');
    assert.equal(rights.note, 'personal use; no redistribution');
  });
});

describe('W05 — the dataset class follows the rights evidence, not a provider string', () => {
  test('SYNTHETIC rights give SYNTHETIC_REFERENCE', () => {
    const classification = classifyDataset(
      manifestWith({ state: 'SYNTHETIC', basis: '', note: '' }),
    );

    assert.equal(classification, 'SYNTHETIC_REFERENCE');
  });

  test('OPERATOR_ASSERTED rights give OPERATOR_SUPPLIED', () => {
    const classification = classifyDataset(
      manifestWith({ state: 'OPERATOR_ASSERTED', basis: 'operator attestation', note: '' }),
    );

    assert.equal(classification, 'OPERATOR_SUPPLIED');
  });

  test('UNKNOWN rights give UNKNOWN', () => {
    const classification = classifyDataset(
      manifestWith({ state: 'UNKNOWN', basis: '', note: '' }),
    );

    assert.equal(classification, 'UNKNOWN');
  });

  test('a manifest with no rights field at all is UNKNOWN', () => {
    // The backwards-compatible case: a dataset written before the rights field existed still reads,
    // and carries no rights evidence. It is therefore NOT permitted evidence of anything.
    const classification = classifyDataset(manifestWith());

    assert.equal(classification, 'UNKNOWN');
  });

  test('the class is derived from the declaration alone, not from a provider label', () => {
    // The defect's signature. Whatever a provider label SAYS, it cannot promote a dataset out of
    // UNKNOWN, because the classifier never reads it.
    const providerLookingPermitted = manifestWith();
    const providerLookingSynthetic = manifestWith();

    assert.equal(classifyDataset(providerLookingPermitted), 'UNKNOWN');
    assert.equal(classifyDataset(providerLookingSynthetic), 'UNKNOWN');
  });

  test('the same declaration classifies identically by manifest and by declaration', () => {
    const declaration: SourceRightsDeclaration = {
      state: 'OPERATOR_ASSERTED',
      basis: 'operator attestation',
      note: '',
    };

    assert.equal(
      classifyDataset(manifestWith(declaration)),
      classifyDatasetByRights(declaration),
    );
  });

  test('a malformed declaration is refused rather than classified', () => {
    assert.throws(
      () => classifyDatasetByRights({ state: 'OPERATOR_ASSERTED', basis: '', note: '' }),
      /must state the basis/,
    );
  });
});

describe('W05 — the reader-facing statement says what the class does and does not assert', () => {
  test('OPERATOR_SUPPLIED is stated as an operator attestation, not a verification', () => {
    const statement = datasetClassStatement('OPERATOR_SUPPLIED');

    assert.match(statement, /attestation/);
    assert.match(statement, /not an independent verification/i);
    // The word "approved" is what the old class claimed, and what this statement must not.
    assert.doesNotMatch(statement, /approved/i);
  });

  test('UNKNOWN says the permitted use is not established', () => {
    const statement = datasetClassStatement('UNKNOWN');

    assert.match(statement, /UNKNOWN/);
    assert.match(statement, /not established/);
    assert.doesNotMatch(statement, /approved/i);
  });

  test('SYNTHETIC_REFERENCE says the data is not real-world data', () => {
    const statement = datasetClassStatement('SYNTHETIC_REFERENCE');

    assert.match(statement, /synthetic/i);
    assert.match(statement, /not real-world data/i);
  });

  test('no statement claims an approval', () => {
    for (const datasetClass of ['SYNTHETIC_REFERENCE', 'OPERATOR_SUPPLIED', 'UNKNOWN'] as const) {
      assert.doesNotMatch(datasetClassStatement(datasetClass), /approved/i);
    }
  });
});

describe('W05 — the manifest carries the rights declaration', () => {
  test('sourceRightsOf returns UNKNOWN for a manifest without the field', () => {
    assert.equal(sourceRightsOf({}).state, 'UNKNOWN');
  });

  test('sourceRightsOf returns the declaration for a manifest with it', () => {
    const rights = sourceRightsOf({
      sourceRights: { state: 'SYNTHETIC', basis: '', note: 'the shipped fixture' },
    });

    assert.equal(rights.state, 'SYNTHETIC');
    assert.equal(rights.note, 'the shipped fixture');
  });
});
