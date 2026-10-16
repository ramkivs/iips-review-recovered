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
  it('renders the real Dhan pipeline without network, persistence or save controls', async () => {
    const network = vi.fn(() => { throw new Error('No network permitted'); });
    vi.stubGlobal('fetch', network);
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    render(<BrokerHoldingsPreview />);
    select(file());
    expect(await screen.findByText('DHAN — PARSED_UNRESOLVED')).toBeInTheDocument();
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    expect(screen.getByText('UNRESOLVED')).toBeInTheDocument();
    expect(screen.getByText(/No canonical company identity/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save/i })).not.toBeInTheDocument();
    expect(network).not.toHaveBeenCalled();
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
