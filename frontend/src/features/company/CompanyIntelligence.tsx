/**
 * Program v3.0 — Phase 7 (+ N+5): Company Intelligence workspace.
 *
 * Route: /research/company/:id. Answers "What does the certified platform say about this
 * company, why, and can I verify/replay it?" — now as a complete governed trust chain:
 *   Decision (header) → Evidence (why) → Replay (reproducible) → Provenance.
 *
 * N+5: composes the THREE guarded read endpoints client-side (/api/company, /api/evidence,
 * /api/replay) into one surface. Sector is the only variable; no sector-specific logic,
 * no recomputation, no fabrication. Pillars/confidence show "unavailable" where the
 * certified source does not provide them (all sectors except Technology for pillars).
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCompanyData, type CompanyData } from '../../api/company';
import { fetchEvidenceData, type EvidenceData } from '../../api/evidence';
import { fetchReplayData, type ReplayData } from '../../api/replay';
import { CompanyHeader } from '../../components/company/CompanyHeader';
import { MetricGroup, MetricCard, DataTable } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { StatusBadge } from '../../components/ui/Badges';
import { CompanyTrustChain } from './CompanyTrustChain';

export function CompanyIntelligence() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [evidence, setEvidence] = useState<EvidenceData | null>(null);
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    // N+5: three-call governed composition (Bearer propagated via authFetch in each client).
    Promise.all([fetchCompanyData(id), fetchEvidenceData(id), fetchReplayData(id)])
      .then(([c, e, r]) => {
        if (active) { setCompany(c); setEvidence(e); setReplay(r); setError(null); }
      })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load company data: ${error}`} />;
  if (!company || !evidence || !replay) return <UnavailableState />;

  const pillarEntries = company.pillars
    ? Object.entries(company.pillars).map(([k, v]) => ({ key: k, value: v }))
    : null;

  return (
    <section aria-label="Company intelligence">
      <CompanyHeader
        companyName={`${company.sector} (reference)`}
        sector={company.sector}
        verdict={company.decision.verdict}
        composite={company.decision.composite}
        confidence={company.decision.confidence}
        freshness={company.provenance.freshness}
        subLabel={company.resolvedSubsegment ? `${company.resolvedSubsegment}${company.resolvedArchetype ? ` · ${company.resolvedArchetype}` : ''}` : null}
      />

      {/* Overrides */}
      {company.overrides.length > 0 && (
        <MetricGroup label="Overrides Applied">
          <ul data-testid="company-overrides" style={{ paddingLeft: 20 }}>
            {company.overrides.map((o) => <li key={o}><StatusBadge status="warning" label={o} /></li>)}
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
        rows={company.inputs}
        emptyLabel="No input metrics available"
      />

      {/* N+5: governed trust chain — Decision → Evidence → Replay → Provenance */}
      <CompanyTrustChain evidence={evidence} replay={replay} />

      {/* Provenance */}
      <p data-testid="company-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {company.provenance.dataSource} · freshness {company.provenance.freshness}
      </p>
    </section>
  );
}
