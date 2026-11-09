/**
 * DHAN-P2 — health state model tests.
 *
 * These qualify the CONSERVATIVE MAPPING: which of the five governed states IRR may report,
 * and — just as importantly — which it may never report without the corresponding authoritative
 * IPD evidence.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket is opened and no
 * vendor endpoint is contacted. Every expected value below was measured against the pinned
 * IPD contract at `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`, not assumed.
 */
import { describe, expect, it } from 'vitest';

import {
  DHAN_HEALTH_DISCLOSURE,
  DHAN_HEALTH_STATES,
  buildDhanHealthReport,
  classifyDhanHealth,
  explainDhanHealth,
  formatDhanHealthSummary,
  isLiveConnectedEvidence,
  isLiveQualifiedEvidence,
  type DhanHealthEvidence,
} from './dhanHealthState';

/** The provider's authoritative pre-access health payload, as IPD reports it. */
const PRE_ACCESS_EVIDENCE: DhanHealthEvidence = {
  service: 'UP',
  providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
  failureCode: 'CREDENTIALS_UNAVAILABLE',
  configurationResolved: false,
  missingKeys: ['IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH', 'IIPS_DHAN_CLIENT_ID_SECRET_PATH'],
  transportReachable: false,
};

/** Credential references configured, but the local transport did not answer. */
const CONFIGURED_DISCONNECTED_EVIDENCE: DhanHealthEvidence = {
  service: 'UP',
  providerConfiguration: 'CONFIGURED',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
  failureCode: null,
  configurationResolved: true,
  missingKeys: [],
  transportReachable: false,
};

describe('DHAN-P2 health state model — the five governed states', () => {
  it('declares exactly the five governed states', () => {
    expect(DHAN_HEALTH_STATES).toEqual([
      'UNAVAILABLE',
      'PRE_ACCESS',
      'DISCONNECTED',
      'AUTHENTICATED',
      'OPERATIONAL',
    ]);
  });
});

describe('DHAN-P2 health state model — conservative classification', () => {
  it('reports PRE_ACCESS when credential references are not configured', () => {
    expect(classifyDhanHealth(PRE_ACCESS_EVIDENCE)).toBe('PRE_ACCESS');
  });

  it('reports PRE_ACCESS when only the provider configuration says so', () => {
    // The readiness enum and the providerConfiguration enum are DIFFERENT enums with
    // overlapping literals; either one alone is enough to establish pre-access.
    expect(
      classifyDhanHealth({
        service: 'UP',
        providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      }),
    ).toBe('PRE_ACCESS');
  });

  it('reports DISCONNECTED when the provider is configured but the transport did not answer', () => {
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).toBe('DISCONNECTED');
  });

  it('reports UNAVAILABLE when nothing can be established', () => {
    expect(classifyDhanHealth({})).toBe('UNAVAILABLE');
    expect(classifyDhanHealth({ service: 'UP' })).toBe('UNAVAILABLE');
  });

  it('reports UNAVAILABLE when the evidence contradicts itself', () => {
    // A service that reports itself DOWN while also claiming live connectivity is
    // self-contradictory: nothing may be established from it.
    expect(
      classifyDhanHealth({
        service: 'DOWN',
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
        configurationResolved: true,
        transportReachable: false,
      }),
    ).toBe('UNAVAILABLE');
  });

  it('never claims AUTHENTICATED or OPERATIONAL from the pre-access provider values', () => {
    // The provider's authoritative pre-access values must not, on their own, earn a live claim.
    expect(isLiveConnectedEvidence(PRE_ACCESS_EVIDENCE)).toBe(false);
    expect(isLiveQualifiedEvidence(PRE_ACCESS_EVIDENCE)).toBe(false);
    expect(classifyDhanHealth(PRE_ACCESS_EVIDENCE)).not.toBe('AUTHENTICATED');
    expect(classifyDhanHealth(PRE_ACCESS_EVIDENCE)).not.toBe('OPERATIONAL');
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).not.toBe('AUTHENTICATED');
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).not.toBe('OPERATIONAL');
  });

  it('never claims AUTHENTICATED or OPERATIONAL merely because configuration resolved', () => {
    // A resolved configuration is a CONFIGURATION fact. It is not authentication and it is
    // not operational qualification.
    const configured = classifyDhanHealth({
      ...CONFIGURED_DISCONNECTED_EVIDENCE,
      transportReachable: true,
    });
    expect(configured).not.toBe('AUTHENTICATED');
    expect(configured).not.toBe('OPERATIONAL');
  });

  it('reports AUTHENTICATED only from an explicit live connectivity signal', () => {
    expect(
      classifyDhanHealth({
        service: 'UP',
        providerConfiguration: 'CONFIGURED',
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
        configurationResolved: true,
        transportReachable: true,
      }),
    ).toBe('AUTHENTICATED');
  });

  it('reports OPERATIONAL only from an explicit live connectivity AND qualification signal', () => {
    expect(
      classifyDhanHealth({
        service: 'UP',
        providerConfiguration: 'CONFIGURED',
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
        readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
        configurationResolved: true,
        transportReachable: true,
      }),
    ).toBe('OPERATIONAL');
  });

  it('does not report OPERATIONAL when only the qualification is live', () => {
    // Both signals are required: a live qualification without live connectivity is not
    // operational.
    expect(
      classifyDhanHealth({
        service: 'UP',
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: 'LIVE_QUALIFIED',
        configurationResolved: true,
        transportReachable: true,
      }),
    ).not.toBe('OPERATIONAL');
  });
});

