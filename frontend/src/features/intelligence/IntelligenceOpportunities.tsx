/**
 * Program v3.0 — NP-18: Intelligence — Opportunities (Discovery / Action view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are — they
 * are not re-created, re-implemented, widened or altered here.
 *
 * SUBSET RELATIONSHIP — STATED EXPLICITLY (this is the entire point of the surface):
 *   the rows below are the TOP-N SUBSET of the SAME certified `RankedOpportunity[]` slice
 *   that the Rankings surface renders in full.
 *   It is NOT an independent dataset, NOT a second source of truth, and NOT a new
 *   intelligence capability. Every row shown here is also contained in the Rankings view;
 *   nothing is recalculated, extended or invented. The framings are three views of one
 *   certified slice, not three datasets.
 *
 * Rules honoured: 1:1 payload mapping; certified order preserved verbatim (never re-sorted);
 * a certified `null` renders "unavailable" and is never turned into zero; the certified
 * provenance and its SNAPSHOT marker are shown verbatim and no current/streaming claim is
 * made; no new payload type, no new server route, no durable storage, no external data
 * source and no static sample data is introduced; no recomputation, normalization,
 * percentile, threshold, score, ordering or classification logic exists here; no sector is
 * hardcoded; no recommendation or interpretation is added beyond the payload.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCrossSectorData, type CrossSectorData } from '../../api/crossSector';
import { DataTable } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge } from '../../components/ui/Badges';

/** A certified `null` is shown as "unavailable" — never as 0, never invented. */
function certified(value: number | null | undefined): string {
  return value === null || value === undefined ? 'unavailable' : String(value);
}

type OpportunityRow = CrossSectorData['opportunity'][number];

export function IntelligenceOpportunities() {
  const [data, setData] = useState<CrossSectorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCrossSectorData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load opportunities: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { opportunity, provenance } = data;

  return (
    <section aria-label="Intelligence opportunities">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Opportunities</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Discovery / Action framing view — presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      {/* The subset relationship is declared before the rows, not implied by them. */}
      <p
        data-testid="opportunities-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        These rows are the <strong>top-N subset of the same <code>RankedOpportunity[]</code></strong> used by
        the <Link to="/intelligence/rankings">Rankings</Link> view, which renders that same certified slice in
        full. This is not an independent dataset. Certified order is preserved verbatim and nothing here is
        recomputed.
      </p>

      <DataTable
        columns={[
          { key: 'companyId', header: 'Company', render: (r: OpportunityRow) => r.companyId },
          {
            key: 'sector',
            header: 'Sector',
            render: (r: OpportunityRow) => (
              <Link to={`/research/company/${r.sector}`}>{r.sector}</Link>
            ),
          },
          { key: 'conviction', header: 'Certified Conviction', render: (r: OpportunityRow) => certified(r.conviction) },
        ]}
        rows={opportunity}
        emptyLabel="No certified opportunities available"
      />

      <p data-testid="opportunities-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} · freshness {provenance.freshness} · mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
