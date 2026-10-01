/**
 * NP-13 — Decision Evidence landing against the REAL composed executive-transport (no stubs).
 *
 * Mounts the real <App/> route table and bridges `fetch` to the real server (ephemeral port). Proves, with
 * the existing transport exactly as shipped, that: the landing lists the COMPLETE governed subject set;
 * every link resolves through the existing `/evidence/:id` route; the values the landing shows are the
 * governed values the detail surface shows; the replay hop is intact; reserved paths never become evidence
 * subjects; and no evidence index endpoint exists or was added.
 *
 * The server module is loaded with a dynamic import on purpose: it keeps this `src/` test (and therefore the
 * project typecheck) independent of the pre-existing server typecheck baseline.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, cleanup, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../core/session/SessionContext';
import { App } from '../../app/App';
import baseline from '../../../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json';

/** The governed subject set: the 13 sectors of the frozen v1.1 Replay Baseline (independent oracle). */
const GOVERNED_SUBJECTS: string[] = baseline.sectors.map((s) => s.sector);

interface ComposedServer {
  listen(port: number, host: string, cb: () => void): unknown;
  address(): { port: number } | string | null;
  close(): unknown;
}

const SERVER_MODULE = '../../../server/executive-transport';
const realFetch = globalThis.fetch;
const requests: string[] = [];
let server: ComposedServer;
let base = '';

beforeAll(async () => {
  const mod = (await import(/* @vite-ignore */ SERVER_MODULE)) as { server: ComposedServer };
  server = mod.server;
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', () => resolve()); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('the composed server did not bind a TCP port');
  base = `http://127.0.0.1:${address.port}`;
  globalThis.fetch = ((url: string, init?: RequestInit) => {
    requests.push(String(url));
    return realFetch(`${base}${url}`, init);
  }) as never;
}, 60_000);

afterAll(() => {
  globalThis.fetch = realFetch;
  server.close();
});

async function visit(path: string) {
  requests.length = 0;
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-X', role: 'viewer', authenticated: true }}>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
  await waitFor(() => {
    if (view.container.querySelector('[data-testid="state-loading"]')) throw new Error('still loading');
  }, { timeout: 30_000 });
  return view;
}

describe('NP-13 Decision Evidence landing — real composed transport', () => {
  it('lists the complete governed subject set and every link resolves through the existing detail route', async () => {
    expect(GOVERNED_SUBJECTS).toHaveLength(13);

    const landing = await visit('/evidence');
    expect(landing.container.querySelector('[data-testid="evidence-landing"]')).not.toBeNull();
    expect(requests).toEqual(['/api/executive']); // ONE existing governed read; no evidence or replay request
    const index = landing.container.querySelector('[data-testid="evidence-landing-index"]') as HTMLElement;
    const rows = within(index).getAllByRole('row').slice(1); // skip the header row
    const listed = rows.map((row) => {
      const link = within(row).getByRole('link');
      const badge = row.querySelector('[data-testid^="decision-badge-"]');
      return {
        name: link.textContent as string,
        href: link.getAttribute('href') as string,
        verdict: (badge?.getAttribute('data-testid') ?? '').replace('decision-badge-', ''),
      };
    });
    cleanup();

    expect(listed).toHaveLength(13);
    expect(listed.map((s) => s.name).sort()).toEqual([...GOVERNED_SUBJECTS].sort());

    for (const subject of listed) {
      const detail = await visit(subject.href);
      expect(detail.container.querySelector('section[aria-label="Evidence explorer"]'), `${subject.name}: explorer`).not.toBeNull();
      expect(detail.container.querySelector('main h1')?.textContent, `${subject.name}: heading`).toBe(`Evidence — ${subject.name}`);
      expect(detail.container.querySelector('[data-testid="state-error"]'), `${subject.name}: no error state`).toBeNull();
      expect(requests, `${subject.name}: the existing resolver is asked for the sector-name identity`).toEqual([`/api/evidence/${encodeURIComponent(subject.name)}`]);
      // The landing shows the same governed certified verdict that the detail surface shows.
      expect(subject.verdict, `${subject.name}: verdict present`).not.toBe('');
      expect(detail.container.querySelector(`[data-testid="decision-badge-${subject.verdict}"]`), `${subject.name}: same verdict as the detail surface`).not.toBeNull();
      cleanup();
    }
  }, 120_000);

  it('keeps the existing replay hop intact for every governed subject', async () => {
    for (const subject of GOVERNED_SUBJECTS) {
      const replay = await visit(`/evidence/replay/${encodeURIComponent(subject)}`);
      expect(replay.container.querySelector('section[aria-label="Replay explorer"]'), `${subject}: explorer`).not.toBeNull();
      expect(replay.container.querySelector('main h1')?.textContent, `${subject}: heading`).toBe(`Replay — ${subject}`);
      expect(replay.container.querySelector('[data-testid="state-error"]'), `${subject}: no error state`).toBeNull();
      expect(requests).toEqual([`/api/replay/${encodeURIComponent(subject)}`]);
      cleanup();
    }
  }, 120_000);

  it.each(['/evidence/snapshots', '/evidence/replay'])('reserved path %s never becomes an evidence subject — no evidence request is issued', async (path) => {
    const view = await visit(path);
    expect(view.container.querySelector('[data-testid="evidence-reserved-path"]')).not.toBeNull();
    expect(view.container.querySelector('section[aria-label="Evidence explorer"]')).toBeNull();
    expect(requests).toEqual([]);
    // The existing transport does not know these words as subjects (hence the explicit route protection).
    expect((await realFetch(`${base}/api/evidence/${path.split('/').pop()}`)).status).toBe(404);
  });

  it('the existing transport still resolves the sector name — not ev_* — and exposes no evidence index endpoint', async () => {
    expect((await realFetch(`${base}/api/evidence/Banking`)).status).toBe(200);
    expect((await realFetch(`${base}/api/evidence/ev_Banking`)).status).toBe(404);
    expect((await realFetch(`${base}/api/replay/ev_Banking`)).status).toBe(404);
    for (const p of ['/api/evidence', '/api/evidence/', '/api/replay', '/api/replay/']) {
      expect((await realFetch(`${base}${p}`)).status, `${p} is not an index endpoint`).toBe(404);
    }
  });
});
