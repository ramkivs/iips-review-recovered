/**
 * CAP-02 browser HTTP client tests.
 *
 * Authority: `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.4 and
 * `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2.3 —
 * raw-observation projection (canonical/lineage/derived fields never serialized), explicit
 * sourceBroker→broker mapping with contradictory-claim refusal, mandatory revision, digest
 * forwarding, one request with zero retries, and the U7 receipt/refusal/unknown outcome mapping.
 */
import { describe, it, expect } from 'vitest';
import {
  projectIngressToBrokerImportSaveRequest,
  saveBrokerImportHoldings,
  type BrokerImportSaveRequestDto,
  type UiIngressHoldingInput,
} from './brokerImport';

const DIGEST = 'e'.repeat(64);

/** UI-shaped holdings exactly as the IPD ingress produces them (canonical fields included). */
function uiHoldings(): UiIngressHoldingInput[] {
  return [
    {
      symbol: 'RELIANCE',
      companyId: 'CMP-RELIANCE',          // canonical preview field — must NEVER be serialized
      identityStatus: 'RESOLVED',          // canonical preview field — must NEVER be serialized
      resolutionDisposition: 'CANONICAL_P04',
      isin: 'INE002A01018',
      exchange: 'NSE',
      quantity: 10,
      averageBuyPrice: 2400.5,
      currentPrice: 2500.25,
      marketValue: 25002.5,
      weightPercentage: 42.5,             // derived — not broker-observed; never serialized
      active: true,                        // UI lifecycle flag; never serialized
      sourceBroker: 'ZERODHA',
      lineageDigest: 'deadbeef',           // IPD-owned lineage; never asserted by IRR
    },
  ];
}

function validProjection() {
  return projectIngressToBrokerImportSaveRequest({
    holdings: uiHoldings(),
    mode: 'MERGE',
    expectedRevision: 3,
    sourceBroker: 'ZERODHA',
    contentDigest: DIGEST,
  });
}

describe('brokerImport client — raw-observation projection (U1 §2.3)', () => {
  it('selects only broker-observed fields; canonical, lineage and derived fields never serialize', () => {
    const result = validProjection();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dto.holdings).toHaveLength(1);
    const serialized = JSON.stringify(result.dto);
    expect(Object.keys(result.dto.holdings[0]).sort()).toEqual(
      ['averageBuyPrice', 'currentPrice', 'exchange', 'isin', 'marketValue', 'quantity', 'symbol'].sort(),
    );
    for (const forbidden of ['companyId', 'identityStatus', 'resolutionDisposition', 'lineageDigest', 'weightPercentage', 'active', 'CANONICAL_P04', 'CMP-RELIANCE', 'deadbeef']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('projects the file-level sourceBroker to the top-level broker field by explicit mapping', () => {
    const result = validProjection();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dto.broker).toBe('ZERODHA');
    expect(JSON.stringify(result.dto)).not.toContain('sourceBroker');
  });

  it('refuses contradictory broker claims rather than reconciling them', () => {
    const holdings = uiHoldings();
    holdings[0] = { ...holdings[0], sourceBroker: 'DHAN' };
    const result = projectIngressToBrokerImportSaveRequest({
      holdings: holdings,
      mode: 'MERGE',
      expectedRevision: 3,
      sourceBroker: 'ZERODHA',
      contentDigest: DIGEST,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('contradictory-broker-claims');
  });

  it('refuses a missing/invalid revision, mode, holdings and digest (never defaults them)', () => {
    const base = { holdings: uiHoldings(), mode: 'MERGE' as const, sourceBroker: 'ZERODHA', contentDigest: DIGEST };
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: undefined as unknown as number }).ok).toBe(false);
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: -1 }).ok).toBe(false);
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: 1.5 }).ok).toBe(false);
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: 2, mode: 'UPSERT' as never }).ok).toBe(false);
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: 2, holdings: [] }).ok).toBe(false);
    expect(projectIngressToBrokerImportSaveRequest({ ...base, expectedRevision: 2, contentDigest: 'zz' }).ok).toBe(false);
  });

  it('forwards the ingress digest verbatim and omits optional keys when absent', () => {
    const result = projectIngressToBrokerImportSaveRequest({
      holdings: [{ symbol: 'TCS', quantity: 5, averageBuyPrice: 100, currentPrice: 110, marketValue: 550 }],
      mode: 'REPLACE',
      expectedRevision: 0,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dto.contentDigest).toBeUndefined();
    expect(result.dto.broker).toBeUndefined();
    expect(Object.keys(result.dto).sort()).toEqual(['expectedRevision', 'holdings', 'mode']);
  });
});

