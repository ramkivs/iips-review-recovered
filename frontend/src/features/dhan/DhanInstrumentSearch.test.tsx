import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DhanInstrumentSearch } from './DhanInstrumentSearch';
import * as api from '../../api/dhanIdentity';

vi.mock('../../api/dhanIdentity', async () => {
  const actual = await vi.importActual<typeof import('../../api/dhanIdentity')>('../../api/dhanIdentity');
  return { ...actual, searchDhanInstruments: vi.fn(), resolveDhanIdentity: vi.fn(), qualifyDhanIdentity: vi.fn() };
});

const qualified = {
  status: 'QUALIFIED' as const,
  securityIdentity: { securityId: 'ISIN:INE000SYNTH1:EQ' as const, isin: 'INE000SYNTH1', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' as const },
  companyId: 'COMP-A', exchange: 'NSE' as const, isinAuthority: 'NON_AUTHORITATIVE' as const,
};
const unresolved = { status: 'UNRESOLVED' as const, reason: 'MISSING_P7_MAPPING', details: 'P7 evidence is missing.' };
const ambiguous = { status: 'AMBIGUOUS' as const, reason: 'CONFLICTING_SERIES' as const, details: 'More than one series is present.' };

beforeEach(() => vi.clearAllMocks());

describe('DHAN instrument search and identity UI', () => {
  it('states that outcomes use an offline IPD snapshot, not live-provider qualification', () => {
    render(<DhanInstrumentSearch />);
    expect(screen.getByText(/IPD's offline registry snapshot/)).toHaveTextContent('does not contact Dhan or perform live-provider qualification');
  });

  it('supports search, keeps candidates as evidence, and requests exact resolve only for qualified results', async () => {
    vi.mocked(api.searchDhanInstruments).mockResolvedValue({ results: [
      { symbol: 'SYNTH', exchange: 'NSE', result: qualified },
      { symbol: 'SYNTH-UNRESOLVED', exchange: 'BSE', result: unresolved },
      { symbol: 'SYNTH-AMBIGUOUS', exchange: 'NSE', result: ambiguous },
    ] });
    vi.mocked(api.resolveDhanIdentity).mockResolvedValue(qualified);
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'SYNTH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    expect(await screen.findByText('3 candidates returned. Duplicate rows are retained as received.')).toBeInTheDocument();
    expect(screen.getByText('ISIN:INE000SYNTH1:EQ')).toBeInTheDocument();
    expect(screen.getByText('MISSING_P7_MAPPING')).toBeInTheDocument();
    expect(screen.getByText('CONFLICTING_SERIES')).toBeInTheDocument();
    expect(screen.getAllByText('NON_AUTHORITATIVE').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Resolve exact identity' })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Resolve exact identity' })[0]!);
    await waitFor(() => expect(api.resolveDhanIdentity).toHaveBeenCalledWith({ companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' }));
    expect(await screen.findByLabelText('Exact identity resolution result')).toHaveAttribute('data-identity-status', 'QUALIFIED');
  });

  it('shows an explicit empty result state and a safe unavailable/error state', async () => {
    vi.mocked(api.searchDhanInstruments).mockResolvedValueOnce({ results: [] });
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'NO-MATCH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    expect(await screen.findByText('No instrument candidates were returned by IPD.')).toBeInTheDocument();
    vi.mocked(api.searchDhanInstruments).mockRejectedValueOnce(new api.DhanIdentityApiError('TRANSPORT_UNAVAILABLE', 'The IPD service could not be reached.', 503));
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The IPD service could not be reached.');
  });

  it('submits qualification inputs as supplied and renders the exact typed unresolved outcome', async () => {
    vi.mocked(api.qualifyDhanIdentity).mockResolvedValue(unresolved);
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('ISIN'), { target: { value: 'INE000SYNTH1' } });
    fireEvent.change(screen.getByLabelText('Exchange', { selector: '#dhan-identity-exchange' }), { target: { value: 'BSE' } });
    fireEvent.change(screen.getByLabelText('Symbol (context only)'), { target: { value: 'SYNTH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Request qualification' }));
    expect(await screen.findByLabelText('Identity qualification result')).toHaveAttribute('data-identity-status', 'UNRESOLVED');
    expect(api.qualifyDhanIdentity).toHaveBeenCalledWith({ isin: 'INE000SYNTH1', exchange: 'BSE', symbol: 'SYNTH' });
    expect(screen.getByText('MISSING_P7_MAPPING')).toBeInTheDocument();
  });

  it('submits an explicit canonical resolve request without IRR-side identity heuristics', async () => {
    vi.mocked(api.resolveDhanIdentity).mockResolvedValue({ status: 'UNRESOLVED', reason: 'MISSING_SERIES_EVIDENCE', details: 'A complete canonical identity is required.' });
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Company ID'), { target: { value: 'COMP-A' } });
    fireEvent.change(screen.getByLabelText('Canonical security identity'), { target: { value: 'ISIN:INE000SYNTH1:EQ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Resolve exact identity' }));
    expect(await screen.findByLabelText('Exact identity resolution result')).toHaveAttribute('data-identity-status', 'UNRESOLVED');
    expect(api.resolveDhanIdentity).toHaveBeenCalledWith({ companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' });
  });

  it('shows ambiguous outcomes distinctly and never offers to resolve them as qualified matches', async () => {
    vi.mocked(api.searchDhanInstruments).mockResolvedValue({ results: [{ symbol: 'DUAL', exchange: 'NSE', result: ambiguous }] });
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'DUAL' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    expect(await screen.findByText('AMBIGUOUS')).toBeInTheDocument();
    expect(screen.getByText('CONFLICTING_SERIES')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Resolve exact identity' }).every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });
});
