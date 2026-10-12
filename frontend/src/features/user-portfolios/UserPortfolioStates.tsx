/** User-portfolio display states; values and errors come from the governed transport. */
import type { ReactNode } from 'react';
import {
  ErrorState,
  PermissionDeniedState,
  UnavailableState,
} from '../../components/state/StateComponents';
import type { UserPortfolioApiError } from '../../api/userPortfolios';

/** 404 remains indistinguishable across missing, foreign, tenant-mismatched, or tombstoned IDs. */
export function UserPortfolioNotFoundState() {
  return (
    <div
      data-testid="state-not-found"
      role="alert"
      style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}
    >
      <strong>Portfolio not found</strong>
      <div style={{ marginTop: 4, fontSize: 13 }}>
        No durable portfolio is available for this identifier. Missing, foreign, and removed portfolios are
        indistinguishable by design.
      </div>
    </div>
  );
}

/** Maps transport status onto existing application states without an authentication prompt. */
export function UserPortfolioErrorState({ error }: { error: UserPortfolioApiError }) {
  if (error.status === 401) return <ErrorState message={error.message} />;
  if (error.status === 403) return <PermissionDeniedState />;
  if (error.status === 404) return <UserPortfolioNotFoundState />;
  if (error.status === 503) {
    return (
      <div>
        <UnavailableState reason="User portfolio service unavailable" />
        {error.blocker !== undefined ? (
          <p data-testid="g2-boundary-detail" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-ink-secondary)' }}>
            <strong>Availability detail:</strong> {error.blocker}
          </p>
        ) : null}
      </div>
    );
  }
  return <ErrorState message={error.message} />;
}

/** Formats a market value as Indian Rupees (en-IN); no value is ever fabricated. */
export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formats a percentage with two decimals. */
export function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Displays an opaque digest truncated, with the full value preserved in `title`. Never recomputed. */
export function shortDigest(digest: string): ReactNode {
  const shown = digest.length > 12 ? `${digest.slice(0, 12)}…` : digest;
  return <span title={digest}>{shown}</span>;
}
