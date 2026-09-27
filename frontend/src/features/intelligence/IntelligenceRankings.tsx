/**
 * Program v3.0 — NP-18: Intelligence — Rankings (Ordered Comparison view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are — they
 * are not re-created, re-implemented, widened or altered here.
 *
 * ORDERED COMPARISON — THE CERTIFIED ORDER IS THE PRODUCT:
 *   rows are rendered in the exact array order the certified payload supplies. The view never
 *   re-sorts, never re-ranks, never computes a position or ordinal, and never derives a
 *   comparison beyond presenting the certified slice as given.
 *
 * RELATIONSHIP TO THE OTHER FRAMINGS (stated explicitly, not implied): this view renders the
 * SAME certified `RankedOpportunity[]` slice that the Opportunities surface presents as its
 * top-N subset. One certified slice, three framings — not three datasets, and not three
 * sources of truth.
 *
 * Rules honoured: 1:1 payload mapping; certified order preserved verbatim; a certified `null`
 * renders "unavailable" and is never turned into zero; the certified provenance and its
 * SNAPSHOT marker are shown verbatim and no current/streaming claim is made; no new payload
 * type, no new server route, no durable storage, no external data source and no static sample
 * data is introduced; no recomputation, normalization, percentile, threshold, score, ordering
 * or classification logic exists here; no sector is hardcoded; no recommendation or
 * interpretation is added beyond the payload.
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

type RankingRow = CrossSectorData['ranking'][number];

export function IntelligenceRankings() {
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
  if (error) return <ErrorState message={`Unable to load rankings: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { ranking, provenance } = data;

  return (
    <section aria-label="Intelligence rankings">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Rankings</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Ordered Comparison framing view — presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      <p
        data-testid="rankings-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        The full certified <code>RankedOpportunity[]</code> slice, in the certified order supplied by the
        payload: rows are never re-sorted and no position is derived here. The{' '}
        <Link to="/intelligence/opportunities">Opportunities</Link> view presents the top-N subset of this
        same slice — one certified dataset, two framings.
      </p>

      <DataTable
        columns={[
          { key: 'companyId', header: 'Company', render: (r: RankingRow) => r.companyId },
          {
            key: 'sector',
            header: 'Sector',
            render: (r: RankingRow) => (
              <Link to={`/research/company/${r.sector}`}>{r.sector}</Link>
            ),
          },
          { key: 'conviction', header: 'Certified Conviction', render: (r: RankingRow) => certified(r.conviction) },
        ]}
        rows={ranking}
        emptyLabel="No certified ranking available"
      />

      <p data-testid="rankings-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} · freshness {provenance.freshness} · mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
