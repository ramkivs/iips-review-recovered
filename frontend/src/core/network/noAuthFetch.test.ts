/** The first-party fetch boundary never carries browser or bearer credentials. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { noAuthFetch } from './noAuthFetch';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('noAuthFetch', () => {
  it('omits cookies and strips a caller-supplied Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await noAuthFetch('/api/example', {
      credentials: 'include',
      headers: {
        Authorization: 'Bearer must-not-be-sent',
        'X-Request-Id': 'request-1',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('omit');
    const headers = new Headers(init.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(headers.get('x-request-id')).toBe('request-1');
  });

  it('strips Authorization inherited from a Request input', async () => {
    if (typeof Request === 'undefined') return;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const input = new Request('https://example.test/api/example', {
      headers: { Authorization: 'Bearer inherited-must-not-be-sent' },
      credentials: 'include',
    });

    await noAuthFetch(input);

    const [receivedInput, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    expect(receivedInput).toBe(input);
    expect(init.credentials).toBe('omit');
    expect(new Headers(init.headers).has('authorization')).toBe(false);
  });
});
