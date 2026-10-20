/**
 * Program v3.0 — Phase 10: Reusable Evidence Explorer components (inspection-only).
 * Display governed evidence/snapshot/replay/provenance. No computation or reasoning.
 */
import type { ReactNode } from 'react';
import type { ReplayOutcome, ReplayState } from '../../api/replay';

/** Evidence chain timeline (Decision → Drivers → Metrics → Evidence → Snapshot → Provenance → Replay). */
export function EvidenceTimeline({ steps }: { steps: readonly { label: string; content: ReactNode }[] }) {
  return (
    <ol data-testid="evidence-timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s) => (
        <li key={s.label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-ink-muted)', flex: '0 0 160px', fontWeight: 600 }}>{s.label}</span>
          <span>{s.content}</span>
        </li>
      ))}
    </ol>
  );
}

export function EvidenceRecordCard({ evidence, referenceOnly = false }: {
  referenceOnly?: boolean;
  evidence: { evidenceId: string; engineId: string; recommendation: string; compositeScore: number; confidence: number; calibrationVersion: string; decisionRulesApplied: readonly string[]; generatedAt: string };
}) {
  return (
    <article data-testid="evidence-record-card" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>{referenceOnly ? 'Reference evidence alias' : 'Evidence'} <code>{evidence.evidenceId}</code></strong>
        <span style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>{evidence.generatedAt}</span>
      </div>
      <p style={{ margin: '4px 0' }}>Engine <code>{evidence.engineId}</code> · Recommendation: {evidence.recommendation}</p>
      <p style={{ margin: '4px 0' }}>Composite {evidence.compositeScore} · Confidence {Math.round(evidence.confidence * 100)}% · Calibration <code>{evidence.calibrationVersion}</code></p>
      {evidence.decisionRulesApplied.length > 0 && <p style={{ margin: '4px 0' }}>Rules: {evidence.decisionRulesApplied.join(', ')}</p>}
    </article>
  );
}

export function ProvenanceChain({ items }: { items: readonly { key: string; value: string }[] }) {
  return (
    <div data-testid="provenance-chain" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
      {items.map((it, i) => (
        <span key={it.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span aria-hidden="true" style={{ color: 'var(--color-ink-muted)' }}>→</span>}
          <span><strong>{it.key}</strong>: <code>{it.value}</code></span>
        </span>
      ))}
    </div>
  );
}

export function SnapshotMetadataPanel({ snapshot, referenceOnly = false }: { referenceOnly?: boolean; snapshot: { snapshotId: string; engineId: string; schemaVersion: string; generatedAt: string; verdict: string } }) {
  return (
    <div data-testid="snapshot-metadata-panel" style={{ fontSize: 13 }}>
      <p style={{ margin: '4px 0' }}>{referenceOnly ? 'Reference snapshot alias' : 'Snapshot'} <code>{snapshot.snapshotId}</code></p>
      <p style={{ margin: '4px 0' }}>Engine <code>{snapshot.engineId}</code> · schema <code>{snapshot.schemaVersion}</code></p>
      <p style={{ margin: '4px 0' }}>Generated {snapshot.generatedAt} · verdict {snapshot.verdict}</p>
    </div>
  );
}

const replayLabels: Record<ReplayState, string> = {
  NOT_PERFORMED: 'Replay not performed',
  ORIGINAL_UNAVAILABLE: 'Original unavailable in this process',
  MISSING_CONTEXT: 'Original replay context is missing',
  UNSUPPORTED_VERSION: 'Original evaluator or record version is unsupported',
  EXECUTION_FAILED: 'Independent replay execution failed',
  COMPARISON_FAILED: 'Canonical comparison failed — no difference established',
  COMPLETED_DIFFERENT: 'Different canonical Screen result',
  COMPLETED_EQUIVALENT: 'Equivalent canonical Screen result',
  ORIGINAL_INVALID: 'Original integrity validation failed',
};
export function ReplaySummary({ replay }: { replay: ReplayOutcome }) {
  return (
    <div data-testid="replay-summary" role="status" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, fontSize: 13 }}>
      <strong>{replayLabels[replay.state]}</strong>
      <p data-testid="replay-state">{replay.state}</p>
      {replay.diagnostic && <p>{replay.diagnostic}</p>}
      {replay.attemptId && <p>Attempt <code>{replay.attemptId}</code> (not retained as history)</p>}
      {replay.comparisonScope && <p>Comparison scope: {replay.comparisonScope}. Not snapshot, HTTP, evidence-package or upstream-pipeline byte identity.</p>}
    </div>
  );
}
