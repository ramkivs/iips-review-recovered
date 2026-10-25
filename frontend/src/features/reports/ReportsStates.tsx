/**
 * NP-06 Reports — sanitized presentation states and read-only formatting helpers (CV-51).
 *
 * Every user-visible failure string on the Reports surface originates here (or in the
 * closed `ReportsFailureKind` vocabulary of `src/api/reports.ts`). Raw backend `detail` /
 * `reason` strings, filesystem paths, SQLite errors, and stack traces are never rendered.
 * Missing values render `unavailable` / `—`, never `0` (C-CV51-02).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ReportsApiError } from '../../api/reports';

const BOX_STYLE = {
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: 16,
  background: 'var(--color-surface-1)',
} as const;

/**
 * Renders one sanitized Reports failure with an optional keyboard-accessible `Retry`.
 * `404` remains indistinguishable between missing and non-owned identifiers by design.
 */
export function ReportsStateView({
  error,
  onRetry,
}: {
  error: ReportsApiError;
  onRetry?: () => void;
}) {
  const retry = onRetry !== undefined ? (
    <p style={{ marginTop: 12 }}>
      <button type="button" data-testid="reports-retry" onClick={onRetry}>
        Retry
      </button>
    </p>
  ) : null;
  const backToList = (
    <p style={{ marginTop: 12 }}>
      <Link to="/reports">Back to Reports</Link>
    </p>
  );

  switch (error.kind) {
    case 'not-found':
      return (
        <div data-testid="reports-not-found" role="alert" style={BOX_STYLE}>
          <strong>Report not found</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {backToList}
        </div>
      );
    case 'owner-context-unavailable':
      return (
        <div data-testid="reports-unavailable-owner" role="alert" style={BOX_STYLE}>
          <strong>Reports owner context unavailable</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
    case 'persistence-unavailable':
      return (
        <div data-testid="reports-unavailable-persistence" role="alert" style={BOX_STYLE}>
          <strong>Reports persistence store unavailable</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
    case 'service-unavailable':
      return (
        <div data-testid="reports-unavailable-service" role="alert" style={BOX_STYLE}>
          <strong>Reports service unavailable</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
    case 'network-unavailable':
      return (
        <div data-testid="reports-unavailable-network" role="alert" style={BOX_STYLE}>
          <strong>Reports transport unreachable</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
    case 'invalid-envelope':
      return (
        <div data-testid="reports-invalid-envelope" role="alert" style={BOX_STYLE}>
          <strong>Reports response invalid</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
    case 'invalid-request':
      return (
        <div data-testid="reports-error" role="alert" style={BOX_STYLE}>
          <strong>Invalid report request</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {backToList}
          {retry}
        </div>
      );
    case 'transport-error':
    default:
      return (
        <div data-testid="reports-error" role="alert" style={BOX_STYLE}>
          <strong>Reports transport error</strong>
          <div style={{ marginTop: 4, fontSize: 13 }}>{error.message}</div>
          {retry}
        </div>
      );
  }
}

/** Displays an opaque recorded digest truncated, full value in `title`. Never recomputed. */
export function shortDigest(digest: string): ReactNode {
  const shown = digest.length > 12 ? `${digest.slice(0, 12)}…` : digest;
  return <span title={digest}>{shown}</span>;
}

/**
 * Formats a recorded canonical value verbatim for display. `null`/absent renders
 * `unavailable` (never `0`); numbers and strings are shown exactly as recorded;
 * structured values render as compact JSON text without any transformation of content.
 */
export function formatCanonicalValue(value: unknown): string {
  if (value === null || value === undefined) return 'unavailable';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}
