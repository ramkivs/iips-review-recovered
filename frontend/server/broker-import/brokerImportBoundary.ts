/**
 * CAP-02 broker-import HTTP boundary — strict DTO validation (IRR side).
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2
 * and `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.2, implementing
 * the accepted IPD-owned wire contract v1 (`portfolio.save` payload, contract §6) for the single
 * admitted route `POST /api/broker-import/:portfolioId/holdings`.
 *
 * WHAT THIS MODULE IS
 *   Pure, import-safe validation of the CAP-02 HTTP DTO before any transport work: exact
 *   top-level key set, mandatory `expectedRevision` (contract W-5), closed `MERGE`/`REPLACE`
 *   mode, a bounded raw-observation holding allowlist, the actual provider digest shape, and
 *   refusal of canonical-identity/owner/tenant/credential keys at any depth BEFORE any socket is
 *   opened. It creates no listener, opens no connection, and performs no I/O.
 *
 * WHAT IT DELIBERATELY CANNOT DO
 *   - Accept `options`, `fileName`, `importedAt`, `sourceBroker` or `lineageDigest`: none is a v1
 *     `portfolio.save` field. They are typed refusals, never silently forwarded or dropped
 *     (C-1/U2 provenance gap preserved by refusal, not by accommodation).
 *   - Accept a canonical identity claim (`companyId`, `runtimeCompanyId`, `identityStatus`,
 *     `resolutionDisposition`) or any owner/tenant/principal/credential key at any depth: IPD
 *     resolves canonical identity itself (Gate E W-6 / C7), re-enforced here before send.
 *   - Default, coerce or "repair" any value: value semantics are IPD's. Missing means refused.
 *
 * DIGEST SHAPE (correction recorded by the effective U1 act §2.4)
 *   The actual provider digest is 64-character lowercase hex SHA-256 (`computeSha256` in IPD
 *   `src/contracts/provenance.ts`, used by the ingress stage 0 at the pinned commit). IRR never
 *   recomputes it; it validates shape only and forwards the UI ingress evidence verbatim.
 */

/* ------------------------------------------------------------------ *
 * DTO shape (mirrors of the accepted v1 broker-observed holding set)
 * ------------------------------------------------------------------ */

/** Broker-observed holding fields admitted by v1 §6 (symbol, ISIN, exchange, quantity, prices). */
export const BROKER_OBSERVED_HOLDING_KEYS: readonly string[] = [
  'symbol',
  'isin',
  'exchange',
  'quantity',
  'averageBuyPrice',
  'currentPrice',
  'marketValue',
] as const;

/** Exact admitted top-level DTO keys (v1 `portfolio.save` payload minus the route parameter). */
export const BROKER_IMPORT_DTO_KEYS: readonly string[] = [
  'expectedRevision',
  'mode',
  'holdings',
  'contentDigest',
  'broker',
] as const;

export const BROKER_IMPORT_MODES: readonly ('MERGE' | 'REPLACE')[] = ['MERGE', 'REPLACE'];
export const BROKER_IMPORT_EXCHANGES: readonly ('NSE' | 'BSE')[] = ['NSE', 'BSE'];

/** Bounded sizes: the IPC request cap (64 KiB) bounds the wire anyway; these bound the DTO first. */
export const BROKER_IMPORT_MAX_HOLDINGS = 5_000;
export const BROKER_IMPORT_MAX_SYMBOL_LENGTH = 32;
export const BROKER_IMPORT_MAX_ISIN_LENGTH = 24;
export const BROKER_IMPORT_MAX_BROKER_LENGTH = 32;
export const BROKER_IMPORT_MAX_PORTFOLIO_ID_LENGTH = 128;

/** Actual provider digest shape: 64-character lowercase hex SHA-256. */
export const BROKER_IMPORT_CONTENT_DIGEST_PATTERN = /^[0-9a-f]{64}$/;

/** A raw broker-observed holding as it may cross the CAP-02 boundary. */
export interface BrokerObservedHoldingInput {
  readonly symbol: string;
  readonly isin?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly quantity?: number;
  readonly averageBuyPrice?: number;
  readonly currentPrice?: number;
  readonly marketValue?: number;
}

