/**
 * Broker-import identity-qualification gate (IRR side).
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
 * §2, the effective GC-D2 §9.4 no-successful-write-identity policy that already governs
 * IRR's other write surfaces (`server/user-portfolio/translationBoundary.ts`), and the
 * D05 whole-import identity gate (Gate E W-6 / DP-2 Option 2F).
 *
 * WHAT THIS GATE IS
 *   A fail-closed admission decision for ONE request shape: a write of BROKER-OBSERVED
 *   holdings. It decides whether that write may be sent to the store at all. It does not
 *   resolve identity, mint an identifier, score a match, or compare a name. It never
 *   duplicates IPD's business logic.
 *
 * WHY IT EXISTS — THE MEASURED DEFECT IN THE LEGACY DTO
 *   The legacy broker-import DTO would send broker-observed holdings to the IPC operation
 *   `portfolio.save`. On the IPD side that operation is the MANUAL personal-holdings path
 *   (`src/ipc/dispatch.ts` → `mapManualRequest` in `src/persistence/manualPersonalPortfolio.ts`).
 *   `mapManualRequest` stamps every row it accepts with:
 *
 *       sourceBroker:        'manual-personal'
 *       identityStatus:      'UNRESOLVED'
 *       resolutionDisposition: 'MANUAL_PERSONAL_ENTRY'
 *       companyId:           'MANUAL:<SYMBOL>'      (synthetic)
 *
 *   and performs NO governed identity resolution and NO whole-import identity refusal.
 *
 *   IPD's governed broker-import commit path — `persistBrokerImport` in
 *   `src/persistence/brokerImportPersistence.ts`, reached through
 *   `createBrokerImportConsumer` — DOES apply the governed resolver and the whole-import
 *   refusal (`REFUSED_UNRESOLVED_IDENTITY`), creates the portfolio when it is absent, and
 *   writes the real broker provenance. When this guard was added that consumer was not dispatched
 *   over IPC. IPD PR #148 subsequently added `portfolio.importBroker`: IRR now routes a distinct,
 *   complete provenance-bearing DTO to that guarded operation. That does NOT make the older
 *   `portfolio.save` mapping safe; this guard remains permanently closed for the legacy DTO.
 *
 *   The consequence, verified against a real IPD IPC server over a real socket: a broker
 *   import sent through IRR's route writes holdings whose identity is UNRESOLVED with a
 *   synthetic company id, and an import containing an unresolvable row is NOT refused — the
 *   governed whole-import gate never runs. That contradicts IRR's own standing policy for
 *   every other write surface, which refuses EVERY batch of unresolved holdings
 *   (`refuseUnresolvedPortfolioWrite`).
 *
 * WHAT THIS GATE DOES NOT DO
 *   - It does not weaken, relax or reinterpret IPD's write gate. IPD's W-1 decision is
 *     untouched and still decides every write that is actually attempted.
 *   - It does not invent a mapping, infer an identity, or reuse a name/symbol similarity.
 *   - It does not change IPD, the governed master, or any mapping store.
 *   - It does not govern the new `portfolio.importBroker` route, whose downstream consumer
 *     applies the actual Stage 4 qualification. This guard protects only the older DTO and
 *     cannot be turned on merely because the new operation exists.
 *
 * FAIL CLOSED
 *   The refusal is emitted BEFORE any socket is opened, so it costs nothing, writes nothing,
 *   and cannot leave a partial effect. It is reported as the admitted refusal code
 *   `REFUSED_STORE_GUARD` with `storeEffect: 'NONE'` — a code that is already in the
 *   IPD-admitted refusal vocabulary, so no new outcome code is invented and the browser
 *   adapter needs no new vocabulary either.
 */

/**
 * Legacy path only: `portfolio.save` does not apply the broker identity gate, and this
 * switch remains false even when `portfolio.importBroker` is reachable. The new route
 * bypasses neither this decision nor its manual adapter; it uses the separate governed
 * IPC operation and its own strict DTO.
 */
export const BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE = false;

/**
 * The single, stable reason string for the refusal. It names the missing capability without
 * disclosing an internal path, a stack, or an identity.
 */
export const BROKER_IMPORT_IDENTITY_QUALIFICATION_REFUSAL_REASON =
  'The governed whole-import identity gate is not applied on this legacy manual-save path; '
  + 'no broker-observed holding was written and no identity was assigned.';

/**
 * The gate's decision.
 *
 * `admitted: true` means the write may proceed to the transport.
 * `admitted: false` carries the stable refusal reason and the admitted refusal code.
 */
export type BrokerImportIdentityQualificationDecision =
  | { readonly admitted: true }
  | {
      readonly admitted: false;
      readonly code: 'REFUSED_STORE_GUARD';
      readonly reason: string;
    };

/**
 * Decides whether a broker-observed write may be sent to the store.
 *
 * Pure. Reads no request, no header, no body and no identity. It consults exactly one
 * server-owned switch.
 */
export function evaluateBrokerImportIdentityQualification(): BrokerImportIdentityQualificationDecision {
  if (BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE) return { admitted: true };
  return {
    admitted: false,
    code: 'REFUSED_STORE_GUARD',
    reason: BROKER_IMPORT_IDENTITY_QUALIFICATION_REFUSAL_REASON,
  };
}

/**
 * The injectable form of the gate.
 *
 * Production uses {@link evaluateBrokerImportIdentityQualification}. A test that exercises
 * the RESPONSE MAPPING of a transport outcome must inject an admitted decision, so that it
 * tests the mapping it names rather than the gate. The gate itself is tested separately,
 * against the real production decision.
 */
export type BrokerImportIdentityQualificationEvaluator =
  () => BrokerImportIdentityQualificationDecision;
