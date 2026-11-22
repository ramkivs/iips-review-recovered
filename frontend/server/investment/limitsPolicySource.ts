/**
 * S6-1 — the operator limits policy, read from its documented location.
 *
 *   ${IIPS_DATA_DIR}/investment/policies/limits-policy.json
 *
 * (roadmap B.H; runbook §15.3). Before this module the parser existed (`resolveDispositionLimits`) and the path
 * was documented, but nothing joined them: every disposition producer had to be handed limits by its caller, and
 * the one producer that exists passed `policy: null`. This module is that join, and nothing more.
 *
 * THREE OUTCOMES, NEVER A FOURTH.
 *   ABSENT         no file at the documented path → the labelled SYSTEM DEFAULTS. Disclosed as absent.
 *   OPERATOR_FILE  a file exists and parses → the operator's caps, `basis: OPERATOR_CONFIG`, their `policyVersion`
 *                  (or, when the file is dated in the future, the defaults with the fact in `limits.notes` —
 *                  `resolveLimits` decides that; this module does not second-guess it).
 *   throw          a file exists and is unreadable, not JSON, not a policy, or has an invalid value →
 *                  `LimitsPolicyError`. Fail closed. The defaults are NOT substituted: a typo in a cap must not
 *                  silently become a different risk limit (R-11 §2 precedence step 3).
 *
 * `source.kind` and `limits.basis` are returned side by side so a caller can never report "operator configuration
 * applied" from anything other than the file that was actually read: `OPERATOR_CONFIG` is only ever produced when
 * `source.kind === 'OPERATOR_FILE'`, and `isLimitsDisclosureConsistent` states that invariant for tests.
 *
 * NO PARALLEL PARSER. Parsing and resolution are `resolveDispositionLimits` → `parseLimitsPolicyText` →
 * `resolveLimits`, unchanged. This module resolves a path, reads bytes and labels the outcome.
 *
 * DATA-ROOT CONVENTION. `dataRoot` explicit > `IIPS_DATA_DIR` > `<cwd>/.iips-data` — the same precedence the
 * identity directory and the dataset directory already use (`resolveIdentityDir`, `localSnapshotStore`). The
 * file name is fixed: an operator cannot point this loader at an arbitrary file, so the documented path is the
 * only path a disposition's `OPERATOR_CONFIG` can come from.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { LimitsPolicyError } from '../../../iips-platform/src/investment/disposition/limits';
import type { ResolvedLimits } from '../../../iips-platform/src/investment/disposition/types';
import { resolveDispositionLimits } from './dispositionService.js';

export const LIMITS_POLICY_DATA_DIR_ENV = 'IIPS_DATA_DIR' as const;
export const LIMITS_POLICY_SUBDIR = Object.freeze(['investment', 'policies'] as const);
export const LIMITS_POLICY_FILE_NAME = 'limits-policy.json' as const;

export type LimitsPolicySourceKind = 'ABSENT' | 'OPERATOR_FILE';

export interface LimitsPolicySource {
  readonly kind: LimitsPolicySourceKind;
  /** The absolute path that was consulted — present in both outcomes, so an ABSENT result names where it looked. */
  readonly path: string;
}

export interface LoadedLimitsPolicy {
  readonly limits: ResolvedLimits;
  readonly source: LimitsPolicySource;
}

export interface LoadLimitsPolicyOptions {
  /** The instant the disposition is generated for; effective dating is decided against it. */
  readonly asOf: string;
  /** Overrides the data-domain root; otherwise `IIPS_DATA_DIR`, otherwise `<cwd>/.iips-data`. */
  readonly dataRoot?: string;
  readonly env?: NodeJS.ProcessEnv;
}

/** `<dataRoot>/investment/policies`, where dataRoot = explicit > IIPS_DATA_DIR > `<cwd>/.iips-data`. */
export function resolveLimitsPolicyDir(dataRoot?: string, env: NodeJS.ProcessEnv = process.env): string {
  const configured = env[LIMITS_POLICY_DATA_DIR_ENV];
  const root =
    dataRoot ?? (typeof configured === 'string' && configured.trim().length > 0 ? configured : resolve(process.cwd(), '.iips-data'));
  return join(resolve(root), ...LIMITS_POLICY_SUBDIR);
}

/** The documented policy path. The file name is not configurable. */
export function resolveLimitsPolicyPath(dataRoot?: string, env: NodeJS.ProcessEnv = process.env): string {
  return join(resolveLimitsPolicyDir(dataRoot, env), LIMITS_POLICY_FILE_NAME);
}

/**
 * Load the operator limits policy from the documented path and resolve the caps in force at `asOf`.
 *
 * Absent ⇒ labelled defaults. Present and valid ⇒ the operator's caps. Present and anything else ⇒ throws
 * `LimitsPolicyError`; the caller's disposition gates then fail with `policy_inputs_unavailable`.
 */
export function loadOperatorLimitsPolicy(options: LoadLimitsPolicyOptions): LoadedLimitsPolicy {
  const path = resolveLimitsPolicyPath(options.dataRoot, options.env ?? process.env);

  if (!existsSync(path)) {
    return Object.freeze({
      limits: resolveDispositionLimits({ policyText: null, asOf: options.asOf }),
      source: Object.freeze({ kind: 'ABSENT' as const, path }),
    });
  }

  // From here on a file exists at the documented path. Every failure is the operator's policy failing, and
  // the defaults are never offered in its place.
  let text: string;
  try {
    if (!statSync(path).isFile()) {
      throw new LimitsPolicyError('the limits policy path exists but is not a file', 'NOT_AN_OBJECT', { path });
    }
    text = readFileSync(path, 'utf8');
  } catch (cause) {
    if (cause instanceof LimitsPolicyError) throw cause;
    throw new LimitsPolicyError('the operator limits policy file could not be read', 'NOT_AN_OBJECT', {
      path,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  if (text.trim().length === 0) {
    // `resolveDispositionLimits` treats blank text as "no policy". A blank FILE is not "no policy": the operator
    // wrote something and it is not a policy, so it fails closed like any other invalid document.
    throw new LimitsPolicyError('the operator limits policy file is empty', 'NOT_AN_OBJECT', { path });
  }

  const limits = resolveDispositionLimits({ policyText: text, asOf: options.asOf });
  return Object.freeze({ limits, source: Object.freeze({ kind: 'OPERATOR_FILE' as const, path }) });
}

/**
 * The disclosure invariant: `OPERATOR_CONFIG` may only ever be reported when the operator file was actually read.
 * (The converse is not required — a future-dated operator file legitimately yields `SYSTEM_DEFAULT` with a note.)
 */
export function isLimitsDisclosureConsistent(loaded: LoadedLimitsPolicy): boolean {
  if (loaded.limits.basis === 'OPERATOR_CONFIG') return loaded.source.kind === 'OPERATOR_FILE';
  return loaded.limits.policyVersion.endsWith('+system-default');
}
