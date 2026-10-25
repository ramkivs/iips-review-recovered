/**
 * IIPS v3.0 — NP-06 Reports owner carrier: canonical bytes, approved values, integrity digest.
 *
 * THE CARRIER IS MATERIALISATION, NEVER AN AUTHORITY (R1 §3). The governing PA declaration is
 * `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (Option B carrier
 * under `IIPS_REPORTS_OWNER_PATH`), which established the two fixed literals:
 *   - Tenant: `irr-reports-personal`
 *   - Owner: `owner-irr-reports-personal`
 *
 * AUTHORITY AND INTEGRITY BINDING
 *   - The pair below is a record of the effective PA value act. It is not a second source of
 *     authority, and this module may never be the origin of a value change: a change requires a
 *     new governed PA act plus a separately governed data-reconciliation decision.
 *   - The binding between the runtime carrier file and the governing declaration is the SHA-256 of
 *     the carrier's CANONICAL BYTES, pinned here as `REPORTS_OWNER_CARRIER_SHA256`.
 *   - Canonical form is BYTE-EXACT: UTF-8, no BOM, two-space indentation, explicit key order, and
 *     exactly one trailing LF. Any deviation changes the digest and fails closed.
 *
 * DATA SAFETY
 *   `materialiseReportsOwnerCarrier` writes ONLY the approved canonical bytes, refusing any target
 *   inside a Git working tree so the carrier can never be committed.
 */
import * as realFs from 'node:fs';
import path from 'node:path';

/** Carrier grammar version. A grammar change requires a new governed act and a new digest. */
export const REPORTS_OWNER_CARRIER_SCHEMA_VERSION = 1;

/** Carrier filename inside the server-owned reports owner directory. */
export const REPORTS_OWNER_CARRIER_FILENAME = 'reports-owner-context.json';

/** The approved Reports owner value, verbatim from the R1 act §1. */
export const APPROVED_REPORTS_OWNER_USER_ID = 'owner-irr-reports-personal';

/** The approved Reports tenant value, verbatim from the R1 act §1. */
export const APPROVED_REPORTS_TENANT_ID = 'irr-reports-personal';

/** The governing record this carrier materialises (audit/evidence trail — R1 property set). */
export const GOVERNING_RECORD_ID = 'IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01';
export const GOVERNING_RECORD_PATH = 'docs/integration/IIPS_v3.0_REPORTS_NP06_R1_OWNERSHIP_DECLARATION_PA_DECISION_ACT_2026-10-25.md';
export const GOVERNING_RECORD_DECISION_DATE = '2026-10-25';

/**
 * The canonical carrier text — the exact bytes that must exist at the carrier path.
 *
 * Built by joining an explicit line array so the byte form cannot drift with platform line
 * endings, editor settings or indentation defaults.
 */
export const CANONICAL_REPORTS_CARRIER_TEXT: string = [
  '{',
  `  "carrierSchemaVersion": ${REPORTS_OWNER_CARRIER_SCHEMA_VERSION},`,
  `  "ownerUserId": "${APPROVED_REPORTS_OWNER_USER_ID}",`,
  `  "tenantId": "${APPROVED_REPORTS_TENANT_ID}",`,
  '  "governedBy": {',
  `    "recordId": "${GOVERNING_RECORD_ID}",`,
  `    "recordPath": "${GOVERNING_RECORD_PATH}",`,
  `    "decisionDate": "${GOVERNING_RECORD_DECISION_DATE}"`,
  '  }',
  '}',
  '',
].join('\n');

/**
 * SHA-256 of `CANONICAL_REPORTS_CARRIER_TEXT` in UTF-8 — the integrity binding.
 *
 * Any carrier whose bytes do not hash to this value is NOT the authorised materialisation and
 * yields no owner context (fail closed at HTTP 503).
 */
export const REPORTS_OWNER_CARRIER_SHA256 =
  'b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640';

/** Byte length of the canonical carrier text (asserted in tests). */
export const CANONICAL_REPORTS_CARRIER_BYTE_LENGTH = 384;

/** Raised when a materialisation target would place the carrier inside a Git working tree. */
export class ReportsOwnerCarrierLocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportsOwnerCarrierLocationError';
  }
}

/** Walk up from `startDir` looking for a Git working tree (`.git` directory or file). */
function findRepositoryRoot(startDir: string): string | null {
  let current = path.resolve(startDir);
  for (;;) {
    if (realFs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Materialise the carrier into `targetDir` and return the written path.
 *
 * Recovery procedure: re-materialisation from the governing PA declaration is deterministic.
 * It refuses a target inside a Git working tree so the carrier can never be committed.
 */
export function materialiseReportsOwnerCarrier(
  targetDir: string,
  fs: Pick<typeof realFs, 'mkdirSync' | 'writeFileSync'> = realFs,
): string {
  const dir = path.resolve(targetDir);
  const repo = findRepositoryRoot(dir);
  if (repo !== null) {
    throw new ReportsOwnerCarrierLocationError(
      `reports owner carrier must live outside a Git working tree; "${dir}" is inside "${repo}"`,
    );
  }
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, REPORTS_OWNER_CARRIER_FILENAME);
  fs.writeFileSync(target, CANONICAL_REPORTS_CARRIER_TEXT, { encoding: 'utf8' });
  return target;
}
