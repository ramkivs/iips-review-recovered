/**
 * DHAN-P2 — health state model tests (W-10: IPD authority only).
 *
 * These qualify the CONSERVATIVE MAPPING: which of the five governed states IRR may report,
 * and — just as importantly — which it may never report without the corresponding authoritative
 * IPD evidence. Since W-10 the authority is IPD's own `/v1/diagnostics` payload; the D-7 §8
 * total mapping from IPD's eight provider states onto these five states is applied verbatim.
 * A legacy fallback path is preserved for the case where the diagnostics read did not produce
 * a usable payload.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket is opened and no
 * vendor endpoint is contacted. The governed vocabularies were measured against the pinned IPD
 * contract at `d80d77345bed965c2a7e660ef272fd53a234d0a7`, not assumed.
 */
import { describe, expect, it } from 'vitest';

import {
  DHAN_HEALTH_DISCLOSURE,
  DHAN_HEALTH_STATES,
  DHAN_PROVIDER_STATE_VALUES,
  buildDhanHealthReport,
  classifyDhanHealth,
  explainDhanHealth,
  formatDhanHealthSummary,
  isGovernedProviderState,
  isLiveConnectedEvidence,
  isLiveQualifiedEvidence,
  projectDhanDiagnosticsView,
  type DhanHealthEvidence,
} from './dhanHealthState';

/** A fully valid IPD diagnostics-derived evidence bundle; overrides tweak individual fields. */
const CONFIGURED_EVIDENCE: DhanHealthEvidence = {
  service: 'UP',
  providerState: 'CONFIGURED',
  providerConfiguration: 'CONFIGURED',
  readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
  credentialResolutionOutcome: 'CONFIGURED_NOT_RESOLVED',
  liveCredentialResolutionSupported: true,
  vaultBackendId: 'WINDOWS_DPAPI',
  vendorEgressMode: 'IPD_SERVER_HTTPS',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  configurationResolved: true,
  connectionAttempted: true,
  transportReachable: true,
  lastSuccessAt: null,
  lastFailureCategory: null,
  lastFailure: null,
  lastAuthOutcome: 'NOT_CHECKED',
  lastLatencyMs: null,
  consecutiveAuthFailures: 0,
  authLatched: false,
  requestCounters: {
    quoteRequests: 3,
    quoteCacheHits: 1,
    historicalRequests: 2,
    verificationProbes: 4,
    vendorRequestsTotal: 9,
    vendorSuccesses: 7,
    providerFailures: 1,
  },
  qualifiedMappingsLoaded: 12,
  quoteCache: { size: 2, capacity: 256, state: 'CURRENT', currentEntries: 2, staleEntries: 0, unavailableEntries: 0 },
};

/** Credential references configured, and a transport connection was ATTEMPTED and failed. */
const CONFIGURED_DISCONNECTED_EVIDENCE: DhanHealthEvidence = {
  service: 'UP',
  providerConfiguration: 'CONFIGURED',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
  configurationResolved: true,
  transportReachable: false,
  connectionAttempted: true,
};

/** Credential references configured, but the transport was NEVER ATTEMPTED. */
const CONFIGURED_NOT_ATTEMPTED_EVIDENCE: DhanHealthEvidence = {
  ...CONFIGURED_DISCONNECTED_EVIDENCE,
  connectionAttempted: false,
};

/** Unconfigured provider, as the legacy (pre-diagnostics) fallback sees it. */
const UNCONFIGURED_FALLBACK_EVIDENCE: DhanHealthEvidence = {
  service: 'UP',
  providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
  configurationResolved: false,
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

  it('declares exactly the eight governed D-7 provider states', () => {
    expect(DHAN_PROVIDER_STATE_VALUES).toEqual([
      'UNCONFIGURED',
      'CONFIGURED',
      'CREDENTIALS_RESOLVED',
      'AUTHENTICATED',
      'OPERATIONAL',
      'EXPIRED',
      'DEGRADED',
      'UNAVAILABLE',
    ]);
    expect(isGovernedProviderState('OPERATIONAL')).toBe(true);
    expect(isGovernedProviderState('MOSTLY_CONFIGURED')).toBe(false);
    expect(isGovernedProviderState(undefined)).toBe(false);
    expect(isGovernedProviderState(null)).toBe(false);
    expect(isGovernedProviderState(4)).toBe(false);
  });
});

