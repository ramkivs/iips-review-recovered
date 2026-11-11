/**
 * Presentation-contract tests for the DHAN Instrument Search screen.
 *
 * These tests pin the STRUCTURE the stylesheet hangs off and the behavioural
 * states the design requires. They deliberately do not assert computed styles:
 * jsdom does not apply stylesheets, and a passing jsdom test is not evidence of
 * visual parity. Computed-style and geometry verification is performed in a real
 * browser; see `DhanInstrumentSearchStyles.test.ts` for the stylesheet contract
 * and the report's layout-audit table for the measured before/after values.
 *
 * Every assertion here is also a regression guard: dropping a `dhanid-*` class,
 * merging a label with its required/optional qualifier, or restyling the
 * governance panel as an error would all break the screen silently.
 */
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

beforeEach(() => vi.clearAllMocks());

describe('page header', () => {
  it('renders the page title as the page heading', () => {
    render(<DhanInstrumentSearch />);
    const heading = screen.getByRole('heading', { name: 'DHAN Instrument Search' });
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('dhanid__title');
  });

  it('carries the descriptive subtitle inside the header', () => {
    render(<DhanInstrumentSearch />);
    const header = document.querySelector('.dhanid__header');
    expect(header).not.toBeNull();
    expect(header).toHaveTextContent("IPD's offline registry snapshot");
    expect(header).toHaveTextContent('does not contact Dhan or perform live-provider qualification');
  });

  it('shows a distinct OFFLINE SNAPSHOT status indicator', () => {
    render(<DhanInstrumentSearch />);
    const flag = screen.getByTestId('dhan-offline-snapshot-flag');
    expect(flag).toHaveTextContent(/offline snapshot/i);
    expect(flag).toHaveClass('dhanid__snapshot-flag');
  });
});

describe('the three functional sections are separate cards', () => {
  it('renders Instrument Search, Resolve Exact Identity and Qualify an Identity as distinct sections', () => {
    render(<DhanInstrumentSearch />);
    for (const name of ['Instrument Search', 'Resolve Exact Identity', 'Qualify an Identity']) {
      const heading = screen.getByRole('heading', { name, level: 2 });
      const card = heading.closest('.dhanid-card');
      expect(card, name).not.toBeNull();
    }
    // Three distinct card elements, not one shared container.
    expect(document.querySelectorAll('.dhanid-card')).toHaveLength(3);
  });

  it('places the two lower forms side by side in a responsive column grid', () => {
    render(<DhanInstrumentSearch />);
    const columns = document.querySelector('.dhanid-columns');
    expect(columns).not.toBeNull();
    expect(columns?.querySelectorAll(':scope > .dhanid-card')).toHaveLength(2);
  });

  it('renders the governance panel as its own informational panel, not a card', () => {
    render(<DhanInstrumentSearch />);
    const panel = screen.getByRole('complementary', { name: 'Authority and governance' });
    expect(panel).toHaveClass('dhanid-governance');
    expect(panel).not.toHaveClass('dhanid-card');
  });
});

describe('field labelling', () => {
  it('positions every field label as a sibling of its control, never merged with a qualifier', () => {
    render(<DhanInstrumentSearch />);
    // A required/optional qualifier merged into the label text would change the
    // control's accessible name and break every existing label-based query.
    expect(screen.getByLabelText('Symbol or ISIN')).toBeInTheDocument();
    expect(screen.getByLabelText('Company ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Canonical security identity')).toBeInTheDocument();
    expect(screen.getByLabelText('ISIN')).toBeInTheDocument();
    expect(screen.getByLabelText('Symbol (context only)')).toBeInTheDocument();
    expect(screen.getByLabelText('Exchange', { selector: '#dhan-identity-exchange' })).toBeInTheDocument();
    expect(screen.getByLabelText('Exchange', { selector: '#dhan-resolve-exchange' })).toBeInTheDocument();
  });

  it('marks Resolve Exact Identity fields as required', () => {
    render(<DhanInstrumentSearch />);
    for (const label of ['Company ID', 'Canonical security identity']) {
      const field = screen.getByLabelText(label).closest('.dhanid-field');
      expect(field, label).toHaveTextContent('Required');
    }
  });

  it('distinguishes the optional qualification fields and states that symbol is not evidence', () => {
    render(<DhanInstrumentSearch />);
    const isinField = screen.getByLabelText('ISIN').closest('.dhanid-field');
    expect(isinField).toHaveTextContent('Optional');
    expect(isinField).toHaveTextContent("typed missing-ISIN outcome");

    const symbolField = screen.getByLabelText('Symbol (context only)').closest('.dhanid-field');
    expect(symbolField).toHaveTextContent('Optional');
    expect(symbolField).toHaveTextContent(/not.*matching evidence|does not.*matching evidence/);
  });

  it('labels every control with the shared field-label class so styling is uniform', () => {
    render(<DhanInstrumentSearch />);
    const labels = document.querySelectorAll('.dhanid-field__label');
    expect(labels.length).toBeGreaterThanOrEqual(7);
  });

  it('gives every input and select the shared control class', () => {
    render(<DhanInstrumentSearch />);
    const controls = document.querySelectorAll('.dhanid-field__control');
    expect(controls).toHaveLength(7);
  });
});

