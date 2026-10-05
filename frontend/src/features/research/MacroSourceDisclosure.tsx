/**
 * NP-08 / D08 Macro — D89 source disclosure.
 *
 * Product-transparency control only. This component does not make or imply a
 * licence, attribution, endorsement, entitlement, provenance, or production
 * claim. The source text is a stable governed UI contract, not a runtime
 * provider string.
 */
import type { ReactNode } from 'react';

import type { MacroDataset } from '../../api/macro';

export const MACRO_SOURCE_DISCLOSURE = 'Data source: MoSPI / e-Sankhyiki';

export const MACRO_DATASET_LABELS: Readonly<Record<MacroDataset, string>> = {
  NAS: 'National Accounts Statistics (NAS)',
  CPI: 'Consumer Price Index (CPI)',
  IIP: 'Index of Industrial Production (IIP)',
};

export interface MacroSourceDisclosureProps {
  readonly dataset: MacroDataset;
  readonly children?: ReactNode;
}

/**
 * Reusable dataset heading/source block for future Macro summary and detail
 * views. No route is invented here: the current repository has no mounted
 * Macro data-rendering surface, so this is the smallest coherent D89 UI unit.
 */
export function MacroSourceDisclosure({ dataset, children }: MacroSourceDisclosureProps) {
  const headingId = `macro-dataset-heading-${dataset.toLowerCase()}`;

  return (
    <section
      aria-labelledby={headingId}
      data-dataset={dataset}
      data-testid={`macro-source-disclosure-${dataset}`}
      style={{ display: 'grid', gap: 4, minWidth: 0 }}
    >
      <h2 id={headingId} style={{ fontSize: 18, margin: 0 }}>
        {MACRO_DATASET_LABELS[dataset]}
      </h2>
      {dataset === 'IIP' && (
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 12, margin: 0 }}>
          Governed granularity: NIC-2-digit
        </p>
      )}
      <p
        aria-label="Macro data source"
        data-testid={`macro-source-label-${dataset}`}
        style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: 0, overflowWrap: 'anywhere' }}
      >
        {MACRO_SOURCE_DISCLOSURE}
      </p>
      {children}
    </section>
  );
}
