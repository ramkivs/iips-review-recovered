/** User-portfolio display states; values and errors come from the governed transport. */
import type { ReactNode } from 'react';
import {
  ErrorState,
  PermissionDeniedState,
  UnavailableState,
} from '../../components/state/StateComponents';
import type { ReadUnavailableReason, UserPortfolioApiError } from '../../api/userPortfolios';

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

/**
 * Human-readable expansion of a fail-closed diagnosis.
 *
 * These state the *local* startup condition only. They never name an owner, tenant, principal or
 * path, and never suggest that data was lost — an unreachable service is not an empty portfolio.
 */
const DIAGNOSIS_TEXT: Readonly<Record<ReadUnavailableReason, string>> = Object.freeze({
  'binding-precondition-absent':
    'The IRR server is not configured to read durable portfolios: the owner-binding precondition is absent.',
  'ipc-endpoint-not-configured':
    'The IRR server has no IPD user-portfolio endpoint configured, so no portfolio can be read.',
  'ipc-endpoint-unreachable':
    'The IPD user-portfolio service is configured but did not answer. Start IPD and check its endpoint.',
});

/** The settings an operator must set for the read path to come up. */
export function ReadUnavailableDetail({ error }: { error: UserPortfolioApiError }) {
  const diagnosis = error.diagnosis;
  if (diagnosis === undefined) return null;
  return (
    <div data-testid="read-unavailable-diagnosis" style={{ marginTop: 8, fontSize: 13 }}>
      <p style={{ margin: 0 }}>{DIAGNOSIS_TEXT[diagnosis.reason]}</p>
      {diagnosis.requiredSettings.length > 0 ? (
        <p style={{ margin: '4px 0 0' }}>
          Required server settings:{' '}
          {diagnosis.requiredSettings.map((setting, index) => (
            <span key={setting}>
              {index > 0 ? ', ' : ''}
              <code>{setting}</code>
            </span>
          ))}
        </p>
      ) : null}
      <p style={{ margin: '4px 0 0', color: 'var(--color-ink-secondary)' }}>
        This is a configuration state, not an empty portfolio. No data was read, so none is shown.
      </p>
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
        <ReadUnavailableDetail error={error} />
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

/**
 * Formats a weight-allocation percentage with four decimals.
 *
 * The summary must never round an allocation up to a tidy 100%: the stored value
 * is the authoritative one, and four decimals preserve an incomplete allocation
 * exactly as IPD stored it.
 */
export function formatPct4(value: number): string {
  return `${value.toFixed(4)}%`;
}

/** Displays an opaque digest truncated, with the full value preserved in `title`. Never recomputed. */
export function shortDigest(digest: string): ReactNode {
  const shown = digest.length > 12 ? `${digest.slice(0, 12)}…` : digest;
  return <span title={digest}>{shown}</span>;
}
