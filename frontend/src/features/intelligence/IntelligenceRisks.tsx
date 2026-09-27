/**
 * Program v3.0 — NP-18: Intelligence — Risks (Portfolio Risk view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are — they
 * are not re-created, re-implemented, widened or altered here.
 *
 * CERTIFIED AGGREGATES ONLY — this surface renders exactly four things, 1:1 from the payload
 * and in the payload's own words:
 *   portfolio.avgRisk · diversification.flags · correlation.flags ·
 *   correlation.concentrationSectors
 * Nothing else is shown. There is NO per-company risk, NO per-sector risk and NO newly
 * calculated risk: no risk value is derived, re-weighted, scaled, scored, banded or
 * classified here, and no company-level or sector-level risk figure is exposed or inferred.
 * The allocation detail carried elsewhere in the certified model is deliberately not
 * surfaced by this view.
 *
 * Rules honoured: 1:1 payload mapping; certified order and wording preserved verbatim; a
 * certified `null` renders "unavailable" and is never turned into zero; the certified
 * provenance and its SNAPSHOT marker are shown verbatim and no current/streaming claim is
 * made; no new payload type, no new server route, no durable storage, no external data
 * source and no static sample data is introduced; no recomputation, normalization,
 * percentile, threshold, score, ordering or classification logic exists here; no sector is
 * hardcoded; no recommendation or interpretation is added beyond the payload.
 */
import { useEffect, useState } from 'react';
import { fetchCrossSectorData, type CrossSectorData } from '../../api/crossSector';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge } from '../../components/ui/Badges';

export function IntelligenceRisks() {
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
  if (error) return <ErrorState message={`Unable to load portfolio risk: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { portfolio, diversification, correlation, provenance } = data;

  return (
    <section aria-label="Intelligence risks">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Risks</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Portfolio Risk framing view — presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      <p
        data-testid="risks-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        Aggregate portfolio risk only, taken 1:1 from the certified payload. No per-company risk, no
        per-sector risk and no newly calculated risk is shown or derived; certified values and their
        wording are never recomputed, re-based, re-banded or reclassified.
      </p>

      <MetricGroup label="Portfolio Risk">
        <MetricCard label="Avg Risk" value={portfolio.avgRisk} />
      </MetricGroup>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Diversification Flags</h2>
      <ul data-testid="risks-diversification-flags" style={{ paddingLeft: 20 }}>
        {diversification.flags.length > 0
          ? diversification.flags.map((f) => <li key={f}>{f}</li>)
          : <li>No certified diversification flags</li>}
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Correlation Flags</h2>
      <ul data-testid="risks-correlation-flags" style={{ paddingLeft: 20 }}>
        {correlation.flags.length > 0
          ? correlation.flags.map((f) => <li key={f}>{f}</li>)
          : <li>No certified correlation flags</li>}
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Concentration Sectors</h2>
      <ul data-testid="risks-concentration-sectors" style={{ paddingLeft: 20 }}>
        {correlation.concentrationSectors.length > 0
          ? correlation.concentrationSectors.map((s) => <li key={s}>{s}</li>)
          : <li>No certified concentration sectors</li>}
      </ul>

      <p data-testid="risks-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} · freshness {provenance.freshness} · mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