describe('DHAN-P2 health state model — the D-7 §8 total mapping (authoritative path)', () => {
  const EXPECTED: ReadonlyArray<[DhanHealthEvidence['providerState'], string]> = [
    ['UNCONFIGURED', 'UNAVAILABLE'],
    ['CONFIGURED', 'PRE_ACCESS'],
    ['CREDENTIALS_RESOLVED', 'PRE_ACCESS'],
    ['AUTHENTICATED', 'AUTHENTICATED'],
    ['OPERATIONAL', 'OPERATIONAL'],
    ['EXPIRED', 'PRE_ACCESS'],
    ['DEGRADED', 'DISCONNECTED'],
    ['UNAVAILABLE', 'UNAVAILABLE'],
  ];

  it.each(EXPECTED)('providerState %s maps to IRR %s', (providerState, expected) => {
    expect(classifyDhanHealth({ ...CONFIGURED_EVIDENCE, providerState })).toBe(expected);
  });

  it('an ungoverned provider state, even via a cast, reports UNAVAILABLE', () => {
    const evidence = { ...CONFIGURED_EVIDENCE, providerState: 'LIVE' } as unknown as DhanHealthEvidence;
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
  });

  it('a DOWN service claiming AUTHENTICATED is self-contradictory and reports UNAVAILABLE', () => {
    expect(
      classifyDhanHealth({ ...CONFIGURED_EVIDENCE, service: 'DOWN', providerState: 'AUTHENTICATED' }),
    ).toBe('UNAVAILABLE');
  });

  it('a DOWN service claiming OPERATIONAL is self-contradictory and reports UNAVAILABLE', () => {
    expect(
      classifyDhanHealth({ ...CONFIGURED_EVIDENCE, service: 'DOWN', providerState: 'OPERATIONAL' }),
    ).toBe('UNAVAILABLE');
  });

  it('a DOWN service with DEGRADED is not contradictory and reports DISCONNECTED', () => {
    expect(
      classifyDhanHealth({ ...CONFIGURED_EVIDENCE, service: 'DOWN', providerState: 'DEGRADED' }),
    ).toBe('DISCONNECTED');
  });

  it('reports AUTHENTICATED from providerState even with NOT_CHECKED axes (IPD earned it)', () => {
    expect(classifyDhanHealth({ ...CONFIGURED_EVIDENCE, providerState: 'AUTHENTICATED' })).toBe('AUTHENTICATED');
  });

  it('reports OPERATIONAL from providerState even with NOT_CHECKED axes (IPD earned it)', () => {
    expect(classifyDhanHealth({ ...CONFIGURED_EVIDENCE, providerState: 'OPERATIONAL' })).toBe('OPERATIONAL');
  });
});

describe('DHAN-P2 health state model — conservative classification (legacy fallback)', () => {
  it('reports PRE_ACCESS when credential references are not configured', () => {
    expect(classifyDhanHealth(UNCONFIGURED_FALLBACK_EVIDENCE)).toBe('PRE_ACCESS');
  });

  it('reports DISCONNECTED when a connection was attempted and failed', () => {
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).toBe('DISCONNECTED');
  });

  it('does NOT report DISCONNECTED when no connection was ever attempted', () => {
    const state = classifyDhanHealth(CONFIGURED_NOT_ATTEMPTED_EVIDENCE);
    expect(state).not.toBe('DISCONNECTED');
    // Configured but never attempted: pre-access posture, not a lost connection.
    expect(state).toBe('PRE_ACCESS');
  });

  it('reports UNAVAILABLE when nothing can be established', () => {
    expect(classifyDhanHealth({})).toBe('UNAVAILABLE');
    expect(classifyDhanHealth({ service: 'UP' })).toBe('UNAVAILABLE');
  });

  it('reports UNAVAILABLE when the evidence contradicts itself', () => {
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

  it('never claims AUTHENTICATED or OPERATIONAL from the pre-access provider values alone', () => {
    expect(isLiveConnectedEvidence(UNCONFIGURED_FALLBACK_EVIDENCE)).toBe(false);
    expect(isLiveQualifiedEvidence(UNCONFIGURED_FALLBACK_EVIDENCE)).toBe(false);
    expect(classifyDhanHealth(UNCONFIGURED_FALLBACK_EVIDENCE)).not.toBe('AUTHENTICATED');
    expect(classifyDhanHealth(UNCONFIGURED_FALLBACK_EVIDENCE)).not.toBe('OPERATIONAL');
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).not.toBe('AUTHENTICATED');
    expect(classifyDhanHealth(CONFIGURED_DISCONNECTED_EVIDENCE)).not.toBe('OPERATIONAL');
  });

  it('reports AUTHENTICATED only from an explicit live connectivity signal', () => {
    expect(
      classifyDhanHealth({
        ...CONFIGURED_DISCONNECTED_EVIDENCE,
        liveProviderConnectivity: 'CONNECTED_LIVE',
        transportReachable: true,
      }),
    ).toBe('AUTHENTICATED');
  });

  it('reports OPERATIONAL only from an explicit live connectivity AND qualification signal', () => {
    expect(
      classifyDhanHealth({
        ...CONFIGURED_DISCONNECTED_EVIDENCE,
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
        transportReachable: true,
      }),
    ).toBe('OPERATIONAL');
  });

  it('does not report OPERATIONAL when only the qualification is live', () => {
    expect(
      classifyDhanHealth({
        ...CONFIGURED_DISCONNECTED_EVIDENCE,
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: 'LIVE_QUALIFIED',
        transportReachable: true,
      }),
    ).not.toBe('OPERATIONAL');
  });
});

