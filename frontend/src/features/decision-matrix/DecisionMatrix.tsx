/**
 * Program v3.0 — Phase 9: Decision Matrix.
 *
 * PRESENTATIONAL scatter of CERTIFIED axes (Business Quality × Valuation).
 *
 * GOVERNANCE: The platform exposes certified per-company `quality` and `valuation` scores
 * (NormalizedHolding / engine pillars) but NO certified quadrant/band classification object.
 * Therefore this UI POSITIONS the certified scores visually and does NOT compute bands,
 * quadrants, thresholds, or any classification. Valuation is null where the certified engine
 * does not expose it (shown unavailable). No scoring/classification logic in React.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDecisionMatrixData, type DecisionMatrixData, type MatrixCompany } from '../../api/decisionMatrix';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { DecisionBadge } from '../../components/decision/DecisionComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge, FreshnessBadge } from '../../components/ui/Badges';

export function DecisionMatrix() {
  const [data, setData] = useState<DecisionMatrixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MatrixCompany | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDecisionMatrixData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load decision matrix: ${error}`} />;
  if (!data) return <UnavailableState />;

  // Presentational positioning only: map certified (quality, valuation) to x/y pixel positions.
  const positioned = data.companies.map((c) => {
    const q = c.quality ?? 0;
    const v = c.valuation ?? 0;
    return { ...c, x: q, y: v, xNull: c.quality === null, yNull: c.valuation === null };
  });

  return (
    <section aria-label="Decision matrix">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Decision Matrix</h1>
          <CertifiedBadge />
          <FreshnessBadge state={data.provenance.freshness === 'SNAPSHOT' ? 'snapshot' : 'live'} />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>{data.provenance.dataSource}</p>
        <p data-testid="matrix-note" style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          {data.note} Positions represent certified Business Quality and Valuation values. No quadrant classification is applied.
        </p>
      </header>

      <MetricGroup label="Universe">
        <MetricCard label="Sectors" value={data.universe.holdings} />
        <MetricCard label="Avg Conviction" value={data.universe.avgConviction} />
        <MetricCard label="Avg Quality" value={data.universe.avgQuality} />
      </MetricGroup>

      {/* Scatter of certified (quality, valuation) — presentational, no classification bands */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Business Quality × Valuation (certified)</h2>
      <div
        data-testid="matrix-scatter"
        role="group"
        aria-label="Scatter of certified business quality and valuation. Each point is a button; activate to inspect a company."
        style={{ position: 'relative', height: 400, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-1)', overflow: 'hidden' }}
      >
        {/* Axis labels (no bands/quadrants) */}
        <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: 'var(--color-ink-secondary)' }}>
          Business Quality (certified, 0–100)
        </div>
        <div style={{ position: 'absolute', top: '50%', left: 4, transform: 'translateY(-50%) rotate(-90deg)', fontSize: 12, color: 'var(--color-ink-secondary)', transformOrigin: 'left' }}>
          Valuation (certified, 0–100)
        </div>
        {positioned.map((c) => {
          // Position within plot area; null axis -> pin to edge with explicit unavailable marker.
          const px = 60 + (c.xNull ? 0 : (c.x / 100) * 460);
          const py = 40 + (c.yNull ? 320 : (1 - c.y / 100) * 320);
          return (
            <button
              key={c.sector}
              type="button"
              data-testid={`matrix-point-${c.sector}`}
              onClick={() => setSelected(c)}
              title={`${c.sector}: quality ${c.quality ?? 'n/a'}, valuation ${c.valuation ?? 'n/a'}`}
              aria-label={`${c.sector}, quality ${c.quality ?? 'unavailable'}, valuation ${c.valuation ?? 'unavailable'}`}
              style={{
                position: 'absolute', left: px, top: py, transform: 'translate(-50%,-50%)',
                width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--color-surface-0)',
                background: c.yNull ? 'repeating-linear-gradient(45deg,var(--color-border),var(--color-border) 2px,transparent 2px,transparent 4px)' : 'var(--color-status-informational)',
                cursor: 'pointer', padding: 0,
              }}
            />
          );
        })}
      </div>

      {/* Selected-company detail (certified values only) */}
      {selected ? (
        <div data-testid="matrix-selected" style={{ marginTop: 16, border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}>
          <strong><Link to={`/research/company/${selected.sector}`}>{selected.sector}</Link></strong>
          <div style={{ margin: '8px 0' }}><DecisionBadge verdict={selected.verdict} /></div>
          <span>Composite: {selected.composite} · Quality: {selected.quality ?? 'unavailable'} · Valuation: {selected.valuation ?? 'unavailable'}</span>
        </div>
      ) : (
        <p data-testid="matrix-select-hint" style={{ marginTop: 16 }}>Select a point to inspect a company.</p>
      )}

      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {data.provenance.dataSource} · freshness {data.provenance.freshness}
      </p>
    </section>
  );
}
