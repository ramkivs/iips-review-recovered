/**
 * G-2 Durable User Portfolios — UI state components (read-only consumer).
 *
 * Reuses the platform design system (`components/state/StateComponents`) —
 * no IPD visual copy, no second design language. Every failure mode the G-2
 * transport can answer with maps onto an existing platform state; nothing is
 * invented, fabricated, or retried around.
 *
 * Opaque digests (`provenanceDigest`, `lineageDigest`) are displayed verbatim,
 * truncated for layout only; the full value stays available via `title`.
 * They are never hashed, recomputed, compared, or adjudicated client-side.
 */
import type { ReactNode } from 'react';
import {
  ErrorState,
  PermissionDeniedState,
  UnavailableState,
} from '../../components/state/StateComponents';
import type { UserPortfolioApiError } from '../../api/userPortfolios';

/**
 * 401 — the durable user-portfolio surfaces are authenticated reads. When the
 * platform has no live session the top bar carries the platform Sign-in
 * control (`topbar-login`); this state points at it and never builds a second
 * authentication mechanism.
 */
export function AuthenticationRequiredState() {
  return (
    <div
      data-testid="state-authentication-required"
      role="alert"
      style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}
    >
      <strong>Authentication required</strong>
      <div style={{ marginTop: 4, fontSize: 13 }}>
        Your durable user portfolios are an authenticated read. Use the Sign in control in the top bar to
        authenticate, then return to this page.
      </div>
    </div>
  );
}

/** 404 — missing, foreign, tenant-mismatched, or tombstoned are indistinguishable by design. */
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

/**
 * Maps the typed client error onto the platform state vocabulary:
 *   0   → ErrorState (network fault — the transport could not be reached)
 *   401 → AuthenticationRequiredState
 *   403 → PermissionDeniedState
 *   404 → UserPortfolioNotFoundState
 *   503 → UnavailableState, with the G-2 boundary blocker surfaced as an
 *         explicit, clearly-labeled governance note (testid `g2-boundary-detail`)
 *   *   → ErrorState (fault; never data)
 */
export function UserPortfolioErrorState({ error }: { error: UserPortfolioApiError }) {
  if (error.status === 401) return <AuthenticationRequiredState />;
  if (error.status === 403) return <PermissionDeniedState />;
  if (error.status === 404) return <UserPortfolioNotFoundState />;
  if (error.status === 503) {
    return (
      <div>
        <UnavailableState reason="User portfolio service unavailable" />
        {error.blocker !== undefined ? (
          <p data-testid="g2-boundary-detail" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-ink-secondary)' }}>
            <strong>G-2 boundary:</strong> {error.blocker}
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
