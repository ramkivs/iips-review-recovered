/**
 * NP-06 Reports — `/reports/:reportId` durable artifact & supersession inspector (CV-51).
 *
 * Renders one persisted `CanonicalReportArtifact` version and its supersession chain
 * through the four ordered NP-06 D8 / §5.6 progressive-disclosure levels:
 *   (1) Summary, (2) Detail, (3) Evidence & Provenance, (4) Replay & Reference.
 * Recorded values are rendered verbatim; nothing is recomputed client-side. Loading is
 * race-safe: a monotonic generation counter ensures a stale response for a previously
 * viewed version can never overwrite the version now addressed. Read-only by
 * construction — version switching is navigation (`<Link>`) only; no write control exists.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchReportArtifact,
  fetchReportArtifacts,
  fetchReportSupersession,
  ReportsApiError,
  type ReportArtifactView,
  type ReportSupersessionView,
} from '../../api/reports';
import { LoadingState } from '../../components/state/StateComponents';
import { DataTable, type Column } from '../../components/data/DataComponents';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badges';
import { ReportsStateView, formatCanonicalValue, shortDigest } from './ReportsStates';

interface DetailData {
  readonly artifact: ReportArtifactView;
  readonly supersession: ReportSupersessionView;
}

function toReportsError(e: unknown): ReportsApiError {
  return e instanceof ReportsApiError ? e : new ReportsApiError('transport-error', 0);
}

const MONOSPACE = { fontFamily: 'ui-monospace, monospace', overflowWrap: 'anywhere' } as const;

function DefinitionList({ rows }: { rows: readonly { term: string; value: React.ReactNode }[] }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 220px) 1fr', gap: '6px 16px', fontSize: 13 }}>
      {rows.map((row) => (
        <div key={row.term} style={{ display: 'contents' }}>
          <dt style={{ color: 'var(--color-ink-secondary)' }}>{row.term}</dt>
          <dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Verbatim payload projection: scalars as recorded (`null` → `unavailable`), structures as text. */
