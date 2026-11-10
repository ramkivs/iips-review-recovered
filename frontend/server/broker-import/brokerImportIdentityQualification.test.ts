/**
 * Broker-import identity-qualification gate tests (IRR side).
 *
 * Authority: the effective GC-D2 §9.4 no-successful-write-identity policy that governs IRR's
 * other write surfaces, and the D05 whole-import identity gate (Gate E W-6 / DP-2 Option 2F).
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
  BROKER_IMPORT_IDENTITY_QUALIFICATION_REFUSAL_REASON,
  BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE,
  evaluateBrokerImportIdentityQualification,
} from './brokerImportIdentityQualification.js';

describe('broker-import identity-qualification gate', () => {
  it('refuses by default: the governed whole-import identity gate is not applied on the reachable commit path', () => {
    // The resting state is fail-closed. A configuration file existing is not evidence that
    // the governed path is reachable, so the switch is false until an operator confirms the
    // wire end to end.
    expect(BROKER_IMPORT_IDENTITY_QUALIFIED_PATH_REACHABLE).toBe(false);
    const decision = evaluateBrokerImportIdentityQualification();
    expect(decision.admitted).toBe(false);
  });

  it('uses an outcome code that is already in the IPD-admitted refusal vocabulary', () => {
    const decision = evaluateBrokerImportIdentityQualification();
    expect(decision.admitted).toBe(false);
    if (decision.admitted) throw new Error('unreachable');
    expect(decision.code).toBe('REFUSED_STORE_GUARD');
  });

  it('names the missing capability without disclosing an internal path, a stack or an identity', () => {
    const decision = evaluateBrokerImportIdentityQualification();
    if (decision.admitted) throw new Error('unreachable');
    expect(decision.reason).toBe(BROKER_IMPORT_IDENTITY_QUALIFICATION_REFUSAL_REASON);
    expect(decision.reason).not.toMatch(/\/src\/|\.ts:|node_modules|companyId|RELIANCE/);
    // The reason states what did not happen: nothing was written and no identity was assigned.
    expect(decision.reason).toMatch(/no broker-observed holding was written/i);
    expect(decision.reason).toMatch(/no identity was assigned/i);
  });

  it('is pure and deterministic: the same decision is reached every time', () => {
    expect(evaluateBrokerImportIdentityQualification()).toEqual(evaluateBrokerImportIdentityQualification());
  });

  it('reads no request, no header, no body and no identity', () => {
    // The evaluator takes no arguments at all, so there is nothing caller-shaped in scope.
    expect(evaluateBrokerImportIdentityQualification.length).toBe(0);
  });
});
