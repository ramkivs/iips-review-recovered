import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrokerHoldingsPreview } from './BrokerHoldingsPreview';

const csv = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';
function file(name = 'dhan.csv', content = csv) {
  const f = new File([content], name, { type: 'text/csv' });
  Object.defineProperty(f, 'text', { value: vi.fn(async () => content), configurable: true });
  return f;
}
function select(f: File) {
  fireEvent.change(screen.getByLabelText('Broker CSV (maximum 1 MiB)'), { target: { files: [f] } });
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Broker Holdings — executable browser-only preview', () => {
  it('renders the real pipeline and attempts only parsed-evidence submission, never holdings or raw bytes', async () => {
    const network = vi.fn((_url: string, _init?: RequestInit) => { throw new Error('submission unavailable'); });
    vi.stubGlobal('fetch', network);
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    render(<BrokerHoldingsPreview />);
    select(file());
    // RELIANCE is in the governed master, so the pipeline resolves it; the header states status only.
    expect(await screen.findByText('DHAN — PARSED_IDENTITIES_RESOLVED')).toBeInTheDocument();
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    expect(screen.getByText('RESOLVED')).toBeInTheDocument();
    expect(screen.getByText(/nothing is inferred from/)).toBeInTheDocument();
    expect(screen.getByText(/1 native rows · 1 individually assessed ·/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save/i })).not.toBeInTheDocument();
    await waitFor(() => expect(network).toHaveBeenCalledTimes(1));
    expect(network.mock.calls[0][0]).toBe('/api/broker-import/DEFAULT_PORTFOLIO/evidence');
    expect(screen.queryByText('Evidence retained and retrievable. Holdings not saved.')).not.toBeInTheDocument();
    expect(writes).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear preview' }));
    expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument();
  });
  it('rejects oversized files and XLSX before reading bytes', () => {
    render(<BrokerHoldingsPreview />);
    const large = file();
    Object.defineProperty(large, 'size', { value: 1_048_577 });
    select(large);
    expect(screen.getByRole('alert')).toHaveTextContent('no larger than 1 MiB');
    expect(large.text).not.toHaveBeenCalled();
    const xlsx = file('dhan.xlsx');
    select(xlsx);
    expect(screen.getByRole('alert')).toHaveTextContent('XLSX is not supported');
    expect(xlsx.text).not.toHaveBeenCalled();
  });
  it('shows rejected input rather than a successful holding list', async () => {
    render(<BrokerHoldingsPreview />);
    select(file('unknown.csv', 'x,y\n1,2'));
    expect(await screen.findByText('UNKNOWN — REJECTED')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('clear invalidates an in-flight read and a newer file invalidates the old selection', async () => {
    let finish!: (text: string) => void;
    const slow = file();
    Object.defineProperty(slow, 'text', { value: () => new Promise<string>(resolve => { finish = resolve; }), configurable: true });
    render(<BrokerHoldingsPreview />);
    select(slow);
    fireEvent.click(screen.getByRole('button', { name: 'Clear preview' }));
    finish(csv);
    await waitFor(() => expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument());
    select(file('second.csv', csv.replace('RELIANCE', 'SECOND')));
    expect(await screen.findByText('SECOND')).toBeInTheDocument();
    expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument();
  });
  it('a late older selection cannot overwrite a newer file', async () => {
    let finish!: (text: string) => void;
    const slow = file();
    Object.defineProperty(slow, 'text', { value: () => new Promise<string>(resolve => { finish = resolve; }), configurable: true });
    render(<BrokerHoldingsPreview />);
    select(slow);
    select(file('new.csv', csv.replace('RELIANCE', 'NEWER')));
    await screen.findByText('NEWER');
    finish(csv);
    await waitFor(() => expect(screen.getByText('NEWER')).toBeInTheDocument());
    expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument();
  });
  it('clears an old preview when file reading fails', async () => {
    render(<BrokerHoldingsPreview />);
    select(file());
    await screen.findByText('RELIANCE');
    const broken = file('broken.csv');
    Object.defineProperty(broken, 'text', { value: async () => { throw new Error('read failed'); }, configurable: true });
    select(broken);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to preview');
    expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument();
  });
});

/**
 * Retention disclosure reconciled per `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`
 * §8.4(18), rendering the PA's Decision 6 of 2026-11-05.
 *
 * Clause 18 required the UI copy to be reconciled BEFORE the evidence-retrieval route was implemented,
 * and it named the exact contradiction: the page told the owner files are "not uploaded or stored"
 * while parsed evidence IS retained. These assertions run against the RENDERED text, so they prove the
 * disclosure actually reaches the owner rather than merely existing in source.
 *
 * This is a DISCLOSURE obligation, not a request-time consent gate. The route reads no identity from a
 * request (§8.2(10)), so no consent token, header or checkbox is accepted or required, and the
 * assertions below deliberately check for wording — not for a control that would imply one.
 */
describe('Broker Holdings — evidence retention disclosure (AMEND-01 §8.4(18))', () => {
  function disclosure(): string {
    render(<BrokerHoldingsPreview />);
    return screen.getByRole('region', { name: 'Evidence retention' }).textContent ?? '';
  }

  it('is visible to the owner without selecting a file', () => {
    expect(disclosure().length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'What this application retains' })).toBeInTheDocument();
  });

  it('discloses local retention, an indefinite period and explicit-owner-only deletion (18.1, 18.5)', () => {
    const text = disclosure();
    expect(text).toMatch(/is retained locally/);
    expect(text).toMatch(/data directory/);
    expect(text).toMatch(/indefinite/);
    expect(text).toMatch(/explicitly deletes/);
    expect(text).toMatch(/no automatic deletion or purge/);
  });

  it('states the 50 MB figure is a warning and review point only, never a deletion trigger (18.5)', () => {
    const text = disclosure();
    expect(text).toMatch(/50 MB/);
    expect(text).toMatch(/warning/);
    expect(text).toMatch(/deletes nothing/);
    expect(text).toMatch(/not a quota/);
  });

  it('discloses that raw CSV bytes are not retained and names the retained equivalent (18.2)', () => {
    const text = disclosure();
    expect(text).toMatch(/raw CSV bytes are not retained/);
    expect(text).toMatch(/parsed row inventory/);
    expect(text).toMatch(/digest/);
  });

  it('discloses owner-scope-only service, no third-party transmission and no enumeration route (18.3)', () => {
    const text = disclosure();
    expect(text).toMatch(/only within the single personal owner scope/);
    expect(text).toMatch(/never transmitted to any third party/);
    expect(text).toMatch(/no route enumerates/);
  });

  it('discloses that retention is not a save, not a validation and not an authorization (18.4)', () => {
    const text = disclosure();
    expect(text).toMatch(/not a save/);
    expect(text).toMatch(/savedRows/);
    expect(text).toMatch(/WRITE_NOT_AUTHORIZED/);
  });

  it('no longer tells the owner that nothing is stored, and keeps the half that was true', () => {
    render(<BrokerHoldingsPreview />);
    const page = screen.getByRole('region', { name: 'Broker Holdings preview' }).textContent ?? '';
    expect(page).not.toContain('not uploaded or stored');
    expect(page).toMatch(/raw bytes are not uploaded/);
  });
});

it('clearing while retention is pending prevents a late acknowledgement from restoring evidence or success', async () => {
  let release!: (response: Response) => void;
  const network = vi.fn<typeof fetch>(() => new Promise<Response>(r => { release = r; }));
  vi.stubGlobal('fetch', network);
  render(<BrokerHoldingsPreview />);
  select(file());
  await waitFor(() => expect(network).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: 'Clear preview' }));
  release(new Response('{}', { status: 503 }));
  await waitFor(() => expect(screen.queryByText(/Evidence retention unconfirmed/)).not.toBeInTheDocument());
  expect(screen.queryByText('RELIANCE')).not.toBeInTheDocument();
  expect(network).toHaveBeenCalledTimes(1);
});
