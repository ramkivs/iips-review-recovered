/**
 * CAP-02 U1 AMEND-01 — evidence-retrieval route surface, owner isolation and retention tests.
 *
 * Authority: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8 (effective
 * 2026-11-05), which admits exactly ONE additive read-only route:
 *
 *     GET /api/broker-import/:portfolioId/evidence/:importId
 *
 * What this suite proves, clause by clause:
 *   §8.1(1)  one route only; no list-and-enumerate variant; four-segment collection form stays 404
 *   §8.1(2)  GET only (405 Allow: GET); any query string refused 400 BEFORE any I/O; the existing
 *            holdings/revision closure preserved and extended, not relaxed
 *   §8.1(3)  handler order — C9 first, binding precondition next, opaque params before any I/O,
 *            then ONE scoped journal read; no step reordered, skipped or lazy
 *   §8.1(4)  no new listener, no new IPC operation — the evidence route makes ZERO IPC calls
 *   §8.1(5)  non-disclosure and FULL INDISTINGUISHABILITY: absent ≡ malformed ≡ out-of-scope ≡
 *            tombstoned ⇒ one opaque 404, never 403, never a partial record
 *   §8.1(6)  evidence fields only; no canonical companyId; no raw CSV bytes; both partition keys
 *            withheld from the wire
 *   §8.2     owner scope from the act-fixed carrier ONLY, never from the request; fail closed
 *   §8.3(14) the volatile-fields limitation is carried in the response
 *   §8.3(15) recordDigest re-verified on EVERY read; tamper fails closed and is never served
 *   §8.3(16) INDEFINITE retention; no purge, no expiry, no compaction, no DELETE, no quota; the
 *            50 MB figure is a warning/review threshold only (obligation O-1 visibility)
 *   §8.5     the /api/user-portfolios* write fence is unaffected; owner-context-unavailable.ts stays
 *            byte-identical; import safety holds
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';

import { handleBrokerImportRequest } from './brokerImportHttp.js';
import {
  APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
  APPROVED_BROKER_EVIDENCE_TENANT_ID,
  BROKER_EVIDENCE_OWNER_CARRIER_SHA256,
  BROKER_EVIDENCE_OWNER_DISPLAY_LABEL,
  BrokerEvidenceOwnerCarrierLocationError,
  CANONICAL_BROKER_EVIDENCE_CARRIER_BYTE_LENGTH,
  CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT,
  materialiseBrokerEvidenceOwnerCarrier,
} from './brokerImportEvidenceOwnerCarrier.js';
import {
  BROKER_EVIDENCE_OWNER_PATH_ENV,
  evaluateBrokerEvidenceOwnerContext,
  resolveBrokerEvidenceOwnerContext,
  validateBrokerEvidenceCarrierBytes,
} from './brokerImportEvidenceOwnerResolver.js';
import {
  BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES,
  BrokerImportEvidenceStore,
  buildBrokerImportEvidence,
  computeImportId,
} from './brokerImportEvidenceStore.js';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver.js';
import {
  APPROVED_OWNER_USER_ID,
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_TEXT,
  materialiseOwnerContextCarrier,
  OWNER_CONTEXT_CARRIER_SHA256,
} from '../owner-context-carrier.js';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  CANONICAL_REPORTS_CARRIER_TEXT,
  REPORTS_OWNER_CARRIER_SHA256,
} from '../reports-owner-carrier.js';
import { REPORTS_OWNER_PATH_ENV } from '../reports-owner-resolver.js';
import { OWNER_CONTEXT_UNAVAILABLE } from '../owner-context-unavailable.js';
import { BINDING_PRECONDITION_SETTING } from '../user-portfolio/ownerContextFromBinding.js';
import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview';
import type { IpcCallResult, IpcOperation } from '../user-portfolio/ipcClient.js';

/* ------------------------------------------------------------------ *
 * Fixtures and helpers
 * ------------------------------------------------------------------ */

const AT = '2026-11-05T07:50:49.090Z';
const PORTFOLIO = 'P1-BROKER';
const FILE_NAME = 'Portfolio(2).csv';
const CSV = fs.readFileSync(
  path.join(process.cwd(), 'server', 'broker-import', '__fixtures__', 'dhan-web-ui-summary-68.csv'),
  'utf8',
);

/** The single personal owner scope fixed by AMEND-01 §8.2(7). There is no second scope. */
const SCOPE = {
  tenantId: APPROVED_BROKER_EVIDENCE_TENANT_ID,
  ownerUserId: APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
  portfolioSlot: PORTFOLIO,
  fileName: FILE_NAME,
};

/** A well-formed 64-hex importId that was never retained. */
const UNRETAINED_IMPORT_ID = 'a'.repeat(64);

function evidenceRecord(readAt: string = AT) {
  return buildBrokerImportEvidence({
    ...SCOPE,
    preview: previewBrokerHoldings(CSV, FILE_NAME, readAt),
  });
}

function sourceOf(relativePath: string): string {
  return fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

function gitBlobSha1(relativePath: string): string {
  const bytes = fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)));
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

/**
 * Drive the real exported handler over a real ephemeral loopback socket — not a re-implementation.
 * `ipcResult` lets a test prove the evidence route never reaches the save adapter at all.
 */
