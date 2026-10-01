/**
 * Program v3.0 — NP-13: Decision Evidence landing (`/evidence`).
 *
 * Governed by docs/integration/IIPS_v3.0_NP13_EVIDENCE_LANDING_NAVIGATION_IA_GOVERNANCE_DECISION.md
 * (NP-13-AUTH-01: decisions D1–D6, implementation constraints IB-1…IB-8).
 *
 * A strictly READ-ONLY index into the EXISTING governed evidence subjects. It renders the subjects
 * returned by ONE existing governed read and links each to the existing `/evidence/:id` detail
 * surface, which remains authoritative.
 *
 * What this surface is NOT (D6): no persistence, no per-user or user-owned state, no history or
 * archive, no claim of live replay, no replay execution, no evidence generation. It performs a single
 * read and renders it; it computes, ranks, enriches and invents nothing.
 *
 * Data source (D3): the existing typed client `fetchExecutiveData()`; its `decisions` carry the complete
 * governed subject set under the sector-name identity. The `opportunity` arrays are deliberately NOT
 * used — they are filtered subsets (they omit governed subjects) and are not an enumeration.
 *
 * Identity (D2, §5.1): links target the SECTOR NAME, which is the identity the existing `/evidence/:id`
 * resolver actually resolves. There is no `ev_*` route identity and no identity bridge.
 *
 * Fail closed (D2): a failed read renders the existing error state; an empty, partial or malformed read
 * renders the existing unavailable state. A partial or empty index is never presented as a success.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchExecutiveData, type DecisionSummary, type ExecutiveData } from '../../api/executive';
import { DataTable } from '../../components/data/DataComponents';
import { DecisionBadge } from '../../components/decision/DecisionComponents';
import { ErrorState, LoadingState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge, FreshnessBadge } from '../../components/ui/Badges';

type FreshnessState = 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay';

/** The existing governed freshness vocabulary -> the existing FreshnessBadge states (no reinterpretation). */
const FRESHNESS_STATE = new Map<string, FreshnessState>([
  ['LIVE', 'live'],
  ['SNAPSHOT', 'snapshot'],
  ['STALE', 'stale'],
  ['UNAVAILABLE', 'unavailable'],
  ['REPLAY', 'replay'],
]);

interface EvidenceIndex {
  readonly subjects: readonly DecisionSummary[];
  readonly freshness: FreshnessState;
  readonly freshnessLabel: string;
  readonly dataSource: string;
}

/**
 * Accept ONLY a complete, well-formed governed read. Anything else (missing/empty/malformed decisions,
 * a subject without an identity, duplicate subjects, missing or unknown provenance) yields `null`, which
 * renders the unavailable state — never a partial index and never an empty "success".
 */
function toEvidenceIndex(data: ExecutiveData | null): EvidenceIndex | null {
  if (!data || !Array.isArray(data.decisions) || data.decisions.length === 0) return null;
  const seen = new Set<string>();
  for (const d of data.decisions) {
    if (!d || typeof d.sector !== 'string' || d.sector.trim() === '' || seen.has(d.sector)) return null;
    if (typeof d.verdict !== 'string' || d.verdict === '') return null;
    seen.add(d.sector);
  }
  const p = data.provenance;
  if (!p || typeof p.freshness !== 'string' || typeof p.dataSource !== 'string') return null;
  const freshness = FRESHNESS_STATE.get(p.freshness);
  if (freshness === undefined) return null;
  return { subjects: data.decisions, freshness, freshnessLabel: p.freshness, dataSource: p.dataSource };
}

export function EvidenceLanding() {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchExecutiveData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load decision evidence: ${error}`} />;
  const index = toEvidenceIndex(data);
  if (!index) return <UnavailableState reason="Decision evidence unavailable" />;

  return (
    <section aria-label="Decision evidence" data-testid="evidence-landing">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Decision Evidence</h1>
          <CertifiedBadge />
          <FreshnessBadge state={index.freshness} />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>{index.dataSource}</p>
      </header>

      <p style={{ margin: '0 0 12px', fontSize: 13 }}>Select a governed subject to open its evidence record.</p>

      <div data-testid="evidence-landing-index">
        <DataTable
          columns={[
            {
              key: 'subject',
              header: 'Evidence subject',
              render: (d: DecisionSummary) => (
                <Link to={`/evidence/${encodeURIComponent(d.sector)}`} data-testid={`evidence-subject-${d.sector}`}>{d.sector}</Link>
              ),
            },
            { key: 'decision', header: 'Certified decision', render: (d: DecisionSummary) => <DecisionBadge verdict={d.verdict} /> },
          ]}
          rows={index.subjects}
        />
      </div>

      <p data-testid="evidence-landing-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {index.dataSource} · freshness {index.freshnessLabel}
      </p>
    </section>
  );
}
