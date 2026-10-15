import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MacroSourceDisclosure } from './MacroSourceDisclosure';

describe('MacroSourceDisclosure (D89 product-transparency contract)', () => {
  it('renders the DT-1 provider/platform label', () => {
    render(<MacroSourceDisclosure dataset="NAS" />);
    expect(screen.getByTestId('macro-provider').textContent).toContain(
      'Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform: e-Sankhyiki.',
    );
  });

  it('renders the DT-2 dataset label for NAS', () => {
    render(<MacroSourceDisclosure dataset="NAS" />);
    expect(screen.getByTestId('macro-dataset').textContent).toBe(
      'Dataset: National Accounts Statistics (NAS)',
    );
  });

  it('renders the DT-2 dataset label for CPI', () => {
    render(<MacroSourceDisclosure dataset="CPI" />);
    expect(screen.getByTestId('macro-dataset').textContent).toBe(
      'Dataset: Consumer Price Index (CPI)',
    );
  });

  it('renders the DT-2 dataset label for IIP', () => {
    render(<MacroSourceDisclosure dataset="IIP" />);
    expect(screen.getByTestId('macro-dataset').textContent).toBe(
      'Dataset: Index of Industrial Production (IIP), NIC 2-digit level only',
    );
  });

  it('exposes the disclosure as ordinary accessible text in a region', () => {
    render(<MacroSourceDisclosure dataset="NAS" />);
    const section = screen.getByTestId('macro-source-disclosure');
    expect(section.getAttribute('aria-label')).toBe('Macro source disclosure');
    expect(section.tagName).toBe('SECTION');
  });

  it('does not render licensing or rights language', () => {
    render(<MacroSourceDisclosure dataset="IIP" />);
    const text = screen.getByTestId('macro-source-disclosure').textContent ?? '';
    expect(text).not.toMatch(/licensed|open-licensed|public domain|commercial use|redistribution permitted/i);
    expect(text).not.toMatch(/required by law|required by GODL|MoSPI attribution/i);
  });

  it('renders DT-9 GSDD classification only when requested', () => {
    const { unmount } = render(<MacroSourceDisclosure dataset="NAS" />);
    expect(screen.queryByTestId('macro-gsdd')).toBeNull();
    unmount();
    render(<MacroSourceDisclosure dataset="NAS" showGsddClassification />);
    expect(screen.getByTestId('macro-gsdd').textContent).toBe(
      'Open access data — MoSPI GSDD 2019, Category A.',
    );
  });

  it('keeps IIPS-generated analysis distinct from the source label (DT-6)', () => {
    render(
      <MacroSourceDisclosure dataset="CPI" analysis={<span>IIPS trend view</span>} />,
    );
    expect(screen.getByTestId('macro-analysis').textContent).toBe('IIPS trend view');
    expect(screen.getByTestId('macro-provider').textContent).not.toContain('IIPS trend view');
  });
});