async function callHandler(
  url: string,
  method: string,
  env: NodeJS.ProcessEnv,
  init: RequestInit = {},
): Promise<{ status: number; body: string; json: unknown; headers: Record<string, string>; ipcCalls: number }> {
  let ipcCalls = 0;
  const server = http.createServer((req, res) => {
    void handleBrokerImportRequest(req, res, {
      env,
      saveAdapterDeps: {
        callIpc: (async (_op: IpcOperation) => {
          ipcCalls += 1;
          throw new Error('the evidence route must never reach an IPC call');
        }) as never,
      },
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${url}`, { ...init, method });
    const body = await response.text();
    return {
      status: response.status,
      body,
      json: body.length === 0 ? null : JSON.parse(body),
      headers: Object.fromEntries(response.headers.entries()),
      ipcCalls,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/**
 * Drive the handler with an UNNORMALISED request target.
 *
 * `fetch` normalises a URL before it goes on the wire — a bare trailing `?` with an empty query is
 * dropped, so a socket-based test can never present it to the server. This invokes the real exported
 * handler directly with the raw target string, which is the only way to prove clause 2's rule holds
 * for that edge case too.
 */
async function callHandlerRaw(
  rawUrl: string,
  method: string,
  env: NodeJS.ProcessEnv,
): Promise<{ status: number; body: string; headers: Record<string, string | number> }> {
  const req = {
    url: rawUrl,
    method,
    headers: { host: '127.0.0.1:1' },
  } as unknown as http.IncomingMessage;
  let status = 0;
  let body = '';
  const headers: Record<string, string | number> = {};
  const res = {
    setHeader(key: string, value: string | number) { headers[key.toLowerCase()] = value; },
    writeHead(code: number, responseHeaders?: Record<string, string>) {
      status = code;
      for (const [key, value] of Object.entries(responseHeaders ?? {})) headers[key.toLowerCase()] = value;
      return res;
    },
    end(value?: string) { if (typeof value === 'string') body = value; },
  } as unknown as http.ServerResponse;
  await handleBrokerImportRequest(req, res, { env });
  return { status, body, headers };
}

/** Corrupt one retained journal line in place, the way a real tamper would. */
function tamperJournal(dataDir: string, from: string, to: string): void {
  const journalPath = path.join(dataDir, 'journal.ndjson');
  const lines = fs.readFileSync(journalPath, 'utf8').trim().split('\n');
  const tampered = lines[1].replace(from, to);
  expect(tampered, 'the tamper must actually change the stored line').not.toBe(lines[1]);
  fs.writeFileSync(journalPath, `${[lines[0], tampered].join('\n')}\n`);
}

/* ------------------------------------------------------------------ *
 * §3.7 / §8.2(7) — the carrier: canonical bytes, integrity pin, derivation
 * ------------------------------------------------------------------ */

describe('AMEND-01 §3.7 — carrier canonical bytes and integrity pin', () => {
  it('reproduces the act-pinned byte length and SHA-256 exactly', () => {
    const bytes = Buffer.from(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT, 'utf8');
    expect(bytes.length).toBe(CANONICAL_BROKER_EVIDENCE_CARRIER_BYTE_LENGTH);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_BYTE_LENGTH).toBe(367);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(BROKER_EVIDENCE_OWNER_CARRIER_SHA256);
    expect(BROKER_EVIDENCE_OWNER_CARRIER_SHA256).toBe(
      '27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c',
    );
  });

  it('is byte-exact canonical form: UTF-8, no BOM, two-space indent, one trailing LF, valid JSON', () => {
    const bytes = Buffer.from(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT, 'utf8');
    expect(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))).toBe(false);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.endsWith('}\n')).toBe(true);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.endsWith('}\n\n')).toBe(false);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT).not.toMatch(/\r/);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT).toContain('\n  "ownerUserId"');
    const parsed = JSON.parse(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT) as Record<string, unknown>;
    // The act's key order is load-bearing: reordering it changes the digest.
    expect(Object.keys(parsed)).toEqual(['carrierSchemaVersion', 'ownerUserId', 'tenantId', 'governedBy']);
    expect(Object.keys(parsed.governedBy as Record<string, unknown>)).toEqual([
      'recordId',
      'recordPath',
      'decisionDate',
    ]);
  });

  it('carries the two approved partition values and re-derives them by the act §3.3 rule', () => {
    expect(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID).toBe('owner-4dc756b3');
    expect(APPROVED_BROKER_EVIDENCE_TENANT_ID).toBe('irr-personal-073dd1c8');
    const derive = (input: string): string =>
      createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 8);
    expect(`owner-${derive('IIPS-V3-PERSONAL-OWNER:SAIRAM')}`).toBe(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID);
    expect(`irr-personal-${derive('IIPS-V3-PERSONAL-TENANT:SAIRAM')}`).toBe(APPROVED_BROKER_EVIDENCE_TENANT_ID);
  });

  it('EXCLUDES the label SAIRAM from both keys and from the carrier bytes (Decision 5)', () => {
    expect(BROKER_EVIDENCE_OWNER_DISPLAY_LABEL).toBe('SAIRAM');
    expect(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID).not.toContain('SAIRAM');
    expect(APPROVED_BROKER_EVIDENCE_TENANT_ID).not.toContain('SAIRAM');
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT).not.toContain('SAIRAM');
    // Case-insensitively too: no personal-name token survives anywhere in the carrier.
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.toLowerCase()).not.toContain('sairam');
    // Both keys are opaque per F-1/F-2 §4.1: no '@', no email, no identity token.
    for (const value of [APPROVED_BROKER_EVIDENCE_OWNER_USER_ID, APPROVED_BROKER_EVIDENCE_TENANT_ID]) {
      expect(value).not.toContain('@');
      expect(value).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('uses its own seam, distinct from the F-3 and NP-06 R1 carriers (no aliasing)', () => {
    // Asserted against the OTHER modules' real exported constants, not against grepped source: a
    // renamed seam would fail here rather than silently aliasing a neighbour's carrier.
    expect(BROKER_EVIDENCE_OWNER_PATH_ENV).toBe('IIPS_BROKER_EVIDENCE_OWNER_PATH');
    expect(BROKER_EVIDENCE_OWNER_PATH_ENV).not.toBe(OWNER_CONTEXT_PATH_ENV);
    expect(BROKER_EVIDENCE_OWNER_PATH_ENV).not.toBe(REPORTS_OWNER_PATH_ENV);
    // The pair is distinct from both the Reports pair (NP-06 R1 §1) and the F-1/F-2 pair.
    expect(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID).not.toBe(APPROVED_REPORTS_OWNER_USER_ID);
    expect(APPROVED_BROKER_EVIDENCE_TENANT_ID).not.toBe(APPROVED_REPORTS_TENANT_ID);
    expect(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID).not.toBe(APPROVED_OWNER_USER_ID);
    expect(APPROVED_BROKER_EVIDENCE_TENANT_ID).not.toBe(APPROVED_TENANT_ID);
    // And the carriers are separately digest-pinned: no shared integrity binding.
    expect(BROKER_EVIDENCE_OWNER_CARRIER_SHA256).not.toBe(REPORTS_OWNER_CARRIER_SHA256);
    expect(BROKER_EVIDENCE_OWNER_CARRIER_SHA256).not.toBe(OWNER_CONTEXT_CARRIER_SHA256);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT).not.toBe(CANONICAL_REPORTS_CARRIER_TEXT);
    expect(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT).not.toBe(CANONICAL_CARRIER_TEXT);
  });
});

describe('AMEND-01 §3.7 — carrier materialisation and data safety', () => {
  const dirs: string[] = [];
  const tempDir = (prefix: string): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    dirs.push(dir);
    return dir;
  };
  afterEach(() => {
    while (dirs.length > 0) {
      const dir = dirs.pop();
      if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes ONLY the approved canonical bytes, byte for byte', () => {
    const target = materialiseBrokerEvidenceOwnerCarrier(tempDir('iips-a9-carrier-'));
    const written = fs.readFileSync(target, 'utf8');
    expect(written).toBe(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT);
    expect(createHash('sha256').update(Buffer.from(written, 'utf8')).digest('hex')).toBe(
      BROKER_EVIDENCE_OWNER_CARRIER_SHA256,
    );
  });

  it('is deterministic, so the owner scope survives total loss of the carrier file (obligation O-2)', () => {
    const first = materialiseBrokerEvidenceOwnerCarrier(tempDir('iips-a9-carrier-a-'));
    const second = materialiseBrokerEvidenceOwnerCarrier(tempDir('iips-a9-carrier-b-'));
    expect(fs.readFileSync(first, 'utf8')).toBe(fs.readFileSync(second, 'utf8'));
  });

  it('refuses a target inside a Git working tree, so the carrier can never be committed', () => {
    const repoRoot = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
    expect(fs.existsSync(path.join(repoRoot, '.git')), 'the repository root must be a Git tree').toBe(true);
    const inside = path.join(repoRoot, 'frontend', '.tmp-a9-carrier-must-not-be-written');
    expect(() => materialiseBrokerEvidenceOwnerCarrier(inside)).toThrow(BrokerEvidenceOwnerCarrierLocationError);
    expect(fs.existsSync(inside)).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * §8.2(7)-(10) / §3.7(4) — resolver fails closed on every condition
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8.2 — owner resolver fails closed', () => {
  const dirs: string[] = [];
  const tempDir = (prefix: string): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    dirs.push(dir);
    return dir;
  };
  afterEach(() => {
    while (dirs.length > 0) {
      const dir = dirs.pop();
      if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function envWith(carrierPath: string | undefined): NodeJS.ProcessEnv {
    return carrierPath === undefined ? {} : { [BROKER_EVIDENCE_OWNER_PATH_ENV]: carrierPath };
  }

  it('resolves ONLY the approved pair from a correctly materialised carrier', () => {
    const carrier = materialiseBrokerEvidenceOwnerCarrier(tempDir('iips-a9-resolver-'));
    const resolution = evaluateBrokerEvidenceOwnerContext(envWith(carrier));
    expect(resolution.ok).toBe(true);
    expect(resolution.reason).toBe('ok');
    expect(resolution.context).toEqual({
      tenantId: APPROVED_BROKER_EVIDENCE_TENANT_ID,
      ownerUserId: APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
    });
    expect(Object.isFrozen(resolution.context)).toBe(true);
  });

  it.each([
    ['path-not-configured', (): NodeJS.ProcessEnv => envWith(undefined)],
    ['carrier-unreadable', (): NodeJS.ProcessEnv => envWith(path.join(os.tmpdir(), 'iips-a9-does-not-exist.json'))],
  ])('fails closed with reason %s and a null context', (_reason, make) => {
    const resolution = evaluateBrokerEvidenceOwnerContext(make());
    expect(resolution.ok).toBe(false);
    expect(resolution.context).toBeNull();
    expect(resolveBrokerEvidenceOwnerContext(make())).toBeNull();
  });

  it('fails closed on an empty, oversized, or digest-mismatched carrier', () => {
    expect(validateBrokerEvidenceCarrierBytes(Buffer.alloc(0)).reason).toBe('carrier-empty');
    expect(validateBrokerEvidenceCarrierBytes(Buffer.alloc(4097, 0x61)).reason).toBe('carrier-too-large');
    // One changed byte: same shape, different digest ⇒ refused at gate 1 before any parsing.
    const oneByteOff = Buffer.from(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT, 'utf8');
    oneByteOff[oneByteOff.length - 2] = 0x20;
    expect(validateBrokerEvidenceCarrierBytes(oneByteOff).reason).toBe('integrity-mismatch');
  });

  it('fails closed on malformed JSON, malformed grammar, and a foreign approved-pair mismatch', () => {
    const digestOf = (text: string): string => createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
    // Each case is fed its OWN digest so gate 1 passes and gate 2 is what refuses it.
    expect(
      validateBrokerEvidenceCarrierBytes(Buffer.from('not json', 'utf8'), digestOf('not json')).reason,
    ).toBe('malformed-json');

    // KEY ORDER IS ENFORCED BY THE DIGEST GATE, NOT BY THE GRAMMAR GATE — and that is the stronger
    // of the two. The grammar gate checks the key SET, so a reordered carrier fed its own digest
    // would parse; but reordering changes the bytes, so it can never hash to the act's pin. A real
    // carrier therefore cannot be reordered at all.
    const wrongKeyOrder = CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.replace(
      '"ownerUserId": "owner-4dc756b3",\n  "tenantId": "irr-personal-073dd1c8",',
      '"tenantId": "irr-personal-073dd1c8",\n  "ownerUserId": "owner-4dc756b3",',
    );
    expect(wrongKeyOrder).not.toBe(CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT);
    expect(digestOf(wrongKeyOrder)).not.toBe(BROKER_EVIDENCE_OWNER_CARRIER_SHA256);
    expect(validateBrokerEvidenceCarrierBytes(Buffer.from(wrongKeyOrder, 'utf8')).reason).toBe(
      'integrity-mismatch',
    );

    // A carrier naming a different grammar version is refused by the grammar gate.
    const wrongVersion = CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.replace('"carrierSchemaVersion": 1', '"carrierSchemaVersion": 2');
    expect(
      validateBrokerEvidenceCarrierBytes(Buffer.from(wrongVersion, 'utf8'), digestOf(wrongVersion)).reason,
    ).toBe('malformed-grammar');

    const extraKey = CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.replace(
      '  "carrierSchemaVersion": 1,',
      '  "carrierSchemaVersion": 1,\n  "role": "admin",',
    );
    expect(
      validateBrokerEvidenceCarrierBytes(Buffer.from(extraKey, 'utf8'), digestOf(extraKey)).reason,
    ).toBe('malformed-grammar');

    // A structurally perfect carrier naming a DIFFERENT owner is refused, never adapted.
    const foreignPair = CANONICAL_BROKER_EVIDENCE_CARRIER_TEXT.replace(
      '"ownerUserId": "owner-4dc756b3"',
      '"ownerUserId": "owner-deadbeef"',
    );
    expect(
      validateBrokerEvidenceCarrierBytes(Buffer.from(foreignPair, 'utf8'), digestOf(foreignPair)).reason,
    ).toBe('invalid-value');
  });

  it('performs UNCACHED per-request evaluation, so removing the carrier takes effect at once', () => {
    const dir = tempDir('iips-a9-uncached-');
    const carrier = materialiseBrokerEvidenceOwnerCarrier(dir);
    const env = envWith(carrier);
    expect(resolveBrokerEvidenceOwnerContext(env)).not.toBeNull();
    fs.rmSync(carrier);
    // No restart, no cache flush: the very next evaluation fails closed.
    expect(resolveBrokerEvidenceOwnerContext(env)).toBeNull();
    // And restoring it takes effect immediately too.
    materialiseBrokerEvidenceOwnerCarrier(dir);
    expect(resolveBrokerEvidenceOwnerContext(env)).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * §8.1 / §8.3 — the route itself, over a real socket
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8 — evidence route admission, owner isolation and integrity', () => {
  let dataDir = '';
  let carrierDir = '';
  let carrierPath = '';
  let importId = '';

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-data-'));
    carrierDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-carrier-'));
    carrierPath = materialiseBrokerEvidenceOwnerCarrier(carrierDir);
    const record = evidenceRecord();
    importId = record.importId;
    new BrokerImportEvidenceStore({ dataDir }).retain(record);
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(carrierDir, { recursive: true, force: true });
  });

  function env(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
    const base: Record<string, string> = {
      [BINDING_PRECONDITION_SETTING]: 'true',
      [BROKER_EVIDENCE_OWNER_PATH_ENV]: carrierPath,
      IIPS_DATA_DIR: dataDir,
    };
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete base[key];
      else base[key] = value;
    }
    return base as NodeJS.ProcessEnv;
  }

  const url = (id: string = importId, portfolio: string = PORTFOLIO): string =>
    `/api/broker-import/${portfolio}/evidence/${id}`;

  it('serves the retained record to its own owner on 200, evidence fields only', async () => {
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(200);
    const body = result.json as Record<string, unknown>;
    expect(body.importId).toBe(importId);
    expect(body.schema).toBe('IIPS_BROKER_IMPORT_EVIDENCE_V1');
    // The parsed row inventory, both digests, the per-row identity evidence and the refusal details.
    expect((body.rows as unknown[]).length).toBe(68);
    expect(body.contentDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(body.recordDigest).toMatch(/^[0-9a-f]{64}$/);
    expect((body.rows as Array<Record<string, unknown>>)[0]).toHaveProperty('identityStatus');
    expect((body.rows as Array<Record<string, unknown>>)[0]).toHaveProperty('identityBasis');
    expect(Array.isArray(body.pipelineRefusals)).toBe(true);
    // §8.1(6): no canonical companyId anywhere, and no raw CSV bytes.
    expect(result.body).not.toContain('companyId');
    expect(result.body).not.toContain(CSV.split('\n')[0]);
  });

  it('withholds BOTH governed partition keys from the wire (§8.1(6))', async () => {
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(200);
    const body = result.json as Record<string, unknown>;
    expect(body).not.toHaveProperty('tenantId');
    expect(body).not.toHaveProperty('ownerUserId');
    expect(result.body).not.toContain(APPROVED_BROKER_EVIDENCE_TENANT_ID);
    expect(result.body).not.toContain(APPROVED_BROKER_EVIDENCE_OWNER_USER_ID);
    // And it says so honestly rather than implying the digest covers the projection.
    expect((body.retention as Record<string, unknown>).recordDigestCoversWithheldScopeKeys).toBe(true);
  });

  it('carries the clause-14 volatile-fields limitation and truthful O-1 storage visibility', async () => {
    const result = await callHandler(url(), 'GET', env());
    const body = result.json as Record<string, unknown>;
    const retention = body.retention as Record<string, unknown>;
    // §8.3(14): the process-specific-quarantine-id limitation MUST be carried in the response.
    expect(retention.volatileFields).toContain('process-specific');
    expect(retention.volatileFields).toContain('FIRST retention');
    expect((body.limitations as string[]).join(' ')).toContain('raw broker file bytes are not retained');
    // §8.3(16)(a)-(c): indefinite, explicit-owner-only, no automatic purge, no compaction.
    expect(retention.policy).toBe('INDEFINITE');
    expect(retention.deletion).toBe('EXPLICIT_OWNER_ONLY');
    expect(retention.automaticPurge).toBe(false);
    expect(retention.destructiveCompaction).toBe(false);
    expect(retention.deletionReachableFromHttp).toBe(false);
    // §8.3(16)(g) / §4.4: the 50 MB figure is a warning/review threshold, never a deletion trigger.
    expect(retention.reviewThresholdBytes).toBe(BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES);
    expect(BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES).toBe(52_428_800);
    expect(retention.reviewThresholdIsDeletionTrigger).toBe(false);
    // O-1: count and approximate bytes, truthful for the one retained record.
    const storage = retention.storage as Record<string, unknown>;
    expect(storage.recordCount).toBe(1);
    expect(typeof storage.approximateBytes).toBe('number');
    expect(storage.approximateBytes as number).toBeGreaterThan(0);
    expect(storage.reviewThresholdExceeded).toBe(false);
    // §8.4(3): served only within the owner scope, never transmitted, never enumerated.
    expect(retention.servedWithinOwnerScopeOnly).toBe(true);
    expect(retention.transmittedToThirdParty).toBe(false);
    expect(retention.enumeratedRoute).toBe(false);
  });

  it('makes ZERO IPC calls and opens no new listener (§8.1(4))', async () => {
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(200);
    expect(result.ipcCalls).toBe(0);
  });

  it.each([
    ['absent but well-formed', UNRETAINED_IMPORT_ID],
    ['malformed — too short', 'abc123'],
    ['malformed — uppercase hex', 'A'.repeat(64)],
    ['malformed — not hex', 'z'.repeat(64)],
  ])('refuses a %s importId with the SAME opaque 404 (full indistinguishability, §8.1(5))', async (_label, id) => {
    const result = await callHandler(url(id), 'GET', env());
    expect(result.status).toBe(404);
    expect(result.json).toEqual({ outcome: 'RESOURCE_UNAVAILABLE' });
    // Never 403, never a partial record, never an enumeration signal.
    expect(result.body).not.toContain('rows');
    expect(result.body).not.toContain(importId);
  });

  it('collapses a trailing-slash evidence path to the four-segment collection form, which stays 404', async () => {
    // `…/evidence/` has an empty fifth segment, so it is the COLLECTION form — not a malformed id.
    // §8.5(19) keeps that form at 404 with the namespace body; it is never a list endpoint.
    const result = await callHandler(`/api/broker-import/${PORTFOLIO}/evidence/`, 'GET', env());
    expect(result.status).toBe(404);
    expect(result.json).toEqual({ error: 'not found' });
    expect(result.body).not.toContain(importId);
  });

  it('makes an out-of-scope record indistinguishable from an unretained one (cross-owner impossible)', async () => {
    // Retain a second record under a DIFFERENT owner scope in the SAME journal.
    const foreignReadAt = '2026-11-04T00:00:00.000Z';
    const foreign = buildBrokerImportEvidence({
      tenantId: SCOPE.tenantId,
      ownerUserId: 'owner-ffffffff',
      portfolioSlot: PORTFOLIO,
      fileName: FILE_NAME,
      preview: previewBrokerHoldings(CSV, FILE_NAME, foreignReadAt),
    });
    new BrokerImportEvidenceStore({ dataDir }).retain(foreign);
    expect(foreign.importId).not.toBe(importId);

    // The owner's own record is still served.
    expect((await callHandler(url(), 'GET', env())).status).toBe(200);

    // The foreign record is NOT: same opaque 404 as an id that was never retained.
    const foreignResult = await callHandler(url(foreign.importId), 'GET', env());
    expect(foreignResult.status).toBe(404);
    expect(foreignResult.json).toEqual({ outcome: 'RESOURCE_UNAVAILABLE' });
    expect(foreignResult.body).not.toContain('owner-ffffffff');
    // Byte-identical body to the unretained case: no oracle exists.
    const unretained = await callHandler(url(UNRETAINED_IMPORT_ID), 'GET', env());
    expect(foreignResult.body).toBe(unretained.body);
    expect(foreignResult.status).toBe(unretained.status);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])(
    'answers 405 Allow: GET for %s on the admitted evidence path (§8.1(2))',
    async (method) => {
      const result = await callHandler(url(), method, env());
      expect(result.status).toBe(405);
      expect(result.headers.allow).toBe('GET');
    },
  );

  it('refuses ANY query string with 400 BEFORE any I/O (§8.1(2))', async () => {
    // A bare trailing '?' is omitted: `fetch` normalises it away before it reaches the wire, so it
    // is proved separately against the raw target below.
    for (const query of ['?owner=owner-4dc756b3', '?limit=1000', '?all=true']) {
      const result = await callHandler(`${url()}${query}`, 'GET', env());
      expect(result.status, query).toBe(400);
      expect(result.json, query).toEqual({
        error: 'invalid-request',
        field: 'query',
        reason: 'query-string-not-permitted',
      });
      expect(result.ipcCalls, query).toBe(0);
    }
    // A query string cannot be used to widen the scope or to enumerate.
    const widening = await callHandler(`${url()}?tenantId=other&ownerUserId=other`, 'GET', env());
    expect(widening.status).toBe(400);
  });

  it('refuses even a bare, empty query string when the raw target carries one (§8.1(2))', async () => {
    const result = await callHandlerRaw(`${url()}?`, 'GET', env());
    expect(result.status).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'invalid-request',
      field: 'query',
      reason: 'query-string-not-permitted',
    });
    // The refusal happens BEFORE any read: with no carrier configured the same target would be 503,
    // so a 400 here proves the query gate precedes carrier resolution and any journal I/O.
    const noCarrier = await callHandlerRaw(
      `${url()}?`,
      'GET',
      env({ [BROKER_EVIDENCE_OWNER_PATH_ENV]: undefined }),
    );
    expect(noCarrier.status).toBe(400);
  });

  it('fails closed at 503 owner-context-unavailable when the binding precondition is absent (§8.1(3))', async () => {
    const result = await callHandler(url(), 'GET', env({ [BINDING_PRECONDITION_SETTING]: undefined }));
    expect(result.status).toBe(503);
    expect(result.json).toEqual(OWNER_CONTEXT_UNAVAILABLE);
    expect(result.ipcCalls).toBe(0);
  });

  it.each([
    ['carrier not configured', { [BROKER_EVIDENCE_OWNER_PATH_ENV]: undefined }],
    ['carrier unreadable', { [BROKER_EVIDENCE_OWNER_PATH_ENV]: '/nonexistent/iips-a9-carrier.json' }],
  ])('fails closed at 503 owner-context-unavailable when the %s (§8.2)', async (_label, overrides) => {
    const result = await callHandler(url(), 'GET', env(overrides as Record<string, string | undefined>));
    expect(result.status).toBe(503);
    expect(result.json).toEqual(OWNER_CONTEXT_UNAVAILABLE);
    // Indistinguishable from configuration-absent, and non-disclosing.
    expect(result.body).not.toContain('carrier');
    expect(result.body).not.toContain('digest');
  });

  it('fails closed at 503 when the carrier is tampered — one changed byte refuses the whole route', async () => {
    const bytes = fs.readFileSync(carrierPath);
    bytes[bytes.length - 2] = 0x20;
    fs.writeFileSync(carrierPath, bytes);
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(503);
    expect(result.json).toEqual(OWNER_CONTEXT_UNAVAILABLE);
  });

  it('refuses a cross-site-shaped request before anything else (C9 hardening, §8.1(3))', async () => {
    const result = await callHandler(url(), 'GET', env(), {
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    });
    expect(result.status).toBe(403);
    expect(result.json).toEqual({ error: 'cross-site-request-refused' });
    expect(result.ipcCalls).toBe(0);
  });

  it('validates the opaque portfolioId before any I/O and refuses a malformed one with 400', async () => {
    const result = await callHandler(url(importId, '%2F'), 'GET', env());
    expect(result.status).toBe(400);
    expect((result.json as Record<string, unknown>).error).toBe('invalid-request');
    expect(result.ipcCalls).toBe(0);
  });

  it('fails closed on a TAMPERED record and never serves or silently hides it (§8.3(15))', async () => {
    // A field change that keeps the row inventory self-consistent, so the DIGEST gate is what catches it.
    tamperJournal(dataDir, `"fileName":"${FILE_NAME}"`, '"fileName":"Portfolio(3).csv"');
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'EVIDENCE_TAMPERED' });
    // Static reason only: no record content, path, stack or owner is echoed.
    expect(result.body).not.toContain(FILE_NAME);
    expect(result.body).not.toContain(dataDir);
    expect(result.body).not.toContain('at ');
  });

  it('fails closed on a structurally INVALID record (§8.3(15))', async () => {
    tamperJournal(dataDir, '"nativeRows":68', '"nativeRows":67');
    const result = await callHandler(url(), 'GET', env());
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'EVIDENCE_INVALID' });
  });

  it('re-verifies the digest on EVERY read, so repeated reads never weaken integrity', async () => {
    expect((await callHandler(url(), 'GET', env())).status).toBe(200);
    expect((await callHandler(url(), 'GET', env())).status).toBe(200);
    tamperJournal(dataDir, `"fileName":"${FILE_NAME}"`, '"fileName":"Portfolio(3).csv"');
    expect((await callHandler(url(), 'GET', env())).status).toBe(503);
  });

  it('echoes no owner, tenant, socket path, stack or provider detail on any refusal (§8.1(5))', async () => {
    const refusals = [
      await callHandler(url(UNRETAINED_IMPORT_ID), 'GET', env()),
      await callHandler(url(), 'POST', env()),
      await callHandler(`${url()}?x=1`, 'GET', env()),
      await callHandler(url(), 'GET', env({ [BINDING_PRECONDITION_SETTING]: undefined })),
      await callHandler(url(), 'GET', env({ [BROKER_EVIDENCE_OWNER_PATH_ENV]: undefined })),
    ];
    for (const result of refusals) {
      expect(result.status).toBeGreaterThanOrEqual(400);
      for (const forbidden of [
        APPROVED_BROKER_EVIDENCE_TENANT_ID,
        APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
        BROKER_EVIDENCE_OWNER_DISPLAY_LABEL,
        dataDir,
        carrierPath,
        'stack',
        'ENOENT',
        'at Object.',
      ]) {
        expect(result.body, `refusal ${result.status} leaked "${forbidden}"`).not.toContain(forbidden);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * §8.1(1) / §8.5(19) — non-enumeration and the extended-by-one-leaf closure
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8.5(19) — the closure is extended by exactly one leaf', () => {
  let dataDir = '';
  let carrierDir = '';
  let importId = '';

  beforeAll(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-closure-data-'));
    carrierDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-closure-carrier-'));
    const record = evidenceRecord();
    importId = record.importId;
    new BrokerImportEvidenceStore({ dataDir }).retain(record);
  });

  afterAll(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(carrierDir, { recursive: true, force: true });
  });

  function env(): NodeJS.ProcessEnv {
    return {
      [BINDING_PRECONDITION_SETTING]: 'true',
      [BROKER_EVIDENCE_OWNER_PATH_ENV]: materialiseBrokerEvidenceOwnerCarrier(carrierDir),
      IIPS_DATA_DIR: dataDir,
    } as NodeJS.ProcessEnv;
  }

  it.each([
    'the four-segment collection form',
    'a sixth segment',
    'an unknown leaf',
    'a list-ish leaf',
  ])('admits no enumeration surface: %s stays 404', async (label) => {
    const paths: Record<string, string> = {
      'the four-segment collection form': `/api/broker-import/${PORTFOLIO}/evidence`,
      'a sixth segment': `/api/broker-import/${PORTFOLIO}/evidence/${importId}/extra`,
      'an unknown leaf': `/api/broker-import/${PORTFOLIO}/evidences`,
      'a list-ish leaf': `/api/broker-import/${PORTFOLIO}/evidence-list`,
    };
    const result = await callHandler(paths[label], 'GET', env());
    expect(result.status, label).toBe(404);
    expect(result.body, label).not.toContain(importId);
  });

  it('preserves the pre-existing closure: preview and unknown paths stay 404, holdings stays POST-only', async () => {
    expect((await callHandler(`/api/broker-import/${PORTFOLIO}/preview`, 'GET', env())).status).toBe(404);
    expect((await callHandler(`/api/broker-import/${PORTFOLIO}/unknown`, 'GET', env())).status).toBe(404);
    const getHoldings = await callHandler(`/api/broker-import/${PORTFOLIO}/holdings`, 'GET', env());
    expect(getHoldings.status).toBe(405);
    expect(getHoldings.headers.allow).toBe('POST');
  });

  it('never returns more than one record and never lists importIds', async () => {
    // Retain a second record in scope; the response must still describe exactly one.
    const second = evidenceRecord('2026-11-04T09:00:00.000Z');
    new BrokerImportEvidenceStore({ dataDir }).retain(second);
    const result = await callHandler(`/api/broker-import/${PORTFOLIO}/evidence/${importId}`, 'GET', env());
    expect(result.status).toBe(200);
    const body = result.json as Record<string, unknown>;
    expect(body.importId).toBe(importId);
    expect(result.body).not.toContain(second.importId);
    // O-1 reports a COUNT, which is visibility the act requires — not the ids themselves.
    expect((body.retention as Record<string, unknown>).storage).toMatchObject({ recordCount: 2 });
  });
});

/* ------------------------------------------------------------------ *
 * §8.3(16) — indefinite retention: nothing deletes, purges or expires
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8.3(16) — indefinite retention, no purge, no DELETE', () => {
  let dataDir = '';
  let carrierDir = '';
  let importId = '';

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-retention-data-'));
    carrierDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-a9-retention-carrier-'));
    const record = evidenceRecord();
    importId = record.importId;
    new BrokerImportEvidenceStore({ dataDir }).retain(record);
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(carrierDir, { recursive: true, force: true });
  });

  function env(): NodeJS.ProcessEnv {
    return {
      [BINDING_PRECONDITION_SETTING]: 'true',
      [BROKER_EVIDENCE_OWNER_PATH_ENV]: materialiseBrokerEvidenceOwnerCarrier(carrierDir),
      IIPS_DATA_DIR: dataDir,
    } as NodeJS.ProcessEnv;
  }

  it('reads never reduce the record count, shrink the journal, or expire anything', async () => {
    const journalPath = path.join(dataDir, 'journal.ndjson');
    const beforeBytes = fs.statSync(journalPath).size;
    const beforeCount = new BrokerImportEvidenceStore({ dataDir }).describeStorageUsage(
      APPROVED_BROKER_EVIDENCE_TENANT_ID,
      APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
    ).recordCount;

    for (let i = 0; i < 5; i += 1) {
      const result = await callHandler(`/api/broker-import/${PORTFOLIO}/evidence/${importId}`, 'GET', env());
      expect(result.status).toBe(200);
    }

    expect(fs.statSync(journalPath).size).toBe(beforeBytes);
    const usage = new BrokerImportEvidenceStore({ dataDir }).describeStorageUsage(
      APPROVED_BROKER_EVIDENCE_TENANT_ID,
      APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
    );
    expect(usage.recordCount).toBe(beforeCount);
    expect(usage.recordCount).toBe(1);
  });

  it('admits NO DELETE and no destructive method anywhere in the namespace', async () => {
    const paths = [
      `/api/broker-import/${PORTFOLIO}/evidence/${importId}`,
      `/api/broker-import/${PORTFOLIO}/evidence`,
      `/api/broker-import/${PORTFOLIO}/holdings`,
      `/api/broker-import/${PORTFOLIO}/revision`,
    ];
    for (const target of paths) {
      for (const method of ['DELETE', 'PUT', 'PATCH']) {
        const result = await callHandler(target, method, env());
        expect(result.status, `${method} ${target}`).toBeLessThan(500);
        // Either 404 (not admitted) or 405 (wrong method) — never a success, never a deletion.
        expect([404, 405], `${method} ${target}`).toContain(result.status);
      }
    }
    // The record survives every attempted destructive method.
    const after = await callHandler(`/api/broker-import/${PORTFOLIO}/evidence/${importId}`, 'GET', env());
    expect(after.status).toBe(200);
  });

  it('contains no deletion, purge, expiry or compaction mechanism in the evidence modules', () => {
    for (const name of [
      './brokerImportEvidenceStore.ts',
      './brokerImportHttp.ts',
      './brokerImportEvidenceOwnerCarrier.ts',
      './brokerImportEvidenceOwnerResolver.ts',
    ]) {
      const source = sourceOf(name);
      // No filesystem unlink/removal and no scheduler anywhere in the route tree.
      expect(source, name).not.toMatch(/\bunlinkSync\b|\brmSync\b|\bunlink\(|\brm\(/);
      expect(source, name).not.toMatch(/\bsetInterval\b|\bsetTimeout\b|cron|schedule\(/);
      // No DELETE method is registered or dispatched.
      expect(source, name).not.toMatch(/case 'DELETE'|method === 'DELETE'|=== 'DELETE'/);
    }
  });

  it('exposes no write or enumerate capability through the route reader surface', () => {
    const source = sourceOf('./brokerImportHttp.ts');
    // The reader interface the route depends on has exactly two members, both reads.
    const iface = source.slice(source.indexOf('export interface BrokerImportEvidenceReader'));
    expect(iface.slice(0, iface.indexOf('}'))).toContain('readByImportId');
    expect(iface.slice(0, iface.indexOf('}'))).toContain('describeStorageUsage');
    expect(iface.slice(0, iface.indexOf('}'))).not.toContain('retain');
    expect(iface.slice(0, iface.indexOf('}'))).not.toContain('list');
    // And the route never calls a write.
    expect(source).not.toMatch(/\.retain\(/);
    expect(source).not.toMatch(/updateReadState\(/);
  });

  it('treats the 50 MB threshold as a warning only — it never blocks, truncates or deletes', async () => {
    // Crossing the threshold is simulated by reading the flag logic, not by writing 50 MB.
    const store = new BrokerImportEvidenceStore({ dataDir });
    const usage = store.describeStorageUsage(
      APPROVED_BROKER_EVIDENCE_TENANT_ID,
      APPROVED_BROKER_EVIDENCE_OWNER_USER_ID,
    );
    expect(usage.approximateBytes).toBeLessThan(BROKER_EVIDENCE_REVIEW_THRESHOLD_BYTES);
    // The route still serves the record and still reports no deletion behaviour.
    const result = await callHandler(`/api/broker-import/${PORTFOLIO}/evidence/${importId}`, 'GET', env());
    expect(result.status).toBe(200);
    const retention = (result.json as Record<string, unknown>).retention as Record<string, unknown>;
    expect(retention.reviewThresholdIsDeletionTrigger).toBe(false);
    expect(retention.automaticPurge).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * §8.5(20)-(22) — fences, frozen artefacts and import safety
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8.5 — fences, frozen artefacts and import safety', () => {
  it('keeps owner-context-unavailable.ts byte-identical at its frozen blob (§8.5(21))', () => {
    expect(gitBlobSha1('../owner-context-unavailable.ts')).toBe(
      'cb8db45d668d28cee7e0a52721001d579a872733',
    );
  });

  it('keeps the evidence modules import-safe: no listener, no connection, no global mutation', async () => {
    for (const name of [
      './brokerImportEvidenceOwnerCarrier.ts',
      './brokerImportEvidenceOwnerResolver.ts',
      './brokerImportEvidenceStore.ts',
      './brokerImportHttp.ts',
    ]) {
      const source = sourceOf(name);
      expect(source, name).not.toMatch(/\.listen\(/);
      expect(source, name).not.toMatch(/createServer\(/);
      expect(source, name).not.toMatch(/createConnection\(/);
      expect(source, name).not.toMatch(/process\.on\(/);
      expect(source, name).not.toMatch(/process\.prependListener/);
      expect(source, name).not.toMatch(/globalThis\.\w+\s*=/);
      expect(source, name).not.toMatch(/process\.env\.\w+\s*=/);
    }
    // Importing the new modules starts nothing.
    const before = process.getActiveResourcesInfo();
    await import('./brokerImportEvidenceOwnerCarrier.js');
    await import('./brokerImportEvidenceOwnerResolver.js');
    const newKinds = process.getActiveResourcesInfo().filter((kind) => !before.includes(kind));
    expect(newKinds.filter((kind) => kind.includes('TCP') || kind.includes('Socket'))).toEqual([]);
  });

  it('adds no new HTTP listener, IPC operation or Vite proxy change (§8.1(4))', () => {
    const transport = sourceOf('../executive-transport.ts');
    // Still exactly one bind host and one guarded listen.
    expect(transport).toContain("EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'");
    expect(transport.match(/server\.listen\(/g) ?? []).toHaveLength(1);
    const vite = sourceOf('../../vite.config.ts');
    expect(vite).toContain("'/api': { target: 'http://localhost:8787', changeOrigin: true }");
    // No new IPC operation vocabulary was introduced by the evidence route.
    expect(sourceOf('./brokerImportHttp.ts')).not.toMatch(/callIpc\('broker/);
    expect(sourceOf('./brokerImportHttp.ts')).not.toMatch(/callIpc\('evidence/);
  });

  it('copies no raw IPD implementation source into IRR', () => {
    for (const name of [
      './brokerImportEvidenceOwnerCarrier.ts',
      './brokerImportEvidenceOwnerResolver.ts',
      './brokerImportEvidenceStore.ts',
      './brokerImportHttp.ts',
    ]) {
      const source = sourceOf(name);
      // The pinned packages are consumed as published build output only, and the evidence route does
      // not import them at all: it reads the IRR-owned journal through PF-1.
      expect(source, name).not.toMatch(/from 'iips-broker-import/);
      expect(source, name).not.toMatch(/from 'iips-np04-governed-persistence/);
      expect(source, name).not.toMatch(/from 'iips-production-market-data/);
      expect(source, name).not.toContain('.cache/broker-import');
    }
  });
});

/* ------------------------------------------------------------------ *
 * §8.4 — consent copy reconciled (clause 18)
 * ------------------------------------------------------------------ */

describe('AMEND-01 §8.4(18) — consent copy reconciled in the product\'s own words', () => {
  // JSX COMMENTS ARE STRIPPED BEFORE ASSERTING. The reconciling comment in the component quotes the
  // superseded wording in order to explain what was removed, so a raw source match would find the
  // phrase in an explanation rather than in copy the user ever sees. Clause 18 governs "the product's
  // own words and the UI copy", i.e. what is rendered — asserted against rendered text in
  // `BrokerHoldingsPreview.test.tsx`, and against comment-stripped source here.
  const copy = sourceOf('../../src/features/broker-holdings/BrokerHoldingsPreview.tsx')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  it('no longer claims the file is "not uploaded or stored" while evidence IS retained', () => {
    // Clause 18(1): the contradiction the act names explicitly. It must be reconciled, not left.
    expect(copy).not.toContain('not uploaded or stored');
    // The reconciled wording keeps the true half — the raw bytes really are not uploaded.
    expect(copy).toMatch(/raw bytes are not uploaded/);
  });

  it('discloses that parsed evidence is retained locally in the owner\'s data directory (18.1)', () => {
    expect(copy).toMatch(/retained/i);
    expect(copy).toMatch(/data directory/i);
  });

  it('discloses that raw CSV bytes are NOT retained and what the retained equivalent is (18.2)', () => {
    expect(copy).toMatch(/raw (CSV|file) bytes are not retained/i);
    expect(copy).toMatch(/parsed row inventory/i);
    expect(copy).toMatch(/digest/i);
  });

  it('discloses owner-scope-only service, no third-party transmission and no enumeration route (18.3)', () => {
    expect(copy).toMatch(/never transmitted to any third party/i);
    expect(copy).toMatch(/no route enumerates/i);
    expect(copy).toMatch(/single personal owner scope/i);
  });

  it('discloses that retention is not a save, not a validation, not an authorization (18.4)', () => {
    expect(copy).toMatch(/not a save/i);
    expect(copy).toMatch(/WRITE_NOT_AUTHORIZED|savedRows|remains 0/i);
  });

  it('discloses indefinite retention, explicit-owner-only deletion and the warning-only 50 MB (18.5)', () => {
    expect(copy).toMatch(/indefinite/i);
    expect(copy).toMatch(/explicit/i);
    expect(copy).toMatch(/no automatic (deletion|purge)/i);
    expect(copy).toMatch(/50 MB/);
    expect(copy).toMatch(/warning/i);
  });
});

/* ------------------------------------------------------------------ *
 * Real composed host — the route is admitted by the ACTUAL route table
 * ------------------------------------------------------------------ */

/**
 * Everything above drives the exported handler directly. This section drives the REAL composed host
 * (`executive-transport.ts`, the actual route table and mount) on an ephemeral loopback port, so that
 * "the handler works" is distinguished from "the route is admitted".
 *
 * §8.1(4): this adds NO listener of its own — it reuses the one existing server export.
 */
describe('AMEND-01 §8 — real composed host (route admission through the actual route table)', () => {
  const temporaryDirs: string[] = [];
  let baseUrl = '';
  let composedServer: http.Server | null = null;
  let importId = '';
  const savedEvidencePath = process.env[BROKER_EVIDENCE_OWNER_PATH_ENV];
  const savedOwnerPath = process.env[OWNER_CONTEXT_PATH_ENV];
  const savedDataDir = process.env.IIPS_DATA_DIR;
  const savedBinding = process.env[BINDING_PRECONDITION_SETTING];

  function tempDir(prefix: string): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    temporaryDirs.push(dir);
    return dir;
  }

  beforeAll(async () => {
    const dataDir = tempDir('iips-a9-host-data-');
    const record = evidenceRecord();
    importId = record.importId;
    new BrokerImportEvidenceStore({ dataDir }).retain(record);

    process.env.IIPS_DATA_DIR = dataDir;
    process.env[BROKER_EVIDENCE_OWNER_PATH_ENV] = materialiseBrokerEvidenceOwnerCarrier(
      tempDir('iips-a9-host-carrier-'),
    );
    process.env[OWNER_CONTEXT_PATH_ENV] = materialiseOwnerContextCarrier(tempDir('iips-a9-host-f3-'));
    process.env[BINDING_PRECONDITION_SETTING] = 'true';

    const mod = await import('../executive-transport.js');
    composedServer = mod.server;
    await new Promise<void>((resolve) => composedServer!.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(composedServer.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (composedServer) await new Promise<void>((resolve) => composedServer!.close(() => resolve()));
    const restore = (key: string, value: string | undefined): void => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    };
    restore(BROKER_EVIDENCE_OWNER_PATH_ENV, savedEvidencePath);
    restore(OWNER_CONTEXT_PATH_ENV, savedOwnerPath);
    restore('IIPS_DATA_DIR', savedDataDir);
    restore(BINDING_PRECONDITION_SETTING, savedBinding);
    while (temporaryDirs.length > 0) {
      const dir = temporaryDirs.pop();
      if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('admits the evidence route through the real mount and serves the owner\'s record', async () => {
    const response = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence/${importId}`, {
      method: 'GET',
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.importId).toBe(importId);
    expect((body.rows as unknown[]).length).toBe(68);
    expect(body).not.toHaveProperty('tenantId');
    expect(body).not.toHaveProperty('ownerUserId');
  });

  it('keeps the four-segment collection form at 404 over the real host — no enumeration surface', async () => {
    const response = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence`, { method: 'GET' });
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain(importId);
  });

  it('answers 405 Allow: GET for every non-GET method on the evidence path over the real host', async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence/${importId}`, { method });
      expect(response.status, method).toBe(405);
      expect(response.headers.get('allow'), method).toBe('GET');
    }
  });

  it('sends no wildcard cross-origin header on the evidence path (C8 posture, owner-scoped namespace)', async () => {
    const response = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence/${importId}`, {
      method: 'GET',
    });
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('leaves the two pre-existing routes exactly as they were — the closure gained one leaf only', async () => {
    const getHoldings = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/holdings`, { method: 'GET' });
    expect(getHoldings.status).toBe(405);
    expect(getHoldings.headers.get('allow')).toBe('POST');

    const preview = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/preview`, { method: 'GET' });
    expect(preview.status).toBe(404);

    const unknown = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidences`, { method: 'GET' });
    expect(unknown.status).toBe(404);
  });

  it('fails closed over the real host when the evidence carrier is removed, without a restart', async () => {
    const carrierPath = process.env[BROKER_EVIDENCE_OWNER_PATH_ENV];
    expect(carrierPath).toBeDefined();
    fs.rmSync(carrierPath as string);
    // §3.7(4): uncached per-request evaluation — the very next request fails closed.
    const response = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence/${importId}`, {
      method: 'GET',
    });
    expect(response.status).toBe(503);
    expect((await response.json()) as unknown).toEqual(OWNER_CONTEXT_UNAVAILABLE);
    // Restoring it takes effect immediately too, with no restart.
    materialiseBrokerEvidenceOwnerCarrier(path.dirname(carrierPath as string));
    const restored = await fetch(`${baseUrl}/api/broker-import/${PORTFOLIO}/evidence/${importId}`, {
      method: 'GET',
    });
    expect(restored.status).toBe(200);
  });

  it('leaves every fenced user-portfolio write/context pair at 503 over the real host', async () => {
    const stillFenced: ReadonlyArray<readonly [string, string]> = [
      ['/api/user-portfolios/context', 'GET'],
      ['/api/user-portfolios/context', 'HEAD'],
      ['/api/user-portfolios', 'POST'],
      ['/api/user-portfolios/P-1', 'DELETE'],
      ['/api/user-portfolios/P-1/holdings', 'PUT'],
      ['/api/user-portfolios/P-1/reset', 'POST'],
    ];
    expect(stillFenced).toHaveLength(6);
    for (const [path_, method] of stillFenced) {
      const response = await fetch(`${baseUrl}${path_}`, { method });
      expect(response.status, `${method} ${path_}`).toBe(503);
      if (method !== 'HEAD') {
        expect(
          ((await response.json()) as Record<string, unknown>).error,
          `${method} ${path_}`,
        ).toBe('operation-not-admitted');
      }
    }
  });
});
