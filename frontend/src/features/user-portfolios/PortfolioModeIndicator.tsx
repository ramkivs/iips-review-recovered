/**
 * W17 — mode indicator: renders the selected mode (ACTUAL / REFERENCE / DEGRADED)
 * with revision identity, source date, coverage and the explicit missing list.
 *
 * Presentation only: it renders what `selectPortfolioMode` decided and never
 * upgrades a mode, never fabricates a value, and never hides a missing item.
 * Uses the semantic status tokens and pairs symbol + label (non-color-only rule).
 */
import { MODE_PRESENTATION, type PortfolioModeDecision } from './portfolioMode';
import { shortDigest } from './UserPortfolioStates';

export interface PortfolioModeIndicatorProps {
  readonly decision: PortfolioModeDecision;
  readonly revision: number | null;
  readonly provenanceDigest: string | null;
  readonly observedAt: string | null;
  readonly coverage?: {
    readonly activePositions: number;
    readonly valuedPositions: number;
  } | null;
}

export function PortfolioModeIndicator({ decision, revision, provenanceDigest, observedAt, coverage }: PortfolioModeIndicatorProps) {
  const presentation = MODE_PRESENTATION[decision.mode];
  return (
    <span data-testid="portfolio-mode-indicator" style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <span
        data-testid="portfolio-mode"
        role="status"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 8px',
          border: `1px solid ${presentation.colorVar}`,
          borderRadius: '4px',
          color: presentation.colorVar,
          fontSize: '12px',
          fontWeight: 600,
          background: 'var(--color-surface-1)',
        }}
      >
        <span aria-hidden="true">{presentation.symbol}</span>
        <span>{presentation.label}</span>
      </span>
      <span data-testid="portfolio-mode-details" style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
        {`revision ${revision === null ? 'unavailable' : String(revision)}`}
        {' · '}
        {`source digest ${provenanceDigest ? shortDigest(provenanceDigest) : 'unavailable'}`}
        {' · '}
        {`read at ${observedAt ?? 'time unavailable'}`}
        {coverage ? ` · coverage ${coverage.valuedPositions}/${coverage.activePositions} valued` : ' · coverage unavailable'}
        {decision.missing.length > 0 ? ` · missing: ${decision.missing.join('; ')}` : ''}
      </span>
    </span>
  );
}