describe('governance wording is preserved in full', () => {
  it('retains every governed statement', () => {
    render(<DhanInstrumentSearch />);
    const panel = screen.getByRole('complementary', { name: 'Authority and governance' });
    expect(panel).toHaveTextContent('IPD owns provider-side mappings and qualification');
    expect(panel).toHaveTextContent('isinAuthority: NON_AUTHORITATIVE');
    expect(panel).toHaveTextContent(/does not replace IRR's governed identity/);
    expect(panel).toHaveTextContent(/does not constitute automatic approval/);
    expect(panel).toHaveTextContent(/UNRESOLVED and AMBIGUOUS remain non-matches/);
  });

  it('never renders a bare status word that could collide with an outcome query', () => {
    // Outcome status words are located by EXACT text elsewhere, so a standalone
    // "AMBIGUOUS"/"UNRESOLVED"/"QUALIFIED" element here would make those queries
    // ambiguous. Every occurrence in the panel must sit inside a longer sentence.
    render(<DhanInstrumentSearch />);
    const panel = screen.getByRole('complementary', { name: 'Authority and governance' });
    const texts = [...panel.querySelectorAll('*')].map((el) => (el.textContent ?? '').trim());
    for (const word of ['QUALIFIED', 'UNRESOLVED', 'AMBIGUOUS']) {
      expect(texts, word).not.toContain(word);
    }
  });
});

describe('interaction states', () => {
  it('disables the search action until a query is supplied', () => {
    render(<DhanInstrumentSearch />);
    const button = screen.getByRole('button', { name: 'Search instruments' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'RELIANCE' } });
    expect(button).toBeEnabled();
  });

  it('shows a loading state while the search is in flight and disables the action', async () => {
    let release: ((value: { results: readonly never[] }) => void) | undefined;
    vi.mocked(api.searchDhanInstruments).mockReturnValue(new Promise((resolve) => { release = resolve; }));
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'RELIANCE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    const busy = await screen.findByRole('button', { name: /Searching/ });
    expect(busy).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Searching IPD instrument evidence…');
    expect(document.querySelector('.dhanid-spinner')).not.toBeNull();
    release?.({ results: [] });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Search instruments' })).toBeEnabled());
  });

  it('renders the empty state as a status, never as an alert', async () => {
    vi.mocked(api.searchDhanInstruments).mockResolvedValue({ results: [] });
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'NO-MATCH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    const empty = await screen.findByText('No instrument candidates were returned by IPD.');
    expect(empty).toHaveAttribute('role', 'status');
    expect(empty).toHaveClass('dhanid-message--empty');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables the resolve action until both required identity fields are supplied', () => {
    render(<DhanInstrumentSearch />);
    const button = screen.getByRole('button', { name: 'Resolve exact identity' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Company ID'), { target: { value: 'COMP-A' } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Canonical security identity'), { target: { value: 'ISIN:INE000SYNTH1:EQ' } });
    expect(button).toBeEnabled();
  });

  it('renders each search result as a structured card with its exchange and outcome', async () => {
    vi.mocked(api.searchDhanInstruments).mockResolvedValue({ results: [
      { symbol: 'RELIANCE', exchange: 'NSE', result: qualified },
      { symbol: 'TCS', exchange: 'BSE', result: unresolved },
    ] });
    render(<DhanInstrumentSearch />);
    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'RELIANCE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));
    await screen.findByText('2 candidates returned. Duplicate rows are retained as received.');
    const rows = document.querySelectorAll('.dhanid-result');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('RELIANCE');
    expect(rows[0]).toHaveTextContent('NSE');
    expect(rows[1]).toHaveTextContent('TCS');
  });
});
