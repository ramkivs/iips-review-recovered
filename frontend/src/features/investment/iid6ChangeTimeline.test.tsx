/**
 * IID-6 — the change timeline (AC-6.5, AC-6.6).
 *
 * The claim that carries the most risk is the one this file tests hardest: a reader must be able to tell a data
 * change from a model change from a freshness crossing, and must see BOTH versions' `dataAsOf`, `knownAsOf` and model
 * versions at the same time. A timeline that showed only the current version's clocks would invite exactly the
 * misreading the whole change phase exists to prevent.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import ChangeTimeline from './ChangeTimeline';
import type { AssessmentVersionView } from '../../api/investment';
import {
  BOUNDARIES_ENVELOPE,
  CHANGES_ENVELOPE,
  ISSUER,
  comparison,
  version,
} from './iid6Fixtures';

const VERSIONS = [version('r-1', 1), version('r-2', 2)] as unknown as readonly AssessmentVersionView[];

function stub(handler: (url: string) => Response) {
  const mock = vi.fn(async (url: string) => handler(String(url)));
  vi.stubGlobal('fetch', mock);
  return mock;
}

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function renderTimeline(versions: readonly AssessmentVersionView[] = VERSIONS) {
  return render(
    <MemoryRouter>
      <ChangeTimeline issuerId={ISSUER} versions={versions} />
    </MemoryRouter>,
  );
}

function stubAll(changes: unknown, boundaries: unknown = BOUNDARIES_ENVELOPE) {
  return stub((url) =>
    url.includes('/changes/boundaries')
      ? jsonOk(boundaries)
      : url.includes('/changes')
        ? jsonOk(changes)
        : new Response('', { status: 404 }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('both versions are shown side by side', () => {
  it('prints dataAsOf, knownAsOf and the model version for the previous and the current version', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    const table = await screen.findByRole('table', { name: /Both versions side by side/ });
    const rows = within(table).getAllByRole('row');
    const row = (label: string) => rows.find((candidate) => within(candidate).queryByRole('rowheader', { name: label }) !== null) as HTMLElement;

    // The two versions carry different clocks, and each is shown under its own column.
    const dataAsOf = row('dataAsOf');
    expect(within(dataAsOf).getByText('2026-03-31')).toBeInTheDocument();
    expect(within(dataAsOf).getByText('2026-06-30')).toBeInTheDocument();

    const knownAsOf = row('knownAsOf');
    expect(within(knownAsOf).getByText('2026-04-20T10:00:00Z')).toBeInTheDocument();
    expect(within(knownAsOf).getByText('2026-07-23T17:44:46Z')).toBeInTheDocument();

    const model = row('Model version');
    expect(within(model).getByText('assessment-engine/1.0.0')).toBeInTheDocument();
    expect(within(model).getByText('assessment-engine/1.1.0')).toBeInTheDocument();
  });

  it('says so, rather than borrowing the other version, when a version is not in this chain view', async () => {
    stubAll(CHANGES_ENVELOPE);
    // Only the current version is supplied: the previous version's clocks are unknown to this component.
    renderTimeline([VERSIONS[1]]);

    const table = await screen.findByRole('table', { name: /Both versions side by side/ });
    const rows = within(table).getAllByRole('row');
    const dataAsOf = rows.find(
      (row) => within(row).queryByRole('rowheader', { name: 'dataAsOf' }) !== null,
    ) as HTMLElement;
    const cells = within(dataAsOf).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('not available — version metadata not in this chain view');
    // The unknown previous version never inherits the known current clock: it appears once, in its own column.
    expect(within(dataAsOf).getAllByText('2026-06-30')).toHaveLength(1);
  });

  it('labels the pair as a freshness transition and explains what that means', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    const note = screen.getAllByRole('note').find((element) => element.hasAttribute('data-classification')) as HTMLElement;
    expect(note).toHaveAttribute('data-classification', 'FRESHNESS_TRANSITION');
    // The classification is stated, and what it does NOT mean is stated with it.
    expect(note.textContent).toMatch(/FRESHNESS_TRANSITION/);
    expect(note.textContent).toMatch(/not a change in the underlying business or in the reported figures/);
    expect(note.textContent).not.toMatch(/buy|sell|accumulate|reduce|hold/i);
  });
});

describe('every category is rendered, including the empty ones', () => {
  it('renders all eight category groups with their counts', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    for (const category of [
      'FUNDAMENTAL',
      'MARKET VALUATION',
      'RISK QUALITY',
      'DISPOSITION',
      'PORTFOLIO',
      'DATA CORRECTION RESTATEMENT',
      'MODEL',
      'IDENTITY MAPPING',
    ]) {
      expect(screen.getByRole('heading', { name: new RegExp(`^${category} \\(\\d+\\)$`) })).toBeInTheDocument();
    }
    const riskGroup = document.querySelector('[data-category="RISK_QUALITY"]') as HTMLElement;
    expect(within(riskGroup).getByText('Quality verdict')).toBeInTheDocument();
    const fundamentalGroup = document.querySelector('[data-category="FUNDAMENTAL"]') as HTMLElement;
    expect(within(fundamentalGroup).getByText(/No changed dimension in this category/)).toBeInTheDocument();
  });

  it('renders numeric and categorical values with direction in words, never by colour alone', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    const riskGroup = (await screen.findByRole('heading', { name: /^RISK QUALITY/ })).closest('section') as HTMLElement;
    // Categorical: previous and current values, in words.
    expect(within(riskGroup).getByText('CLEAN')).toBeInTheDocument();
    expect(within(riskGroup).getByText('MATERIAL_CONCERNS')).toBeInTheDocument();
    // Direction and materiality are textual badges, so they survive a greyscale or a screen reader.
    expect(within(riskGroup).getAllByText(/WORSENED/).length).toBeGreaterThan(0);
    expect(within(riskGroup).getAllByText(/MATERIAL|CRITICAL/).length).toBeGreaterThan(0);
  });
});

describe('review, attribution and metadata are shown with their status', () => {
  it('shows the fired triggers, the priority and the focus questions', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    expect(screen.getByText(/Review is required/)).toBeInTheDocument();
    expect(screen.getAllByText('HIGH').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FRESHNESS_TRANSITION/).length).toBeGreaterThan(0);
    expect(screen.getByText(/the pair is a freshness transition/)).toBeInTheDocument();
    expect(screen.getByText(/Do the underlying statements need refreshing/)).toBeInTheDocument();
  });

  it('states attribution UNAVAILABLE with the cause, rather than estimating the split', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    expect(screen.getByText(/UNAVAILABLE — the split between data and model could not be computed/)).toBeInTheDocument();
    expect(screen.getByText(/cause UNATTRIBUTED/)).toBeInTheDocument();
    expect(screen.getByText(/model leg: unavailable/)).toBeInTheDocument();
    expect(screen.getByText(/only one build exists/)).toBeInTheDocument();
  });

  it('separates generation metadata that differs from an investment change', async () => {
    stubAll(CHANGES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    expect(screen.getByRole('heading', { name: /Generation metadata that differs \(not an investment change\)/ })).toBeInTheDocument();
    expect(screen.getByText('artifact.generatedAt')).toBeInTheDocument();
  });
});

describe('a missing boundary explanation is a visible gap with an operator remedy', () => {
  it('names the unexplained pairs and offers no control that could fill them', async () => {
    stubAll(CHANGES_ENVELOPE, BOUNDARIES_ENVELOPE);
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    expect(screen.getByText(/Explanation missing for 1 version pair/)).toBeInTheDocument();
    expect(screen.getByText(/operator reconciliation action performed against the governed store/)).toBeInTheDocument();
    expect(screen.getByText(/ChangeService\.reconcile/)).toBeInTheDocument();
    // The only buttons are the pair selectors: reconciliation is never a click here.
    for (const button of screen.getAllByRole('button')) {
      expect(button.textContent).toMatch(/^(Compare|Showing) v\d+ → v\d+$/);
      expect(button.textContent).not.toMatch(/reconcile|repair|fix|generate|backfill/i);
    }
  });

  it('claims no completeness when the boundary read itself failed', async () => {
    stub((url) => (url.includes('/boundaries') ? new Response('', { status: 503 }) : jsonOk(CHANGES_ENVELOPE)));
    renderTimeline();

    expect(await screen.findByText(/Boundary coverage could not be read, so no completeness claim is made/)).toBeInTheDocument();
  });
});

describe('degraded change history', () => {
  it('shows fixed copy when the chain has fewer than two versions', async () => {
    stub(() => new Response(JSON.stringify({ error: 'change-not-found' }), { status: 404 }));
    renderTimeline();

    expect(await screen.findByText(/No stored assessment history exists for this issuer/)).toBeInTheDocument();
    expect(screen.getByText(/nothing is invented to fill the timeline/)).toBeInTheDocument();
  });

  it('shows fixed copy for an unrecognised response and renders no change rows', async () => {
    stub((url) => (url.includes('/boundaries') ? new Response('', { status: 404 }) : jsonOk({ status: 'OK', comparisons: 'nope' })));
    renderTimeline();

    expect(await screen.findByText(/could not be read because the response was not recognised/)).toBeInTheDocument();
    expect(document.querySelectorAll('[data-category]')).toHaveLength(0);
  });
});

describe('the pair selector reads a different comparison without re-deriving anything', () => {
  it('switches the active pair when the second comparison is chosen', async () => {
    const second = comparison({ classification: 'SUBSTANTIVE', summary: { ...comparison({}).summary, total: 1 } });
    const changes = {
      ...CHANGES_ENVELOPE,
      pairCount: 2,
      returned: 2,
      comparisons: [comparison({}), second],
    };
    stubAll(changes, { ...BOUNDARIES_ENVELOPE, coverage: { ...BOUNDARIES_ENVELOPE.coverage, unexplainedPairs: [] } });
    renderTimeline();

    await screen.findByRole('table', { name: /Both versions side by side/ });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
    // Newest first: the first row's button selects the older comparison (comparisons[1]).
    await userEvent.click(buttons[0] as HTMLElement);
    const notes = screen.getAllByRole('note');
    expect(notes.some((note) => note.getAttribute('data-classification') === 'SUBSTANTIVE')).toBe(true);
  });
});