/** The validated CAP-02 save DTO (the admitted v1 payload minus the opaque route parameter). */
export interface BrokerImportSaveDto {
  readonly expectedRevision: number;
  readonly mode: 'MERGE' | 'REPLACE';
  readonly holdings: readonly BrokerObservedHoldingInput[];
  readonly contentDigest?: string;
  readonly broker?: string;
}

/** Typed validation refusal: field path and static reason only — no request value is echoed. */
export interface BrokerImportValidationRefusal {
  readonly code: 'INVALID_REQUEST';
  readonly fieldPath: string;
  readonly reason: string;
}

export type BrokerImportBoundaryResult =
  | { readonly ok: true; readonly dto: BrokerImportSaveDto }
  | { readonly ok: false; readonly refusal: BrokerImportValidationRefusal };

/* ------------------------------------------------------------------ *
 * Authority-key re-enforcement (OC-7 / C7, before any I/O)
 * ------------------------------------------------------------------ */

import { findRefusedWireKeys } from '../user-portfolio/ipcClient.js';

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function refuse(fieldPath: string, reason: string): BrokerImportBoundaryResult {
  return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath, reason } };
}

/**
 * Validates the opaque route `portfolioId`. IRR never resolves identity: the value is an opaque
 * identifier validated for shape only (length, no control characters, no path separators).
 */
export function validatePortfolioIdParam(portfolioId: string): BrokerImportValidationRefusal | null {
  const trimmed = portfolioId.trim();
  if (trimmed.length === 0) {
    return { code: 'INVALID_REQUEST', fieldPath: 'path.portfolioId', reason: 'empty-identifier' };
  }
  if (trimmed.length > BROKER_IMPORT_MAX_PORTFOLIO_ID_LENGTH) {
    return { code: 'INVALID_REQUEST', fieldPath: 'path.portfolioId', reason: 'overlong-identifier' };
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(trimmed) || trimmed.includes('/') || trimmed.includes('\\')) {
    return { code: 'INVALID_REQUEST', fieldPath: 'path.portfolioId', reason: 'invalid-identifier-shape' };
  }
  return null;
}

function validateHolding(entry: unknown, index: number): { ok: true; holding: BrokerObservedHoldingInput } | { ok: false; refusal: BrokerImportValidationRefusal } {
  const path = (name: string): string => `body.holdings[${index}].${name}`;
  if (!isPlainObject(entry)) {
    return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: `body.holdings[${index}]`, reason: 'holding-is-not-an-object' } };
  }
  for (const key of Object.keys(entry)) {
    if (!BROKER_OBSERVED_HOLDING_KEYS.includes(key)) {
      return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: `body.holdings[${index}].${key}`, reason: 'field-outside-broker-observed-allowlist' } };
    }
  }
  const symbol = entry.symbol;
  if (typeof symbol !== 'string' || symbol.trim().length === 0 || symbol.length > BROKER_IMPORT_MAX_SYMBOL_LENGTH) {
    return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: path('symbol'), reason: 'symbol-required-bounded-string' } };
  }
  const isin = entry.isin;
  if (isin !== undefined && (typeof isin !== 'string' || isin.length === 0 || isin.length > BROKER_IMPORT_MAX_ISIN_LENGTH)) {
    return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: path('isin'), reason: 'isin-optional-bounded-string' } };
  }
  const exchange = entry.exchange;
  if (exchange !== undefined && (typeof exchange !== 'string' || !(BROKER_IMPORT_EXCHANGES as readonly string[]).includes(exchange))) {
    return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: path('exchange'), reason: 'exchange-nse-or-bse' } };
  }
  for (const numeric of ['quantity', 'averageBuyPrice', 'currentPrice', 'marketValue'] as const) {
    const value = entry[numeric];
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
      return { ok: false, refusal: { code: 'INVALID_REQUEST', fieldPath: path(numeric), reason: 'optional-finite-nonnegative-number' } };
    }
  }
  const holding: BrokerObservedHoldingInput = {
    symbol,
    ...(isin !== undefined ? { isin } : {}),
    ...(exchange !== undefined ? { exchange: exchange as 'NSE' | 'BSE' } : {}),
    ...(entry.quantity !== undefined ? { quantity: entry.quantity as number } : {}),
    ...(entry.averageBuyPrice !== undefined ? { averageBuyPrice: entry.averageBuyPrice as number } : {}),
    ...(entry.currentPrice !== undefined ? { currentPrice: entry.currentPrice as number } : {}),
    ...(entry.marketValue !== undefined ? { marketValue: entry.marketValue as number } : {}),
  };
  return { ok: true, holding };
}

