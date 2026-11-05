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
  type BrokerImportRouteDeps,
} from './brokerImportHttp.js';

/**
 * WS-A import-evidence retention (durable, local, append-only).
 *
 * Reachable from trusted-host code as a library. It performs NO portfolio write, no identity
 * resolution and no save authorization: it retains the evidence a preview produced so that an
 * unresolved import survives process termination. Mounting it on an HTTP route requires its own
 * transport authority act (the admitted broker-import route set is closed); until then the host
 * composes it directly and the WS-A report records the transport gap.
 */
export {
  BROKER_IMPORT_EVIDENCE_SCHEMA,
  BrokerImportEvidenceError,
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
  computeEvidenceRecordDigest,
  computeImportId,
  type BrokerImportEvidenceRecord,
  type BrokerImportEvidenceRow,
  type RetainedBrokerImportEvidence,
} from './brokerImportEvidenceStore.js';