describe('DHAN-P2 health state model — reasons and summary', () => {
  it('states what was NOT established for every non-live state', () => {
    const preAccess = explainDhanHealth('PRE_ACCESS', {
      ...UNCONFIGURED_FALLBACK_EVIDENCE,
      connectionAttempted: false,
    });
    expect(preAccess.join(' ')).toContain('No local IPD transport connection was attempted');
    expect(preAccess.join(' ')).toContain('no Dhan endpoint was contacted');

    const degraded = explainDhanHealth('DISCONNECTED', {
      ...CONFIGURED_EVIDENCE,
      providerState: 'DEGRADED',
      lastFailureCategory: 'AUTHENTICATION_FAILURE',
      authLatched: true,
    });
    expect(degraded.join(' ')).toContain("'DEGRADED'");
    expect(degraded.join(' ')).toContain('AUTHENTICATION_FAILURE');
    expect(degraded.join(' ')).toContain('latch');

    const unavailable = explainDhanHealth('UNAVAILABLE', {});
    expect(unavailable.join(' ')).toContain('could not be read');
    expect(unavailable.join(' ')).toContain('No live provider capability is claimed.');
  });

  it('does not claim live behaviour in the pre-access reasons', () => {
    const reasons = explainDhanHealth('PRE_ACCESS', UNCONFIGURED_FALLBACK_EVIDENCE).join(' ');
    expect(reasons).not.toContain('live connectivity was established');
    expect(reasons).not.toContain('credentials were accepted');
  });

  it('produces a summary that never leaks a secret or a vendor identifier', () => {
    const report = buildDhanHealthReport(CONFIGURED_EVIDENCE);
    const summary = formatDhanHealthSummary(report);
    expect(summary).toContain('PRE_ACCESS');
    expect(summary).toContain('not live-qualified');
    expect(summary).not.toMatch(/vault:\/\//);
  });
});

describe('DHAN-P2 health report', () => {
  it('carries the phase disclosure and the pre-access honesty flags', () => {
    const report = buildDhanHealthReport(CONFIGURED_EVIDENCE);
    expect(report.state).toBe('PRE_ACCESS');
    expect(report.disclosure).toBe(DHAN_HEALTH_DISCLOSURE);
    expect(report.disclosure).toContain('NOT live-qualified');
    expect(report.liveProviderContacted).toBe(false);
    expect(report.liveQualified).toBe(false);
    expect(report.transportReachable).toBe(true);
    expect(report.connectionAttempted).toBe(true);
  });

  it('echoes the enumerated diagnostics view verbatim', () => {
    const report = buildDhanHealthReport(CONFIGURED_EVIDENCE);
    expect(report.providerState).toBe('CONFIGURED');
    expect(report.service).toBe('UP');
    expect(report.providerConfiguration).toBe('CONFIGURED');
    expect(report.readiness).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
    expect(report.credentialResolutionOutcome).toBe('CONFIGURED_NOT_RESOLVED');
    expect(report.liveCredentialResolutionSupported).toBe(true);
    expect(report.vaultBackendId).toBe('WINDOWS_DPAPI');
    expect(report.vendorEgressMode).toBe('IPD_SERVER_HTTPS');
    expect(report.liveProviderConnectivity).toBe('NOT_CHECKED_PRE_ACCESS');
    expect(report.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    expect(report.configurationResolved).toBe(true);
    expect(report.lastAuthOutcome).toBe('NOT_CHECKED');
    expect(report.consecutiveAuthFailures).toBe(0);
    expect(report.authLatched).toBe(false);
    expect(report.requestCounters).toMatchObject({ verificationProbes: 4, vendorRequestsTotal: 9 });
    expect(report.qualifiedMappingsLoaded).toBe(12);
    expect(report.quoteCache).toMatchObject({ size: 2, state: 'CURRENT' });
  });

  it('carries NO pointer, path, failure message or key-name field of any kind', () => {
    const report = buildDhanHealthReport(CONFIGURED_EVIDENCE);
    const serialized = JSON.stringify(report);
    expect(Object.keys(report)).not.toEqual(expect.arrayContaining(['secretRefPointers']));
    expect(Object.keys(report)).not.toEqual(expect.arrayContaining(['failureCode']));
    expect(Object.keys(report)).not.toEqual(expect.arrayContaining(['missingKeys']));
    expect(serialized).not.toMatch(/vault:\/\//i);
    expect(serialized).not.toMatch(/secretRefPointers/i);
    expect(serialized).not.toMatch(/accessTokenKeyPath/i);
    expect(serialized).not.toMatch(/clientIdKeyPath/i);
    expect(serialized).not.toMatch(/IIPS_DHAN_/);
    // No credential-bearing field may appear on the report.
    expect(Object.keys(report)).not.toEqual(
      expect.arrayContaining(['accessToken', 'clientId', 'token', 'password', 'secretValue']),
    );
  });

  it('reports no request counters or cache when the diagnostics payload was unreadable', () => {
    const report = buildDhanHealthReport({});
    expect(report.providerState).toBeNull();
    expect(report.requestCounters).toBeNull();
    expect(report.quoteCache).toBeNull();
    expect(report.qualifiedMappingsLoaded).toBeNull();
    expect(report.readiness).toBe('UNKNOWN');
    expect(report.liveProviderConnectivity).toBe('UNKNOWN');
    expect(report.providerQualification).toBe('UNKNOWN');
  });

  it('never marks a pre-access report as live qualified', () => {
    const report = buildDhanHealthReport(CONFIGURED_EVIDENCE);
    expect(report.liveQualified).toBe(false);
    expect(report.liveProviderContacted).toBe(false);
  });

  it('round-trips an OPERATIONAL report without claiming IRR contacted a vendor', () => {
    const report = buildDhanHealthReport({
      ...CONFIGURED_EVIDENCE,
      providerState: 'OPERATIONAL',
      liveProviderConnectivity: 'CONNECTED_LIVE',
      providerQualification: 'LIVE_QUALIFIED',
      liveCredentialResolutionSupported: true,
      lastSuccessAt: '2026-11-16T00:00:00.000Z',
    });
    expect(report.state).toBe('OPERATIONAL');
    expect(report.liveQualified).toBe(true);
    // Classification is a pure report of IPD evidence: it performs no vendor contact itself.
    expect(report.liveProviderContacted).toBe(false);
  });
});

describe('DHAN-P2 diagnostics view projection', () => {
  it('projects null providerState when the evidence carries an ungoverned one', () => {
    const view = projectDhanDiagnosticsView({ ...CONFIGURED_EVIDENCE, providerState: 'LIVE' as never });
    expect(view.providerState).toBeNull();
  });

  it('projects null service when the evidence carries an ungoverned one', () => {
    const view = projectDhanDiagnosticsView({ ...CONFIGURED_EVIDENCE, service: 'DEGRADED' as never });
    expect(view.service).toBeNull();
  });

  it('projects null providerConfiguration when the evidence carries an ungoverned one', () => {
    const view = projectDhanDiagnosticsView({ ...CONFIGURED_EVIDENCE, providerConfiguration: 'MAYBE' as never });
    expect(view.providerConfiguration).toBeNull();
  });
});

describe('W-07 governed vocabulary — the classifier cannot accept arbitrary strings', () => {
  it('reports UNAVAILABLE for an ungoverned connectivity string, even via a cast', () => {
    const evidence = {
      ...CONFIGURED_DISCONNECTED_EVIDENCE,
      liveProviderConnectivity: 'CONNECTED_LIVEISH',
    } as unknown as DhanHealthEvidence;
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
    expect(isLiveConnectedEvidence(evidence)).toBe(false);
  });

  it('reports UNAVAILABLE for an ungoverned qualification string, even via a cast', () => {
    const evidence = {
      ...CONFIGURED_DISCONNECTED_EVIDENCE,
      providerQualification: 'LIVE_QUALIFIEDISH',
    } as unknown as DhanHealthEvidence;
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
    expect(isLiveQualifiedEvidence(evidence)).toBe(false);
  });

  it('reports UNAVAILABLE when the transport boundary flagged a contract violation', () => {
    const report = buildDhanHealthReport({
      ...CONFIGURED_EVIDENCE,
      healthContractViolation: true,
    });
    expect(report.state).toBe('UNAVAILABLE');
    expect(report.liveQualified).toBe(false);
  });
});