/**
 * Validates the CAP-02 save DTO exactly. Any result other than `ok: true` is a typed refusal that
 * MUST be answered without any IPC call: nothing in this module performs I/O, and the refusal is
 * produced before the caller may construct a transport.
 */
export function validateBrokerImportSaveDto(body: unknown): BrokerImportBoundaryResult {
  if (!isPlainObject(body)) {
    return refuse('body', 'body-is-not-an-object');
  }
  // Exact top-level key set: every key must be an admitted DTO key.
  for (const key of Object.keys(body)) {
    if (!BROKER_IMPORT_DTO_KEYS.includes(key)) {
      return refuse(`body.${key}`, 'field-outside-v1-save-payload');
    }
  }
  // OC-7 / C7 re-enforcement: authority or canonical-identity keys at ANY depth are refused by
  // name, before any socket. This catches smuggling the G2 `options` bag, `fileName`,
  // `sourceBroker`-shaped claims or identity keys nested inside holdings.
  const refusedKeys = findRefusedWireKeys(body);
  if (refusedKeys.length > 0) {
    return refuse(`body.${refusedKeys[0]}`, 'caller-supplied-authority-or-identity-key-refused');
  }
  // Mandatory expectedRevision (W-5): missing/invalid is refused before I/O; no zero fallback.
  const expectedRevision = body.expectedRevision;
  if (expectedRevision === undefined) {
    return refuse('body.expectedRevision', 'expected-revision-mandatory');
  }
  if (typeof expectedRevision !== 'number' || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    return refuse('body.expectedRevision', 'expected-revision-non-negative-integer');
  }
  // Closed mode set; no transport-invented default.
  const mode = body.mode;
  if (mode === undefined) {
    return refuse('body.mode', 'mode-mandatory');
  }
  if (typeof mode !== 'string' || !(BROKER_IMPORT_MODES as readonly string[]).includes(mode)) {
    return refuse('body.mode', 'mode-merge-or-replace');
  }
  // Bounded holdings vector.
  const holdings = body.holdings;
  if (holdings === undefined) {
    return refuse('body.holdings', 'holdings-mandatory');
  }
  if (!Array.isArray(holdings)) {
    return refuse('body.holdings', 'holdings-is-not-an-array');
  }
  if (holdings.length === 0) {
    return refuse('body.holdings', 'holdings-must-not-be-empty');
  }
  if (holdings.length > BROKER_IMPORT_MAX_HOLDINGS) {
    return refuse('body.holdings', 'holdings-exceed-bounded-limit');
  }
  const validated: BrokerObservedHoldingInput[] = [];
  for (let i = 0; i < holdings.length; i += 1) {
    const result = validateHolding(holdings[i], i);
    if (!result.ok) return { ok: false, refusal: result.refusal };
    validated.push(result.holding);
  }
  // Optional contentDigest: the actual provider shape (64-char lowercase hex), forwarded verbatim.
  const contentDigest = body.contentDigest;
  if (contentDigest !== undefined) {
    if (typeof contentDigest !== 'string' || !BROKER_IMPORT_CONTENT_DIGEST_PATTERN.test(contentDigest)) {
      return refuse('body.contentDigest', 'content-digest-must-be-64-lowercase-hex-sha256');
    }
  }
  // Optional broker observation (the UI's file-level sourceBroker, projected by explicit mapping).
  const broker = body.broker;
  if (broker !== undefined) {
    if (typeof broker !== 'string' || broker.trim().length === 0 || broker.trim().length > BROKER_IMPORT_MAX_BROKER_LENGTH) {
      return refuse('body.broker', 'broker-optional-bounded-string');
    }
  }
  const dto: BrokerImportSaveDto = {
    expectedRevision,
    mode: mode as BrokerImportSaveDto['mode'],
    holdings: validated,
    ...(contentDigest !== undefined ? { contentDigest } : {}),
    ...(broker !== undefined ? { broker } : {}),
  };
  return { ok: true, dto };
}
