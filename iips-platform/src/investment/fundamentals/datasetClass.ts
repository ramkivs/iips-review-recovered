/**
 * IID — DATASET PROVENANCE CLASSIFICATION.
 *
 * WHY THIS EXISTS. The dataset class is READER-VISIBLE: it is written into the assessment and
 * disposition provenance and rendered beside the dataset version. It therefore has to mean
 * something true.
 *
 * WHAT WAS WRONG. The class was decided by a substring test on the manifest's `provider` string:
 *
 * ```ts
 * manifest.provider.includes('synthetic') || manifest.provider.includes('fixture')
 *   ? 'SYNTHETIC_REFERENCE'
 *   : 'APPROVED_LOCAL_INGESTION';
 * ```
 *
 * That test made TWO unsupported claims at once. It asserted that any dataset whose provider
 * label did not happen to contain the words "synthetic" or "fixture" was "APPROVED" — a RIGHTS
 * state — and it did so from a free-text label that the same operator wrote. A provider string is
 * not an entitlement, and the word "approved" claims a review that nobody performed.
 *
 * The roadmap is explicit: a source is not permitted merely because it exists locally; a provider
 * label is not proof; classification evidence cannot be invented.
 *
 * THE RULE NOW. The class is derived from the manifest's DECLARED RIGHTS EVIDENCE, and from
 * nothing else:
 *
 * - rights `SYNTHETIC` -> `SYNTHETIC_REFERENCE`. No rights question arises.
 * - rights `OPERATOR_ASSERTED` -> `OPERATOR_SUPPLIED`. The operator has stated the use is within
 *   their authority and given the basis. This is their attestation, recorded so it can be
 *   audited; it is NOT an independent verification of any third party's rights.
 * - rights `UNKNOWN` (including a manifest written before the rights field existed) ->
 *   `UNKNOWN`. The dataset may be real and permitted, or real and not. Nothing here says which.
 *
 * `UNKNOWN` is the fail-closed state and the DEFAULT. A dataset that says nothing about its rights
 * says nothing, and nothing is not permission.
 *
 * THE VOCABULARY CHANGED DELIBERATELY. `APPROVED_LOCAL_INGESTION` is gone. It named an approval
 * that no review produced. The replacement `OPERATOR_SUPPLIED` names what actually happened: the
 * operator supplied this data. The rights question it used to answer is now answered, separately
 * and explicitly, by the rights declaration itself.
 */
import {
  assertSourceRights,
  sourceRightsOf,
  type DatasetManifest,
  type SourceRightsDeclaration,
  type SourceRightsState,
} from './manifest';

/**
 * How a dataset reached the assessment, in the vocabulary a reader can act on.
 *
 * - `SYNTHETIC_REFERENCE` — not real-world data; mechanics only.
 * - `OPERATOR_SUPPLIED` — operator-supplied data whose use the operator has attested to.
 * - `UNKNOWN` — the class could not be established from the evidence supplied.
 */
export type DatasetClass = 'SYNTHETIC_REFERENCE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN';

export const DATASET_CLASSES: readonly DatasetClass[] = Object.freeze([
  'SYNTHETIC_REFERENCE',
  'OPERATOR_SUPPLIED',
  'UNKNOWN',
]);

/**
 * The rights state, resolved. An absent declaration is `UNKNOWN`; a malformed one throws.
 */
export function rightsStateOf(manifest: Pick<DatasetManifest, 'sourceRights'>): SourceRightsState {
  return assertSourceRights(manifest.sourceRights).state;
}

/**
 * Classify a dataset from its declared rights evidence.
 *
 * The `provider` and `licence` strings are NOT consulted. They are free text a caller wrote; a
 * provider label is not proof of entitlement, and a licence string is not proof of one either.
 */
export function classifyDataset(manifest: Pick<DatasetManifest, 'sourceRights'>): DatasetClass {
  const rights = sourceRightsOf(manifest);
  switch (rights.state) {
    case 'SYNTHETIC':
      return 'SYNTHETIC_REFERENCE';
    case 'OPERATOR_ASSERTED':
      return 'OPERATOR_SUPPLIED';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Classify a dataset from a rights declaration directly, for callers that hold the declaration
 * rather than a manifest.
 */
export function classifyDatasetByRights(declaration: SourceRightsDeclaration | undefined | null): DatasetClass {
  const rights = assertSourceRights(declaration);
  switch (rights.state) {
    case 'SYNTHETIC':
      return 'SYNTHETIC_REFERENCE';
    case 'OPERATOR_ASSERTED':
      return 'OPERATOR_SUPPLIED';
    default:
      return 'UNKNOWN';
  }
}

/**
 * A one-line, reader-facing account of what the class does and does not assert.
 *
 * The `OPERATOR_SUPPLIED` line is deliberately explicit that it is an operator attestation and not
 * a verification, because that is the distinction a reader would otherwise have to guess at.
 */
export function datasetClassStatement(datasetClass: DatasetClass): string {
  switch (datasetClass) {
    case 'SYNTHETIC_REFERENCE':
      return 'SYNTHETIC_REFERENCE — the dataset is synthetic and demonstrates mechanics only; it is not real-world data.';
    case 'OPERATOR_SUPPLIED':
      return (
        'OPERATOR_SUPPLIED — operator-supplied data whose use the operator has attested to; this records their ' +
        'attestation and the basis they gave, and is not an independent verification of any third party’s rights.'
      );
    default:
      return (
        'UNKNOWN — no rights evidence was supplied with this dataset, so its permitted use is not established. ' +
        'The data may be real; that it is permitted is not shown.'
      );
  }
}
