/**
 * UI07 client — error diagnostics on the add path.
 *
 * The transport now answers a refused membership with `{error, detail.reason}` — the authored
 * explanation of WHICH universe refused and why. The client surfaces that reason verbatim
 * (bounded, control-free) instead of a bare status line.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { addWatchlistItem } from './watchlists';

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response) as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('addWatchlistItem — governed-row-not-found diagnostics', () => {
  it('surfaces the server-authored reason instead of a bare status line', async () => {
    mockFetch(404, {
      error: 'governed-row-not-found',
      detail: {
        reason:
          "Not a member of the governed reference universe served by this host (certified-v2.0-reference-universe; sector reference identifiers such as 'Technology').",
      },
    });
    const error = (await addWatchlistItem('wl-1', 'TCS').catch((e: unknown) => e)) as Error;
    expect(error.message).toContain('404 (governed-row-not-found)');
    expect(error.message).toContain('certified-v2.0-reference-universe');
    expect(error.message).not.toContain('TCS is a'); // no interpretation invented by the client
  });

  it('falls back to the bare status line when the envelope carries no reason', async () => {
    mockFetch(404, { error: 'governed-row-not-found' });
    const error = (await addWatchlistItem('wl-1', 'TCS').catch((e: unknown) => e)) as Error;
    expect(error.message).toBe('add watchlist item failed: 404 (governed-row-not-found)');
  });

  it('sanitizes a hostile reason before it reaches an Error message', async () => {
    mockFetch(404, {
      error: 'governed-row-not-found',
      detail: { reason: `line one\nline two\r\ntab\t${'x'.repeat(500)}` },
    });
    const error = (await addWatchlistItem('wl-1', 'TCS').catch((e: unknown) => e)) as Error;
    expect(error.message).not.toMatch(/[\r\n\t]/);
    expect(error.message.length).toBeLessThanOrEqual(260); // 200-char reason cap + short fixed prefix
  });
});
