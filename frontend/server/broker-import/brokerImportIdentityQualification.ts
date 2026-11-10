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
 * WHY IT EXISTS — THE MEASURED DEFECT
 *   IRR's broker-import route sends broker-observed holdings to the IPC operation
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
 *   writes the real broker provenance. But it is constructed by IPD's `startIpcServer` and
 *   returned as an in-process function on the startup outcome. It is NOT dispatched as an IPC
 *   operation: IPD's protocol admits exactly seven v1 operations and five v2 operations
 *   (`src/ipc/protocol.ts`) and none of them is the broker-import operation. It is also NOT
 *   exported from the `./portfolio-ui` package subpath that IRR consumes — the shipped
 *   package at the pinned commit exports 22 symbols and none of them is the Stage 4 CSV
 *   application path (`parseBrokerCsvUpload`, `brokerImportPreview`, `executeBrokerCsvImport`).
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
 *   - It does not claim the governed path is unavailable forever. It refuses only while the
 *     governed path is genuinely unreachable, and the reachability is a single explicit
 *     operator-visible switch with a named reason, so an operator who has confirmed the wire
 *     can turn it on without editing business logic.
 *
 * FAIL CLOSED
 *   The refusal is emitted BEFORE any socket is opened, so it costs nothing, writes nothing,
 *   and cannot leave a partial effect. It is reported as the admitted refusal code
 *   `REFUSED_STORE_GUARD` with `storeEffect: 'NONE'` — a code that is already in the
 *   IPD-admitted refusal vocabulary, so no new outcome code is invented and the browser
 *   adapter needs no new vocabulary either.
 */

/**
 * The single, explicit switch that says the governed broker-import commit path IS reachable
 * over the wire and has been wired into the transport.
 *
 * It is `false` by default: the fail-closed posture is the resting state, and a write is not
 * admitted merely because a configuration file exists. An operator flips it only after the
 * governed operation has actually been dispatched by the IPD process this host talks to and
 * verified end-to-end.
 */
export const BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE = false;

/**
 * The single, stable reason string for the refusal. It names the missing capability without
 * disclosing an internal path, a stack, or an identity.
 */
export const BROKER_IMPORT_IDENTITY_QUALIFICATION_REFUSAL_REASON =
  'The governed whole-import identity gate is not applied on the commit path available to this host; '
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
