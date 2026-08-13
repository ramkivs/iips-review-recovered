/**
 * Program v3.0 — Phase 7: Company Intelligence workspace.
 *
 * Route: /research/company/:id. Answers "What does the certified platform say about this
 * company, why, and can I verify/replay it?"
 *
 * GOVERNANCE: every displayed value has a traceable certified source. No frontend analytical
 * calculation. Pillar sections (Business Quality/Growth/Valuation/Risk) show "unavailable"
 * where the certified engine does NOT expose them (all sectors except Technology) — never
 * fabricated or derived. Certified input metrics are shown as SNAPSHOT inputs (traceable).
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCompanyData, type CompanyData } from '../../api/company';
import { CompanyHeader } from '../../components/company/CompanyHeader';
import { MetricGroup, MetricCard, DataTable } from '../../components/data/DataComponents';
import { EvidenceCard } from '../../components/evidence/EvidenceComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { StatusBadge } from '../../components/ui/Badges';

export function CompanyIntelligence() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchCompanyData(id)
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load company data: ${error}`} />;
  if (!data) return <UnavailableState />;

  const pillarEntries = data.pillars ? Object.entries(data.pillars).map(([k, v]) => ({ key: k, value: v })) : null;

  return (
    <section aria-label="Company intelligence">
      <CompanyHeader
        companyName={`${data.sector} (reference)`}
        sector={data.sector}
        verdict={data.decision.verdict}
        composite={data.decision.composite}
        confidence={data.decision.confidence}
        freshness={data.provenance.freshness}
        subLabel={data.resolvedSubsegment ? `${data.resolvedSubsegment}${data.resolvedArchetype ? ` · ${data.resolvedArchetype}` : ''}` : null}
      />

      {/* Overrides */}
      {data.overrides.length > 0 && (
        <MetricGroup label="Overrides Applied">
          <ul data-testid="company-overrides" style={{ paddingLeft: 20 }}>
            {data.overrides.map((o) => <li key={o}><StatusBadge status="warning" label={o} /></li>)}
          </ul>
        </MetricGroup>
      )}

      {/* Pillars — only where the certified engine exposes them; else unavailable (no fabrication). */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Business Quality / Growth / Valuation / Risk</h2>
      {pillarEntries ? (
        <MetricGroup label="Certified pillar scores">
          {pillarEntries.map((p) => (
            <MetricCard key={p.key} label={p.key} value={p.value} direction={p.value >= 60 ? 'positive' : p.value >= 40 ? 'neutral' : 'negative'} />
          ))}
        </MetricGroup>
      ) : (
        <div data-testid="pillars-unavailable" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}>
          Pillar scores are not exposed by the certified engine for this sector. They are shown as unavailable rather than derived in the frontend.
        </div>
      )}

      {/* Certified input metrics (traceable, SNAPSHOT inputs) */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Company Inputs (SNAPSHOT)</h2>
      <DataTable
        columns={[
          { key: 'key', header: 'Metric', render: (r: { key: string }) => r.key },
          { key: 'value', header: 'Value', render: (r: { key: string; value: unknown }) => (typeof r.value === 'number' ? r.value : String(r.value ?? 'unavailable')) },
        ]}
        rows={data.inputs}
        emptyLabel="No input metrics available"
      />

      {/* Evidence + replay entry */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Evidence &amp; Replay</h2>
      <div data-testid="company-evidence" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        <EvidenceCard reference={data.evidence} />
      </div>
      <p style={{ marginTop: 8 }}>
        <Link to={`/evidence/replay/${data.sector}`}>Open replay for this company →</Link>
      </p>

      {/* Provenance */}
      <p data-testid="company-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {data.provenance.dataSource} · freshness {data.provenance.freshness}
      </p>
    </section>
  );
}