describe('DHAN-P2 health state model — reasons and summary', () => {
  it('states what was NOT established for every non-live state', () => {
    const preAccess = explainDhanHealth('PRE_ACCESS', PRE_ACCESS_EVIDENCE);
    expect(preAccess.join(' ')).toContain('No credential was resolved');
    expect(preAccess.join(' ')).toContain('no Dhan endpoint was contacted');

    const disconnected = explainDhanHealth('DISCONNECTED', CONFIGURED_DISCONNECTED_EVIDENCE);
    expect(disconnected.join(' ')).toContain('did not answer');

    const unavailable = explainDhanHealth('UNAVAILABLE', { failureCode: 'TRANSPORT_FAILURE' });
    expect(unavailable.join(' ')).toContain('TRANSPORT_FAILURE');
    expect(unavailable.join(' ')).toContain('No provider state');
  });

  it('does not claim live behaviour in the pre-access reasons', () => {
    const reasons = explainDhanHealth('PRE_ACCESS', PRE_ACCESS_EVIDENCE).join(' ');
    expect(reasons).not.toContain('live connectivity was established');
    expect(reasons).not.toContain('credentials were accepted');
  });

  it('produces a summary that never leaks a secret or a vendor identifier', () => {
    const report = buildDhanHealthReport(PRE_ACCESS_EVIDENCE, ['vault://dhan/access-token']);
    const summary = formatDhanHealthSummary(report);
    expect(summary).toContain('PRE_ACCESS');
    expect(summary).toContain('not live-qualified');
    expect(summary).not.toMatch(/vault:\/\//);
  });
});

describe('DHAN-P2 health report', () => {
  it('carries the phase disclosure and the pre-access honesty flags', () => {
    const report = buildDhanHealthReport(PRE_ACCESS_EVIDENCE);
    expect(report.state).toBe('PRE_ACCESS');
    expect(report.disclosure).toBe(DHAN_HEALTH_DISCLOSURE);
    expect(report.disclosure).toContain('NOT live-qualified');
    expect(report.liveProviderContacted).toBe(false);
    expect(report.liveQualified).toBe(false);
    expect(report.transportReachable).toBe(false);
  });

  it('echoes the observed readiness, failure code and missing keys', () => {
    const report = buildDhanHealthReport(PRE_ACCESS_EVIDENCE);
    expect(report.readiness).toBe('PRE_ACCESS_CREDENTIALS_UNAVAILABLE');
    expect(report.failureCode).toBe('CREDENTIALS_UNAVAILABLE');
    expect(report.missingKeys).toEqual([
      'IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH',
      'IIPS_DHAN_CLIENT_ID_SECRET_PATH',
    ]);
    expect(report.configurationResolved).toBe(false);
  });

  it('publishes SecretRef POINTERS only, and never a credential value', () => {
    const report = buildDhanHealthReport(CONFIGURED_DISCONNECTED_EVIDENCE, [
      'vault://dhan/access-token',
      'vault://dhan/client-id',
    ]);
    const serialized = JSON.stringify(report);
    expect(serialized).toContain('vault://dhan/access-token');
    expect(report.secretRefPointers).toHaveLength(2);
    // No credential-bearing field may appear on the report.
    expect(Object.keys(report)).not.toContain('accessToken');
    expect(Object.keys(report)).not.toContain('clientId');
    expect(Object.keys(report)).not.toContain('token');
    expect(Object.keys(report)).not.toContain('password');
    expect(Object.keys(report)).not.toContain('secretValue');
  });

  it('reports no missing keys when the configuration resolved', () => {
    const report = buildDhanHealthReport(CONFIGURED_DISCONNECTED_EVIDENCE);
    expect(report.missingKeys).toEqual([]);
    expect(report.configurationResolved).toBe(true);
    expect(report.state).toBe('DISCONNECTED');
  });

  it('never marks a pre-access report as live qualified', () => {
    const report = buildDhanHealthReport(PRE_ACCESS_EVIDENCE);
    expect(report.liveQualified).toBe(false);
    expect(report.liveProviderContacted).toBe(false);
  });
});
