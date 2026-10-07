/**
 * Governed Screener application composition — declarative screening workspace.
 *
 * Screen surface for the certified N4 Screen runtime over the governed 13-engine set.
 * The screened population is derived SERVER-SIDE (v1.1.0 Replay Baseline + certified
 * engine executions + governed golden identities); this page collects ONLY the screen
 * definition (definitionId, version, flat-AND predicates) and never supplies, edits,
 * or displays editable membership.
 *
 * Certified predicate vocabulary (frozen governance): field ∈ conviction|quality|growth,
 * operator ∈ lt|lte|gt|gte|eq, operand = decimal text 0–100 (≤6dp), flat AND only.
 * `verdict`, `sector`, `companyId` and raw fundamentals are explicitly non-screenable.
 *
 * States: idle (builder) / loading / error (+retry) / empty (zero matched) / result
 * (status counts + member table + audit footer). Deep-linkable; no auto-fetch.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  decodeScreenLink,
  encodeScreenLink,
  screen,
  ScreenerApiError,
  type ScreenerDefinitionInput,
  type ScreenerResponse,
  type ScreeningField,
  type ScreeningOperator,
} from '../../api/screener';
import { LoadingState, ErrorState, EmptyState, PermissionDeniedState } from '../../components/state/StateComponents';
import { CertifiedBadge, FreshnessBadge } from '../../components/ui/Badges';
import { DataTable } from '../../components/data/DataComponents';

const FIELDS: readonly ScreeningField[] = ['conviction', 'quality', 'growth'];
const OPERATORS: ReadonlyArray<{ value: ScreeningOperator; label: string }> = [
  { value: 'gte', label: '≥ (gte)' },
  { value: 'lte', label: '≤ (lte)' },
  { value: 'gt', label: '> (gt)' },
  { value: 'lt', label: '< (lt)' },
  { value: 'eq', label: '= (eq)' },
];

interface PredicateDraft {
  field: ScreeningField;
  operator: ScreeningOperator;
  operand: string;
}

const EMPTY_ROW: PredicateDraft = { field: 'conviction', operator: 'gte', operand: '' };

function initialDraft(search: string): { definitionId: string; version: string; rows: PredicateDraft[] } {
  const linked = decodeScreenLink(search);
  if (linked) {
    return {
      definitionId: linked.definitionId,
      version: linked.version,
      rows: linked.predicates.length > 0
        ? linked.predicates.map((p) => ({ ...p }))
        : [{ ...EMPTY_ROW }],
    };
  }
  return { definitionId: '', version: '', rows: [{ ...EMPTY_ROW }] };
}

type Phase = 'idle' | 'loading' | 'error' | 'done';

export function Screener() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft] = useState(() => initialDraft(searchParams.toString()));
  const [definitionId, setDefinitionId] = useState(draft.definitionId);
  const [version, setVersion] = useState(draft.version);
  const [rows, setRows] = useState<PredicateDraft[]>(draft.rows);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [response, setResponse] = useState<ScreenerResponse | null>(null);
  const [copied, setCopied] = useState(false);

  function buildDefinition(): ScreenerDefinitionInput {
    return {
      definitionId: definitionId.trim(),
      version: version.trim(),
      predicates: rows
        .filter((r) => r.operand.trim() !== '')
        .map((r) => ({ field: r.field, operator: r.operator, operand: r.operand.trim() })),
    };
  }

  async function runScreen(definition: ScreenerDefinitionInput) {
    setPhase('loading');
    setError(null);
    setCopied(false);
    try {
      const res = await screen(definition);
      setResponse(res);
      setPhase('done');
      // Deep-link the executed definition (replace: no history spam on re-runs).
      setSearchParams(new URLSearchParams(encodeScreenLink(definition).split('?')[1] ?? ''), { replace: true });
    } catch (e) {
      if (e instanceof ScreenerApiError) setError({ status: e.status, message: e.message });
      else setError({ status: 0, message: String(e) });
      setPhase('error');
    }
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    void runScreen(buildDefinition());
  }

  function onCopyLink() {
    const link = `${window.location.origin}${encodeScreenLink(buildDefinition())}`;
    void navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }

  function updateRow(index: number, patch: Partial<PredicateDraft>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  const counts = response
    ? response.result.members.reduce(
        (acc, m) => ({ ...acc, [m.memberResultStatus]: acc[m.memberResultStatus] + 1 }),
        { MATCH: 0, NO_MATCH: 0, INVALID_MEMBER: 0 } as Record<string, number>,
      )
    : null;

  const joined = response
    ? response.result.members.map((m) => ({
        ...m,
        frame: response.execution.members.find(
          (f) => f.sector === m.sector && f.referenceId === m.referenceId,
        ) ?? null,
      }))
    : [];

  return (
    <section aria-label="Governed screener">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Governed Screener</h1>
          <CertifiedBadge />
          <FreshnessBadge state="snapshot" />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Declarative screening over the governed 13-engine set. The screened population is
          derived server-side from the v1.1.0 Replay Baseline — predicates only, flat AND.
        </p>
      </header>

      <form data-testid="screener-form" onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
            Definition ID
            <input
              data-testid="screener-definition-id"
              value={definitionId}
              onChange={(e) => setDefinitionId(e.target.value)}
              required
              autoComplete="off"
              placeholder="e.g. Q3-QUALITY-SCREEN"
            />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
            Version
            <input
              data-testid="screener-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
              autoComplete="off"
              placeholder="e.g. 1"
            />
          </label>
        </div>

        <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 12 }}>
          <legend style={{ fontSize: 13 }}>Predicates (flat AND — all must match)</legend>
          <div style={{ display: 'grid', gap: 8 }}>
            {rows.map((row, i) => (
              <div key={i} data-testid={`predicate-row-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 12 }}>
                  Field
                  <select
                    aria-label={`Predicate ${i + 1} field`}
                    value={row.field}
                    onChange={(e) => updateRow(i, { field: e.target.value as ScreeningField })}
                    style={{ marginLeft: 4 }}
                  >
                    {FIELDS.map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </label>
                <label style={{ fontSize: 12 }}>
                  Operator
                  <select
                    aria-label={`Predicate ${i + 1} operator`}
                    value={row.operator}
                    onChange={(e) => updateRow(i, { operator: e.target.value as ScreeningOperator })}
                    style={{ marginLeft: 4 }}
                  >
                    {OPERATORS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </label>
                <label style={{ fontSize: 12 }}>
                  Operand (0–100, ≤6dp)
                  <input
                    aria-label={`Predicate ${i + 1} operand`}
                    value={row.operand}
                    onChange={(e) => updateRow(i, { operand: e.target.value })}
                    placeholder="e.g. 72.5"
                    autoComplete="off"
                    inputMode="decimal"
                    style={{ marginLeft: 4, width: 110 }}
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remove predicate ${i + 1}`}
                  onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                  disabled={rows.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button type="button" onClick={() => setRows((prev) => [...prev, { ...EMPTY_ROW }])}>
                Add predicate
              </button>
            </div>
          </div>
        </fieldset>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button data-testid="screener-submit" type="submit" disabled={phase === 'loading'}>
            {phase === 'loading' ? 'Screening…' : 'Run screen'}
          </button>
          <button data-testid="screener-copy-link" type="button" onClick={onCopyLink}>
            {copied ? 'Link copied' : 'Copy deep-link'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 20 }} aria-live="polite">
        {phase === 'loading' && <LoadingState />}
        {phase === 'error' && error && (
          <div style={{ display: 'grid', gap: 8 }}>
            {error.status === 401 || error.status === 403 ? (
              <PermissionDeniedState />
            ) : (
              <ErrorState message={`Screen failed (${error.status || 'network'}): ${error.message}`} />
            )}
            <div>
              <button type="button" onClick={() => void runScreen(buildDefinition())}>
                Retry
              </button>
            </div>
          </div>
        )}
        {phase === 'done' && response && response.result.matchedCount === 0 && (
          <EmptyState label={`No members matched this screen (population ${response.result.totalPopulationCount}, invalid ${counts?.INVALID_MEMBER ?? 0}).`} />
        )}
        {phase === 'done' && response && response.result.matchedCount > 0 && (
          <div data-testid="screener-results" style={{ display: 'grid', gap: 12 }}>
            <div data-testid="screener-summary" style={{ fontSize: 13 }}>
              <strong>
                {response.result.matchedCount} of {response.result.totalPopulationCount} matched
              </strong>
              <span style={{ color: 'var(--color-ink-secondary)' }}>
                {' '}· MATCH {counts?.MATCH ?? 0} · NO_MATCH {counts?.NO_MATCH ?? 0} · INVALID_MEMBER {counts?.INVALID_MEMBER ?? 0}
              </span>
            </div>
            <DataTable
              columns={[
                { key: 'sector', header: 'Sector', render: (r: { sector: string }) => r.sector },
                { key: 'referenceId', header: 'Reference ID', render: (r: { referenceId: string }) => <code style={{ fontSize: 12 }}>{r.referenceId}</code> },
                { key: 'status', header: 'Status', render: (r: { memberResultStatus: string }) => r.memberResultStatus },
                { key: 'errorCode', header: 'Error code', render: (r: { memberErrorCode: string }) => r.memberErrorCode || '—' },
                { key: 'engineId', header: 'Engine', render: (r: { frame: { engineId: string } | null }) => r.frame?.engineId ?? '—' },
                { key: 'engineVersion', header: 'Engine v', render: (r: { frame: { engineVersion: string } | null }) => r.frame?.engineVersion ?? '—' },
                { key: 'calibration', header: 'Calibration', render: (r: { frame: { calibrationVersion: string } | null }) => r.frame?.calibrationVersion ?? '—' },
                { key: 'conviction', header: 'Conviction', render: (r: { frame: { convictionText: string } | null }) => r.frame?.convictionText ?? '—' },
                { key: 'quality', header: 'Quality', render: (r: { frame: { qualityText: string } | null }) => r.frame?.qualityText ?? '—' },
                { key: 'growth', header: 'Growth', render: (r: { frame: { growthText?: string; growthAvailability: string } | null }) => r.frame?.growthText ?? r.frame?.growthAvailability ?? '—' },
                { key: 'snapshotId', header: 'Snapshot', render: (r: { frame: { snapshotId: string } | null }) => <code style={{ fontSize: 11 }}>{r.frame?.snapshotId ?? '—'}</code> },
                { key: 'evidenceId', header: 'Evidence', render: (r: { frame: { evidenceId: string } | null }) => <code style={{ fontSize: 11 }}>{r.frame?.evidenceId ?? '—'}</code> },
              ]}
              rows={joined}
              emptyLabel="No member results"
            />
            <footer data-testid="screener-audit" style={{ fontSize: 12, color: 'var(--color-ink-secondary)', display: 'grid', gap: 2 }}>
              <span>resultId <code>{response.result.resultId}</code> · executionId <code>{response.result.executionId}</code> · status {response.result.executionStatus}</span>
              <span>definition <code>{response.execution.definitionId}</code> v<code>{response.execution.version}</code> · digest <code>{response.execution.definitionDigest}</code></span>
              <span>populationIdentity <code>{response.execution.populationIdentity}</code> · members {response.execution.memberCount}</span>
              <span>evaluator {response.execution.evaluatorId} {response.execution.evaluatorVersion} · semantics {response.execution.executionSemanticsVersion}</span>
              <span>vintage {response.vintage.mode} · data {response.vintage.dataVersion} as of {response.vintage.asOf} · source {response.vintage.dataSource} · members {response.vintage.memberCount}</span>
            </footer>
          </div>
        )}
      </div>
    </section>
  );
}
