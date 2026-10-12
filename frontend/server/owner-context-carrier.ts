/**
 * IIPS v3.0 — F-3 owner-context carrier: canonical bytes, approved values, integrity digest.
 *
 * THE CARRIER IS MATERIALISATION, NEVER AN AUTHORITY (F1/F2/F3 §4.3(2)). The governing PA
 * declaration is `IIPS-V3-OWNER-CONTEXT-F1-F2-F3-PA-DECISION-01` (F-3 design direction:
 * Option B carrier bound to Option A authority, under Option C's fail-closed discipline) and the
 * value act `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01`, which established the two fixed literals.
 *
 * AUTHORITY AND INTEGRITY BINDING
 *   - The pair below is a *record of* the effective PA value act. It is not a second source of
 *     authority, and this module may never be the origin of a value change: a change requires a
 *     new governed PA act plus a separately governed data-reconciliation decision (value act §5(3)).
 *   - The binding between the runtime carrier file and the governing declaration is the SHA-256 of
 *     the carrier's CANONICAL BYTES, pinned here as `OWNER_CONTEXT_CARRIER_SHA256`. This module is
 *     repository-visible, reviewed and merged; the carrier file is local and outside version
 *     control. An edit to the local carrier therefore cannot become effective without a
 *     corresponding governed change to merged repository code. That is what keeps change authority
 *     with the PA act (F1/F2/F3 §5.2(4)) even though the carrier lives outside the repository.
 *   - Canonical form is BYTE-EXACT: UTF-8, no BOM, two-space indentation, the key order below, and
 *     exactly one trailing LF. Any deviation changes the digest and fails closed. No normalisation,
 *     no leniency, no "close enough".
 *
 * DATA SAFETY
 *   `materialiseOwnerContextCarrier` writes ONLY the approved canonical bytes, so it can never
 *   create a foreign or inferred owner context. It refuses any target inside a Git working tree, so
 *   the carrier (and the owner-scoped local data domain it belongs to) can never be committed.
 */
import * as realFs from 'node:fs';
import path from 'node:path';

/** Carrier grammar version. A grammar change requires a new governed act and a new digest. */
export const OWNER_CONTEXT_CARRIER_SCHEMA_VERSION = 1;

/** Carrier filename inside the server-owned owner-context directory. */
export const OWNER_CONTEXT_CARRIER_FILENAME = 'owner-context.json';

/** The approved F-1 value, verbatim from `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` §4. */
export const APPROVED_OWNER_USER_ID = 'owner-7f3a91c2';

/** The approved F-2 value, verbatim from `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` §4. */
export const APPROVED_TENANT_ID = 'irr-domain-4b82d6e1';

/** The governing record this carrier materialises (audit/evidence trail — F-3 property 6). */
export const GOVERNING_RECORD_ID = 'IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01';
export const GOVERNING_RECORD_PATH = 'docs/integration/IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md';
/** Blob of the effective governing record at the verified baseline `main@709b27d`. */
export const GOVERNING_RECORD_BLOB = 'f90c9325f49d33f378f3fc0936c28f4979164b2e';
export const GOVERNING_RECORD_DECISION_DATE = '2026-10-12';

/**
 * The canonical carrier text — the exact bytes that must exist at the carrier path.
 *
 * Built by joining an explicit line array so the byte form cannot drift with platform line
 * endings, editor settings or indentation defaults. `owner-context-carrier.test.ts` asserts that
 * these bytes hash to `OWNER_CONTEXT_CARRIER_SHA256`.
 */
export const CANONICAL_CARRIER_TEXT: string = [
  '{',
  `  "carrierSchemaVersion": ${OWNER_CONTEXT_CARRIER_SCHEMA_VERSION},`,
  `  "ownerUserId": "${APPROVED_OWNER_USER_ID}",`,
  `  "tenantId": "${APPROVED_TENANT_ID}",`,
  '  "governedBy": {',
  `    "recordId": "${GOVERNING_RECORD_ID}",`,
  `    "recordPath": "${GOVERNING_RECORD_PATH}",`,
  `    "recordBlob": "${GOVERNING_RECORD_BLOB}",`,
  `    "decisionDate": "${GOVERNING_RECORD_DECISION_DATE}"`,
  '  }',
  '}',
  '',
].join('\n');

/**
 * SHA-256 of `CANONICAL_CARRIER_TEXT` in UTF-8 — the integrity binding (F1/F2/F3 §5.2(1)).
 *
 * Any carrier whose bytes do not hash to this value is NOT the authorised materialisation and
 * yields no owner context (fail closed at HTTP 503).
 */
export const OWNER_CONTEXT_CARRIER_SHA256 =
  'd5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4';

/** Byte length of the canonical carrier text (asserted in tests). */
export const CANONICAL_CARRIER_BYTE_LENGTH = 363;

/** Raised when a materialisation target would place the carrier inside a Git working tree. */
export class OwnerContextCarrierLocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwnerContextCarrierLocationError';
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
 * Recovery procedure (F-3 property 4): re-materialisation from the governing PA declaration is
 * deterministic — this writes the canonical bytes above, nothing else, nowhere else. It refuses a
 * target inside a Git working tree so the carrier can never be committed.
 */
export function materialiseOwnerContextCarrier(
  targetDir: string,
  fs: Pick<typeof realFs, 'mkdirSync' | 'writeFileSync'> = realFs,
): string {
  const dir = path.resolve(targetDir);
  const repo = findRepositoryRoot(dir);
  if (repo !== null) {
    throw new OwnerContextCarrierLocationError(
      `owner-context carrier must live outside a Git working tree; "${dir}" is inside "${repo}"`,
    );
  }
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, OWNER_CONTEXT_CARRIER_FILENAME);
  fs.writeFileSync(target, CANONICAL_CARRIER_TEXT, { encoding: 'utf8' });
  return target;
}
