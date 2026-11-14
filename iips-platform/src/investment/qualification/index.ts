/**
 * W10 — issuer-to-engine qualification (public surface).
 *
 * `qualifyIssuerToEngines` answers a readiness question for one issuer against all thirteen certified
 * sector engines; `TRACKED_ENGINE_PROFILES` is the audited field-level mapping it applies. Nothing here
 * scores, ranks or recommends: a qualified engine is one whose declared inputs are resolvable from
 * governed IID evidence, and that is the whole claim.
 */
export * from './types';
export * from './evidence';
export {
  DERIVATIONS,
  TRACKED_ENGINE_PROFILES,
  allFieldMappings,
  canonicalJson,
  getEngineProfile,
  type DerivationDefinition,
  type FieldDeclaration,
} from './mapping';
export { FieldResolver, fieldQualification, normaliseClassification, type Resolution } from './resolve';
export { IssuerQualificationError, qualifyIssuerToEngines } from './qualify';
export {
  MATRIX_BEGIN,
  MATRIX_END,
  mappingTotals,
  renderMappingMatrixMarkdown,
} from './render';