describe('brokerImport client — one request, zero retries, honest outcomes (U7)', () => {
  const dto: BrokerImportSaveRequestDto = {
    expectedRevision: 3,
    mode: 'MERGE',
    holdings: [{ symbol: 'RELIANCE', quantity: 10 }],
    contentDigest: DIGEST,
    broker: 'ZERODHA',
  };

  function fetchStub(status: number, body: unknown, log: Array<{ url: string; init: RequestInit }>): typeof fetch {
    return (async (url: unknown, init?: RequestInit) => {
      log.push({ url: String(url), init: init ?? ({} as RequestInit) });
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    }) as unknown as typeof fetch;
  }

  it('POSTs the DTO once to the relative CAP-02 route and relays the receipt', async () => {
    const log: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl = fetchStub(200, { disposition: 'ALREADY_IMPORTED_NO_OP', revision: 3, durability: 'SESSION_ONLY', durable: false }, log);
    const outcome = await saveBrokerImportHoldings('DEFAULT_PORTFOLIO', dto, fetchImpl);
    expect(log).toHaveLength(1);
    expect(log[0].url).toBe('/api/broker-import/DEFAULT_PORTFOLIO/holdings');
    expect(log[0].init.method).toBe('POST');
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.receipt.disposition).toBe('ALREADY_IMPORTED_NO_OP');
      expect(outcome.receipt.revision).toBe(3);
      expect(outcome.receipt.durability).toBe('SESSION_ONLY');
      expect(outcome.receipt.durable).toBe(false);
    }
  });

  it('maps W-1 refusal, conflict and unavailability to typed non-success outcomes', async () => {
    const cases: ReadonlyArray<[number, unknown, string]> = [
      [503, { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' }, 'WRITE_NOT_AUTHORIZED'],
      [409, { outcome: 'REVISION_CONFLICT' }, 'REVISION_CONFLICT'],
      [404, { outcome: 'RESOURCE_UNAVAILABLE' }, 'RESOURCE_UNAVAILABLE'],
      [422, { outcome: 'REFUSED_UNRESOLVED_IDENTITY' }, 'REFUSED_UNRESOLVED_IDENTITY'],
    ];
    for (const [status, body, expected] of cases) {
      const outcome = await saveBrokerImportHoldings('P-1', dto, fetchStub(status, body, []));
      expect(outcome.ok, expected).toBe(false);
      if (!outcome.ok && outcome.status !== 0) expect(outcome.outcome).toBe(expected);
    }
  });

  it('maps the 503 owner-context-unavailable fence body distinctly', async () => {
    const outcome = await saveBrokerImportHoldings('P-1', dto, fetchStub(503, { error: 'owner-context-unavailable', detail: { reason: 'No non-authentication ownership source has been established.' } }, []));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.outcome).toBe('OWNER_CONTEXT_UNAVAILABLE');
  });

  it('treats a network failure as OUTCOME_UNKNOWN and never retries', async () => {
    let calls = 0;
    const failing = (async () => {
      calls += 1;
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const outcome = await saveBrokerImportHoldings('P-1', dto, failing);
    expect(calls).toBe(1);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.status).toBe(0);
      expect(outcome.outcome).toBe('OUTCOME_UNKNOWN');
    } else {
      throw new Error('expected network-failure outcome');
    }
  });

  it('treats a 200 whose body is not the minimal receipt as unrepresentable, never success', async () => {
    const legacy = { success: true, portfolio: {}, savedAt: '2026-10-23T00:00:00Z', holdingsSavedCount: 5 };
    const outcome = await saveBrokerImportHoldings('P-1', dto, fetchStub(200, legacy, []));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.outcome).toBe('OUTCOME_UNKNOWN');
  });

  it('refuses to send a DTO carrying an authority or canonical-identity key (pre-send guard)', async () => {
    const smuggled = {
      ...dto,
      holdings: [{ symbol: 'X', companyId: 'CMP-1' }],
    } as unknown as BrokerImportSaveRequestDto;
    const log: Array<{ url: string; init: RequestInit }> = [];
    const outcome = await saveBrokerImportHoldings('P-1', smuggled, fetchStub(200, {}, log));
    expect(log).toHaveLength(0);
    expect(outcome.ok).toBe(false);
  });
});
