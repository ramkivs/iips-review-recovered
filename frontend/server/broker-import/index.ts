/**
 * CAP-02 broker-import — narrow server-only composition exports.
 *
 * Authority: `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.2.
 *
 * Server-only by construction: every module behind this boundary is Node-side trusted-host code.
 * Nothing here may be imported by the renderer (`frontend/src/**`): the browser consumes the
 * CAP-02 route through `frontend/src/api/brokerImport.ts` over HTTP, never through this tree.
 * No module in this directory listens, connects, writes or registers a global hook at import time.
 */
export {
  BROKER_IMPORT_DTO_KEYS,
  BROKER_IMPORT_MODES,
  BROKER_IMPORT_MAX_HOLDINGS,
  BROKER_OBSERVED_HOLDING_KEYS,
  validateBrokerImportSaveDto,
  validatePortfolioIdParam,
  type BrokerImportSaveDto,
  type BrokerImportValidationRefusal,
  type BrokerImportBoundaryResult,
  type BrokerObservedHoldingInput,
} from './brokerImportBoundary.js';
export {
  buildV1SavePayload,
  defaultBrokerImportSaveDeps,
  parseV1RevisionFromPortfolioList,
  parseV1SaveReceipt,
  readBrokerImportRevisionViaV1,
  saveBrokerImportHoldingsViaV1,
  V1_SAVE_DISPOSITIONS,
  V1_SAVE_DURABILITY_VALUES,
  type BrokerImportRevisionTransportOutcome,
  type BrokerImportSaveAdapterDeps,
  type BrokerImportSaveTransportOutcome,
  type V1PortfolioRevisionReadResult,
  type V1SaveReceipt,
} from './brokerImportV1SaveAdapter.js';
export {
  handleBrokerImportRequest,
  isBrokerImportPath,
  type BrokerImportEvidenceReader,
  type BrokerImportRouteDeps,
} from './brokerImportHttp.js';

/**
 * WS-A import-evidence retention (durable, local, append-only) and its ADMITTED read route.
 *
 * Reachable from trusted-host code as a library. It performs NO portfolio write, no identity
 * resolution and no save authorization: it retains the evidence a preview produced so that an
 * unresolved import survives process termination.
 *
 * TRANSPORT AUTHORITY NOW EXISTS. Mounting evidence on HTTP previously required its own transport
 * authority act because the admitted broker-import route set was closed. That act has been rendered
 * and is EFFECTIVE: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` (2026-11-05)
 * admits exactly ONE additive read-only route,
 * `GET /api/broker-import/:portfolioId/evidence/:importId`, under the owner scope it fixes at §8.2(7).
 * The closure is extended by that one leaf and is otherwise untouched: the four-segment collection
 * form stays `404`, no route enumerates evidence, no `DELETE` exists in this namespace, and retention
 * of evidence is still not a save, not a validation and not durability of holdings.
 */
export {
  BROKER_EVIDENCE_DELETION_MODE,
  BROKER_EVIDENCE_RETENTION_POLICY,
  BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES,
  BROKER_IMPORT_EVIDENCE_SCHEMA,
  BrokerImportEvidenceError,
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
  computeEvidenceRecordDigest,
  computeImportId,
  type BrokerImportEvidenceRecord,
  type BrokerImportEvidenceRow,
  type BrokerImportEvidenceStorageUsage,
  type RetainedBrokerImportEvidence,
} from './brokerImportEvidenceStore.js';

/**
 * Owner-context carrier and resolver for the evidence route (AMEND-01 §8.2, §3.7).
 *
 * THE CARRIER IS MATERIALISATION, NEVER AN AUTHORITY. Both values below are records of the effective
 * PA act and are `EQUALITY_PARTITION_ONLY` partition keys — not authenticated identities, not
 * principals, not credentials. This module may never be the origin of a value change: changing either
 * value requires a new dated PA act and a new carrier digest. The label `SAIRAM` is DISPLAY ONLY, is
 * excluded from both keys, and is never used to resolve, filter, partition, authorize or authenticate
 * anything. This carrier is separate from `IIPS_OWNER_CONTEXT_PATH` (F-3) and `IIPS_REPORTS_OWNER_PATH`
 * (NP-06 R1); aliasing one governed carrier to another is prohibited.
 */
export {
  APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
  APPROVED_BROKER_EVIDENCE_TENANT_ID,
  BROKER_EVIDENCE_OWNER_CARRIER_SHA256,
  BROKER_EVIDENCE_OWNER_DISPLAY_LABEL,
  CANONICAL_BROKER_EVIDENCE_CARRIER_BYTE_LENGTH,
  CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT,
  BrokerEvidenceOwnerCarrierLocationError,
  materialiseBrokerEvidenceOwnerCarrier,
} from './brokerImportEvidenceOwnerCarrier.js';
export {
  BROKER_EVIDENCE_OWNER_PATH_ENV,
  evaluateBrokerEvidenceOwnerContext,
  resolveBrokerEvidenceOwnerContext,
  validateBrokerEvidenceCarrierBytes,
  type BrokerEvidenceOwnerContext,
  type BrokerEvidenceOwnerFailureReason,
  type BrokerEvidenceOwnerResolution,
} from './brokerImportEvidenceOwnerResolver.js';
