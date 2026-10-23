/**
 * CAP-02 broker-import trusted-host adapter — exact v1 `portfolio.save` over the existing IPC
 * client (IRR side).
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §§1–3
 * and `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.2, implementing
 * the accepted IPD-owned wire contract v1 `portfolio.save` payload/result.
 *
 * WHY A NEW ADAPTER (the old G2 adapter is NOT reused — U1 §2.2)
 *   `frontend/server/user-portfolio/ipcPortAdapter.ts` sends `expectedRevision?` plus
 *   `options:{mode, contentDigest, fileName, sourceBroker}` and constructs the older
 *   `G2SaveResult`. Accepted v1 requires mandatory top-level `expectedRevision`, `mode`,
 *   `contentDigest` and `broker`, refuses unknown request keys, and returns a minimal receipt.
 *   Reusing that adapter would fail at the IPD parser and then invent result semantics. It is
 *   excluded, not patched in place, and not injected into any IPD browser port.
 *
 * WHAT THIS ADAPTER DOES
 *   - Builds the EXACT top-level v1 payload (no `options` bag, no `fileName`, no `sourceBroker`).
 *   - Calls the existing `callIpc` exactly once: one connection, one request, at most one
 *     response, ZERO automatic retries on every outcome.
 *   - Relays the minimal v1 receipt `{disposition, revision, durability, durable}` verbatim —
 *     no G2 totals, timestamps, counts or records are added.
 *   - Maps Class A refusals, Class P (zero bytes, no reason), and outcome-unknown without
 *     fabricating any field. A success frame whose result is not a valid minimal receipt is
 *     UNREPRESENTABLE: commit uncertainty is preserved, never filled locally.
 *
 * WHAT IT DELIBERATELY CANNOT DO
 *   - Authorize or perform a durable write: while the Gate E W-1 conjunction is unmet, IPD
 *     returns `WRITE_NOT_AUTHORIZED` before any store mutation, and that refusal is relayed
 *     truthfully. No `durable:true` claim originates here.
 *   - Guess a current revision, cache a record, or retry a write whose outcome is unknown.
 */

import {
  callIpc as realCallIpc,
  type IpcClassAOutcome,
  type IpcCallResult,
} from '../user-portfolio/ipcClient.js';
import type { BrokerImportSaveDto } from './brokerImportBoundary.js';

/* ------------------------------------------------------------------ *
 * Minimal v1 save receipt (accepted contract v1 §6 `portfolio.save` result)
 * ------------------------------------------------------------------ */

export const V1_SAVE_DISPOSITIONS: readonly string[] = [
  'SAVED_NEW_BATCH',
  'MERGED_INTO_EXISTING',
  'ALREADY_IMPORTED_NO_OP',
] as const;

export const V1_SAVE_DURABILITY_VALUES: readonly string[] = ['DURABLE', 'SESSION_ONLY'] as const;

export interface V1SaveReceipt {
  readonly disposition: 'SAVED_NEW_BATCH' | 'MERGED_INTO_EXISTING' | 'ALREADY_IMPORTED_NO_OP';
  readonly revision: number;
  readonly durability: 'DURABLE' | 'SESSION_ONLY';
  readonly durable: boolean;
}

/* ------------------------------------------------------------------ *
 * Transport outcome vocabulary (distinct; never conflated)
 * ------------------------------------------------------------------ */

export type BrokerImportSaveTransportOutcome =
  /** An authoritative minimal v1 receipt was received. */
  | { readonly kind: 'RECEIPT'; readonly receipt: V1SaveReceipt }
  /** A typed post-authorization Class A refusal was received. */
  | { readonly kind: 'CLASS_A_REFUSAL'; readonly outcome: IpcClassAOutcome; readonly detail?: string }
  /** Class P: zero bytes and close. IRR observes no reason (C6) and invents none. */
  | { readonly kind: 'CLASS_P_REFUSAL' }
  /** Timeout/transport fault: the write may or may not have committed; never retried here. */
  | { readonly kind: 'OUTCOME_UNKNOWN'; readonly reason: 'TIMEOUT' | 'TRANSPORT_FAULT'; readonly retried: false }
  /**
   * A success frame arrived whose result is not a valid minimal v1 receipt. Commit uncertainty is
   * preserved: no field is filled locally and no success or ordinary-refusal claim is made.
   */
  | { readonly kind: 'UNREPRESENTABLE_RESULT'; readonly retried: false };

