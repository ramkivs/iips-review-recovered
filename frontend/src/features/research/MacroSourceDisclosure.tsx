/**
 * Program v3.0 — NP-08 / D08 MACRO: D89 product-transparency disclosure.
 *
 * Implements the D89 product-transparency contract (DT-1 … DT-8, DT-10,
 * DT-13, DT-15) as a reusable presentation component. This is a product
 * control only: it makes no legal-attribution, licensing, GODL, M-3 or
 * production claim. Formal Category-A attribution remains NOT DETERMINED.
 *
 * Authorized by: CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01
 */
import { type ReactNode } from 'react';

export type MacroDisclosureDataset = 'NAS' | 'CPI' | 'IIP';

const DATASET_LABELS: Record<MacroDisclosureDataset, string> = {
  NAS: 'National Accounts Statistics (NAS)',
  // DT-2: the D08 CPI path is the governed published Group/Subgroup index view — never
  // shop-collected price microdata (GSDD §4.B(ii)), which is outside the D08 boundary.
  CPI: 'Consumer Price Index (CPI), governed published Group/Subgroup index view',
  IIP: 'Index of Industrial Production (IIP), NIC 2-digit level only',
};

export interface MacroSourceDisclosureProps {
  readonly dataset: MacroDisclosureDataset;
  readonly showGsddClassification?: boolean;
  readonly children?: ReactNode;
  readonly analysis?: ReactNode;
}

export function MacroSourceDisclosure({
  dataset,
  showGsddClassification = false,
  children,
  analysis,
}: MacroSourceDisclosureProps) {
  return (
    <section
      aria-label="Macro source disclosure"
      data-testid="macro-source-disclosure"
    >
      <p data-testid="macro-provider">
        Provider: Ministry of Statistics and Programme Implementation (MoSPI) ·
        Data platform:{' '}
        <a
          href="https://esankhyiki.mospi.gov.in/"
          data-testid="macro-platform-link"
        >
          e-Sankhyiki
        </a>
        .
      </p>
      <p data-testid="macro-dataset">Dataset: {DATASET_LABELS[dataset]}</p>
      {showGsddClassification ? (
        <p data-testid="macro-gsdd">
          Open access data — MoSPI GSDD 2019, Category A.
        </p>
      ) : null}
      {children}
      {analysis ? (
        <div data-testid="macro-analysis">{analysis}</div>
      ) : null}
    </section>
  );
}

export default MacroSourceDisclosure;