function PayloadFields({ payload }: { payload: unknown }) {
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    const entries = Object.entries(payload as Record<string, unknown>);
    if (entries.length === 0) return <p style={{ fontSize: 13 }}>No payload fields recorded.</p>;
    return (
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table data-testid="report-payload-table" style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid var(--color-border)' }}>Field</th>
              <th scope="col" style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid var(--color-border)' }}>Recorded Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, value]) => (
              <tr key={name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 8 }}>{name}</td>
                <td style={{ padding: 8, overflowWrap: 'anywhere' }}>
                  {value !== null && typeof value === 'object' ? (
                    <code style={MONOSPACE}>{JSON.stringify(value)}</code>
                  ) : (
                    formatCanonicalValue(value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <p style={{ fontSize: 13 }}>
      <code style={MONOSPACE}>{formatCanonicalValue(payload)}</code>
    </p>
  );
}

export function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState<ReportsApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const generationRef = useRef(0);

  useEffect(() => {
    const generation = ++generationRef.current;
    setData(null);
    setError(null);
    if (reportId === undefined || reportId.length === 0) {
      setError(new ReportsApiError('invalid-request', 400));
      return;
    }
    void (async () => {
      try {
        const [artifact, ownChain] = await Promise.all([
          fetchReportArtifact(reportId),
          fetchReportSupersession(reportId),
        ]);
        // The governed supersession endpoint walks the chain ending at the requested
        // version, so lifecycle posture is resolved against the current-head list
        // (`GET /api/reports/artifacts` returns heads only): a version is the current
        // head iff it appears there. For a superseded version, its head is the listed
        // head whose chain contains it. Read-only GETs only; fail closed if the chain
        // cannot be established from governed responses.
        const heads: ReportArtifactView[] = [];
        let cursor: string | null = null;
        for (let page = 0; page < 200; page += 1) {
          const result = await fetchReportArtifacts({ limit: 25, cursor });
          heads.push(...result.items);
          cursor = result.nextCursor;
          if (cursor === null) break;
          if (page === 199) throw new ReportsApiError('invalid-envelope', 200);
        }
        let supersession = ownChain;
        if (!heads.some((head) => head.reportId === artifact.reportId)) {
          let resolved: ReportSupersessionView | null = null;
          for (const head of heads) {
            const candidate = await fetchReportSupersession(head.reportId);
            if (candidate.history.some((item) => item.reportId === artifact.reportId)) {
              resolved = candidate;
              break;
            }
          }
          if (resolved === null) throw new ReportsApiError('invalid-envelope', 200);
          supersession = resolved;
        }
        if (generation !== generationRef.current) return; // stale version load — discard
        setData({ artifact, supersession });
      } catch (e) {
        if (generation !== generationRef.current) return; // stale failure — discard
        setError(toReportsError(e));
      }
    })();
    return () => {
      generationRef.current += 1; // invalidate in-flight loads when the addressed version changes
    };
  }, [reportId, retryCount]);

  const backLink = (
    <p style={{ fontSize: 13 }}>
      <Link to="/reports">← Back to Reports</Link>
    </p>
  );

  if (error !== null) {
    return (
      <section aria-label="Report detail">
        {backLink}
        <h1>Report</h1>
        <ReportsStateView
          error={error}
          onRetry={error.kind === 'not-found' || error.kind === 'invalid-request' ? undefined : () => setRetryCount((n) => n + 1)}
        />
      </section>
    );
  }
  if (data === null) {
    return (
      <section aria-label="Report detail">
        {backLink}
        <h1>Report</h1>
        <LoadingState />
      </section>
    );
  }

  const { artifact, supersession } = data;
  const isCurrentHead = supersession.current.reportId === artifact.reportId;
  const lineage: readonly ReportArtifactView[] = [supersession.current, ...supersession.history];
  const parameters = artifact.parameters;
  const parameterEntries = parameters === null ? [] : Object.entries(parameters);

  const lineageColumns: readonly Column<ReportArtifactView>[] = [
    { key: 'version', header: 'Version', render: (row) => `v${row.artifactVersion}` },
    {
      key: 'reportId',
      header: 'Report ID',
      render: (row) => (
        <Link to={`/reports/${encodeURIComponent(row.reportId)}`} data-testid={`report-version-link-${row.reportId}`}>
          <code style={MONOSPACE}>{row.reportId}</code>
        </Link>
      ),
    },
    { key: 'generatedAt', header: 'Generated At', render: (row) => row.generatedAt },
    { key: 'reportKey', header: 'Report Key', render: (row) => shortDigest(row.reportKey) },
    {
      key: 'role',
      header: 'Lifecycle Role',
      render: (row) =>
        row.reportId === supersession.current.reportId ? (
          <StatusBadge status="positive" label="CURRENT HEAD" />
        ) : (
          <StatusBadge status="informational" label="SUPERSEDED" />
        ),
    },
  ];

  return (
    <section aria-label="Report detail">
      {backLink}
      <h1>Report — {artifact.reportType}</h1>
      <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <PlatformBadge />
        {isCurrentHead ? (
          <StatusBadge status="positive" label="CURRENT HEAD" />
        ) : (
          <StatusBadge status="informational" label="SUPERSEDED" />
        )}
      </p>
      {!isCurrentHead ? (
        <p data-testid="report-superseded-banner" style={{ fontSize: 13 }}>
          This version has been superseded.{' '}
          <Link to={`/reports/${encodeURIComponent(supersession.current.reportId)}`}>
            View current head (v{supersession.current.artifactVersion})
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="report-summary-heading" data-testid="report-section-summary">
        <h2 id="report-summary-heading">Summary</h2>
        <DefinitionList
          rows={[
            { term: 'Report Type', value: artifact.reportType },
            { term: 'Generated At (UTC)', value: artifact.generatedAt },
            { term: 'Artifact Version', value: `v${artifact.artifactVersion}` },
            { term: 'Canonical Schema', value: `v${artifact.schemaVersion}` },
            { term: 'Portfolio ID', value: artifact.portfolioId },
            {
              term: 'Ownership Scope',
              value: 'Single-owner governed partition (NP-06 · server-owned carrier)',
            },
            { term: 'Lifecycle Status', value: isCurrentHead ? 'CURRENT HEAD' : 'SUPERSEDED' },
          ]}
        />
      </section>

      <section aria-labelledby="report-detail-heading" data-testid="report-section-detail">
        <h2 id="report-detail-heading">Detail</h2>
        <DefinitionList
          rows={[
            { term: 'Scenario', value: artifact.scenario ?? 'unavailable' },
            {
              term: 'Parameters',
              value:
                parameterEntries.length === 0
                  ? 'No parameters recorded'
                  : parameterEntries.map(([name, value]) => `${name}: ${formatCanonicalValue(value)}`).join('; '),
            },
          ]}
        />
        <p style={{ fontSize: 13 }}>
          <strong>Canonical payload (recorded verbatim; never recomputed in the browser):</strong>
        </p>
        <PayloadFields payload={artifact.payload} />
        <details data-testid="report-payload-raw">
          <summary>Raw canonical payload</summary>
          <pre style={{ ...MONOSPACE, whiteSpace: 'pre-wrap', fontSize: 12 }}>{artifact.canonicalPayloadText}</pre>
        </details>
      </section>

      <section aria-labelledby="report-provenance-heading" data-testid="report-section-provenance">
        <h2 id="report-provenance-heading">Evidence &amp; Provenance</h2>
        <DefinitionList
          rows={[
            {
              term: 'Originating CSIP Engine Output ID',
              value: <code style={MONOSPACE}>{artifact.provenance.engineOutputId}</code>,
            },
            {
              term: 'Report Key (deterministic content identity, recorded)',
              value: <code style={MONOSPACE}>{artifact.reportKey}</code>,
            },
            {
              term: 'Immediate Predecessor',
              value:
                artifact.supersedesReportId === null ? (
                  'None (initial v1 instance)'
                ) : (
                  <Link to={`/reports/${encodeURIComponent(artifact.supersedesReportId)}`}>
                    <code style={MONOSPACE}>{artifact.supersedesReportId}</code>
                  </Link>
                ),
            },
            ...artifact.provenance.entries.map((entry) => ({
              term: `Provenance — ${entry.name}`,
              value: <code style={MONOSPACE}>{formatCanonicalValue(entry.value)}</code>,
            })),
          ]}
        />
        <p style={{ fontSize: 13 }}>
          <strong>Supersession lineage (newest to oldest):</strong>
        </p>
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <DataTable columns={lineageColumns} rows={lineage} emptyLabel="No supersession lineage recorded." />
        </div>
      </section>

      <section aria-labelledby="report-reference-heading" data-testid="report-section-reference">
        <h2 id="report-reference-heading">Replay &amp; Reference</h2>
        <DefinitionList
          rows={[
            { term: 'Instance Handle (reportId)', value: <code style={MONOSPACE}>{artifact.reportId}</code> },
            { term: 'Version Handle (artifactVersion)', value: `v${artifact.artifactVersion}` },
            { term: 'Canonical Route', value: <code style={MONOSPACE}>{`/reports/${artifact.reportId}`}</code> },
          ]}
        />
        <p style={{ fontSize: 13 }}>
          <strong>Versions:</strong>{' '}
          {lineage.map((version, index) => (
            <span key={version.reportId}>
              {index > 0 ? ' · ' : ''}
              <Link to={`/reports/${encodeURIComponent(version.reportId)}`}>
                View v{version.artifactVersion}
                {version.reportId === supersession.current.reportId ? ' (current head)' : ''}
              </Link>
            </span>
          ))}
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          Replay &amp; reference on NP-06 addresses persisted canonical report versions by durable
          (reportId, artifactVersion) in the governed NP-04 store. It does not re-execute sector or
          CSIP engines, and it does not generate PDF, CSV, or other file exports.
        </p>
      </section>
    </section>
  );
}