export interface BrokerImportSaveAdapterDeps {
  /** IPC client used for the single call. Tests inject a fake; production uses `callIpc`. */
  readonly callIpc: typeof realCallIpc;
}

/* ------------------------------------------------------------------ *
 * Payload construction (exact top-level v1 shape)
 * ------------------------------------------------------------------ */

/**
 * Builds the exact v1 `portfolio.save` payload: top-level `portfolioId`, `expectedRevision`,
 * `mode`, `holdings`, and — only when present — `contentDigest` and `broker`. There is no
 * `options` bag, no `fileName`, no `importedAt`, no `sourceBroker` and no canonical identity key;
 * the input DTO is already boundary-validated, and `encodeRequestFrame` re-enforces OC-7/C7
 * before any socket is opened.
 */
export function buildV1SavePayload(
  portfolioId: string,
  dto: BrokerImportSaveDto,
): Record<string, unknown> {
  return {
    portfolioId,
    expectedRevision: dto.expectedRevision,
    mode: dto.mode,
    holdings: dto.holdings,
    ...(dto.contentDigest !== undefined ? { contentDigest: dto.contentDigest } : {}),
    ...(dto.broker !== undefined ? { broker: dto.broker } : {}),
  };
}

/* ------------------------------------------------------------------ *
 * Receipt validation (fail closed; unknown optional result fields ignored per V-3)
 * ------------------------------------------------------------------ */

export function parseV1SaveReceipt(result: unknown): V1SaveReceipt | null {
  if (typeof result !== 'object' || result === null || Array.isArray(result)) return null;
  const record = result as Record<string, unknown>;
  if (typeof record.disposition !== 'string' || !(V1_SAVE_DISPOSITIONS as readonly string[]).includes(record.disposition)) return null;
  if (typeof record.revision !== 'number' || !Number.isSafeInteger(record.revision) || record.revision < 0) return null;
  if (typeof record.durability !== 'string' || !(V1_SAVE_DURABILITY_VALUES as readonly string[]).includes(record.durability)) return null;
  if (typeof record.durable !== 'boolean') return null;
  return {
    disposition: record.disposition as V1SaveReceipt['disposition'],
    revision: record.revision,
    durability: record.durability as V1SaveReceipt['durability'],
    durable: record.durable,
  };
}

/* ------------------------------------------------------------------ *
 * The one-call save
 * ------------------------------------------------------------------ */

/**
 * Performs exactly ONE `portfolio.save` IPC call for a boundary-validated CAP-02 DTO.
 *
 * Never retries — not on timeout, not on a transport fault, not on a refusal. A write whose
 * outcome is unknown stays unknown: the caller must not resend it.
 */
export async function saveBrokerImportHoldingsViaV1(
  deps: BrokerImportSaveAdapterDeps,
  portfolioId: string,
  dto: BrokerImportSaveDto,
): Promise<BrokerImportSaveTransportOutcome> {
  const payload = buildV1SavePayload(portfolioId, dto);
  const result: IpcCallResult = await deps.callIpc('portfolio.save', payload, {});

  switch (result.kind) {
    case 'SUCCESS': {
      const receipt = parseV1SaveReceipt(result.frame.result);
      if (receipt === null) {
        return { kind: 'UNREPRESENTABLE_RESULT', retried: false };
      }
      return { kind: 'RECEIPT', receipt };
    }
    case 'CLASS_A':
      return {
        kind: 'CLASS_A_REFUSAL',
        outcome: result.frame.outcome,
        ...(typeof result.frame.detail === 'string' ? { detail: result.frame.detail } : {}),
      };
    case 'CLASS_P':
      // Zero bytes and a closed connection. IRR observes NO reason (C6) and invents none.
      return { kind: 'CLASS_P_REFUSAL' };
    case 'OUTCOME_UNKNOWN':
      return { kind: 'OUTCOME_UNKNOWN', reason: result.reason, retried: false };
    default:
      // Fail closed on an unexpected transport result kind: never success, never an invented refusal.
      return { kind: 'OUTCOME_UNKNOWN', reason: 'TRANSPORT_FAULT', retried: false };
  }
}

/** Production dependency set (the single real IPC client). */
export const defaultBrokerImportSaveDeps: BrokerImportSaveAdapterDeps = { callIpc: realCallIpc };
