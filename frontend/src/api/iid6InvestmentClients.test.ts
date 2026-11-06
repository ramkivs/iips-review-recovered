/**
 * IID-6 — the two read clients the surface adds (`investmentDisposition`, `investmentChanges`).
 *
 * These are thin clients, so the tests are about the contract they refuse to break:
 *
 *   • every call is a GET, with no body and no write verb (AC-6.1);
 *   • a not-found, an invalid request, an integrity failure and a persistence outage map onto DISTINCT reasons, so
 *     the view can say which happened;
 *   • an unrecognised payload is refused rather than cast, because a half-populated disposition panel is
 *     indistinguishable from an honestly withheld value;
 *   • the change client refuses a comparison list that is not a list, and never fabricates an empty history.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DISPOSITION_UNAVAILABLE_COPY,
  DispositionUnavailableError,
  fetchCandidateDisposition,
  fetchHeldDisposition,
  fetchPortfolioDispositions,
} from './investmentDisposition';
import {
  CHANGE_UNAVAILABLE_COPY,
  ChangeUnavailableError,
  fetchChangeBoundaries,
  fetchCompanyChanges,
} from './investmentChanges';
import {
  BOUNDARIES_ENVELOPE,
  CANDIDATE_DISPOSITION_ENVELOPE,
  CHANGES_ENVELOPE,
  DISPOSITION_ENVELOPE,
  PORTFOLIO,
  SECURITY,
} from '../features/investment/iid6Fixtures';

type Call = { url: string; init: RequestInit | undefined };

function stub(handler: (url: string) => Response) {
  const calls: Call[] = [];
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return handler(String(url));
  });
  vi.stubGlobal('fetch', mock);
  return calls;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the disposition client reads, and only reads', () => {
  it('reads one held chain by portfolio and security', async () => {
    const calls = stub(() => json(DISPOSITION_ENVELOPE));
    const envelope = await fetchHeldDisposition(PORTFOLIO, SECURITY);

    expect(envelope.disposition.disposition.verb).toBe('AVOID');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      `/api/investment/portfolio/${encodeURIComponent(PORTFOLIO)}/holding/${encodeURIComponent(SECURITY)}`,
    );
    expect(calls[0]?.init?.method).toBe('GET');
    expect(calls[0]?.init?.body).toBeUndefined();
  });

  it('reads a candidate without a portfolio, and with one when context is supplied', async () => {
    const calls = stub(() => json(CANDIDATE_DISPOSITION_ENVELOPE));

    await fetchCandidateDisposition(SECURITY);
    await fetchCandidateDisposition(SECURITY, PORTFOLIO);

    expect(calls[0]?.url).toBe(`/api/investment/candidate/${encodeURIComponent(SECURITY)}`);
    expect(calls[1]?.url).toBe(
      `/api/investment/candidate/${encodeURIComponent(SECURITY)}?portfolio=${encodeURIComponent(PORTFOLIO)}`,
    );
    for (const call of calls) expect(call.init?.method).toBe('GET');
  });

  it('reads the portfolio list, and distinguishes an empty list from a failure', async () => {
    stub(() => json({ status: 'OK', portfolioId: PORTFOLIO, count: 0, dispositions: [], limitations: [] }));
    const list = await fetchPortfolioDispositions(PORTFOLIO);
    expect(list.count).toBe(0);
    expect(list.dispositions).toHaveLength(0);

    stub(() => new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 }));
    await expect(fetchPortfolioDispositions(PORTFOLIO)).rejects.toBeInstanceOf(DispositionUnavailableError);
  });

  it.each([
    ['disposition-not-found', 404, 'not-recorded'],
    ['disposition-request-invalid', 400, 'request-invalid'],
    ['disposition-integrity-failure', 503, 'integrity-failure'],
    ['investment-persistence-unavailable', 503, 'persistence-unavailable'],
    ['owner-context-unavailable', 503, 'owner-context-unavailable'],
  ])('maps %s onto the %s reason', async (code, status, reason) => {
    stub(() => json({ error: code }, status));
    const error = await fetchHeldDisposition(PORTFOLIO, SECURITY).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DispositionUnavailableError);
    expect((error as DispositionUnavailableError).reason).toBe(reason);
    // The copy the view renders is fixed and sanitized, never the server body.
    expect((error as Error).message).toBe(DISPOSITION_UNAVAILABLE_COPY[reason as keyof typeof DISPOSITION_UNAVAILABLE_COPY]);
  });

  it('refuses an envelope that is missing the blocks the panel renders', async () => {
    stub(() => json({ status: 'OK', scope: {}, version: {}, versions: [], disposition: { subject: {} } }));
    await expect(fetchHeldDisposition(PORTFOLIO, SECURITY)).rejects.toMatchObject({ reason: 'unrecognised' });
  });

  it('refuses a non-JSON body rather than rendering an empty panel', async () => {
    stub(() => new Response('<html>gateway timeout</html>', { status: 200 }));
    await expect(fetchCandidateDisposition(SECURITY)).rejects.toMatchObject({ reason: 'unrecognised' });
  });
});

describe('the change client reads, and only reads', () => {
  it('reads the comparisons for an issuer by GET', async () => {
    const calls = stub(() => json(CHANGES_ENVELOPE));
    const envelope = await fetchCompanyChanges('IN:EQISIN:IN0000000201');

    expect(envelope.comparisons).toHaveLength(1);
    expect(calls[0]?.url).toContain('/api/investment/company/');
    expect(calls[0]?.init?.method).toBe('GET');
  });

  it('reads boundary coverage by GET and keeps the unexplained pairs visible', async () => {
    const calls = stub(() => json(BOUNDARIES_ENVELOPE));
    const envelope = await fetchChangeBoundaries('IN:EQISIN:IN0000000201');

    expect(envelope.coverage.complete).toBe(false);
    expect(envelope.coverage.unexplainedPairs).toHaveLength(1);
    expect(calls[0]?.url).toContain('/changes/boundaries');
    expect(calls[0]?.init?.method).toBe('GET');
  });

  it.each([
    ['change-not-found', 404, 'no-history'],
    ['change-request-invalid', 400, 'request-invalid'],
    ['change-integrity-failure', 503, 'integrity-failure'],
    ['investment-persistence-unavailable', 503, 'persistence-unavailable'],
  ])('maps %s onto the %s reason', async (code, status, reason) => {
    stub(() => json({ error: code }, status));
    const error = await fetchCompanyChanges('IN:EQISIN:IN0000000201').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ChangeUnavailableError);
    expect((error as ChangeUnavailableError).reason).toBe(reason);
    expect((error as Error).message).toBe(CHANGE_UNAVAILABLE_COPY[reason as keyof typeof CHANGE_UNAVAILABLE_COPY]);
  });

  it('refuses a comparison list that is not a list', async () => {
    stub(() => json({ status: 'OK', comparisons: 'nope' }));
    await expect(fetchCompanyChanges('IN:EQISIN:IN0000000201')).rejects.toMatchObject({ reason: 'unrecognised' });
  });

  it('refuses boundary coverage without its coverage block', async () => {
    stub(() => json({ status: 'OK', boundaries: [] }));
    await expect(fetchChangeBoundaries('IN:EQISIN:IN0000000201')).rejects.toMatchObject({ reason: 'unrecognised' });
  });

  it('never calls a reconcile or write route', async () => {
    const calls = stub((url) => (url.includes('/boundaries') ? json(BOUNDARIES_ENVELOPE) : json(CHANGES_ENVELOPE)));
    await fetchCompanyChanges('IN:EQISIN:IN0000000201');
    await fetchChangeBoundaries('IN:EQISIN:IN0000000201');

    for (const call of calls) {
      expect(call.init?.method ?? 'GET').toBe('GET');
      expect(call.url).not.toMatch(/reconcile|record|generate|append|write/i);
    }
  });
});
