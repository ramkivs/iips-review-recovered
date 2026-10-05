/**
 * NP-08 / D08 Macro — D89 source disclosure tests.
 *
 * Focused presentation tests only. No network, acquisition, entitlement,
 * provenance, or licensing behavior is exercised here.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MACRO_DATASET_LABELS, MACRO_SOURCE_DISCLOSURE, MacroSourceDisclosure } from './MacroSourceDisclosure';

const DATASETS = ['NAS', 'CPI', 'IIP'] as const;

describe('D89 Macro source disclosure', () => {
  it.each(DATASETS)('renders the governed source for %s', (dataset) => {
    render(
      <MacroSourceDisclosure dataset={dataset}>
        <div data-testid="dataset-content">governed dataset content</div>
      </MacroSourceDisclosure>,
    );

    expect(screen.getByTestId(`macro-source-label-${dataset}`)).toHaveTextContent(MACRO_SOURCE_DISCLOSURE);
    expect(screen.getByTestId(`macro-source-disclosure-${dataset}`)).toHaveTextContent(MACRO_DATASET_LABELS[dataset]);
    expect(screen.getByTestId('dataset-content')).toBeInTheDocument();
  });

  it('keeps IIP explicitly within the governed NIC-2-digit granularity', () => {
    render(<MacroSourceDisclosure dataset="IIP" />);

    expect(screen.getByTestId('macro-source-disclosure-IIP')).toHaveTextContent('Governed granularity: NIC-2-digit');
    expect(screen.getByTestId('macro-source-disclosure-IIP')).not.toHaveTextContent(/item-level/i);
  });

  it('does not introduce endorsement or legal-licensing claims', () => {
    render(<MacroSourceDisclosure dataset="NAS" />);
    const disclosure = screen.getByTestId('macro-source-disclosure-NAS');

    expect(disclosure).not.toHaveTextContent(/endorsed|approved|certified|sponsored|recommended by MoSPI/i);
    expect(disclosure).not.toHaveTextContent(/GODL|licen[cs]e|DOI|https?:\/\//i);
    expect(screen.getByTestId('macro-source-label-NAS')).not.toHaveAttribute('title');
  });

  it('exposes an accessible dataset heading and source label for responsive layouts', () => {
    render(<MacroSourceDisclosure dataset="CPI" />);

    const disclosure = screen.getByTestId('macro-source-disclosure-CPI');
    expect(disclosure).toHaveAttribute('aria-labelledby', 'macro-dataset-heading-cpi');
    expect(screen.getByRole('heading', { name: MACRO_DATASET_LABELS.CPI })).toBeInTheDocument();
    expect(screen.getByLabelText('Macro data source')).toHaveTextContent(MACRO_SOURCE_DISCLOSURE);
    expect(screen.getByTestId('macro-source-label-CPI')).toHaveStyle({ overflowWrap: 'anywhere' });
  });
});
