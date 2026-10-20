/**
 * IIPS v3.0 — PKG-08 Row 4: Sector Intelligence workspace.
 *
 * Route: /research/sector/:id. Answers "What does the certified platform say about this
 * sector — its engine, decision, certified pillars, position in the governed universe,
 * and replay verification?"
 *
 * GOVERNANCE (PKG-08-ROW4-CONTRACT-PROPOSAL-01): composed from five existing governed
 * read endpoints. No new endpoint, DTO, or schema. No frontend analytical calculation.
 * Sector-level data is labelled as sector-level — the synthetic ${sector}-H1 entity
 * from the company endpoint is not presented as a real company. Null values render
 * "unavailable" (never 0). Pillars null → unavailable panel (never derived).
 *
 * Implementation authority: PKG-08-ROW4-IMPL-AUTH-01.
 */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCompanyData, type CompanyData } from '../../api/company';
import { fetchEvidenceData, type EvidenceData } from '../../api/evidence';
import { fetchReplayData, type ReplayData } from '../../api/replay';
import { fetchDecisionMatrixData, type DecisionMatrixData, type MatrixCompany } from '../../api/decisionMatrix';
import { fetchEngines, type EngineListData, type EngineRegistryEntry } from '../../api/engines';
import { CompanyHeader } from '../../components/company/CompanyHeader';
import { MetricGroup, MetricCard, DataTable } from '../../components/data/DataComponents';
import { EvidenceCard } from '../../components/evidence/EvidenceComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge, FreshnessBadge, StatusBadge } from '../../components/ui/Badges';

/** All data required to render the sector surface. Each field is from a certified source. */
interface SectorSurfaceData {
  readonly sector: string;
  readonly engine: EngineRegistryEntry;
  readonly company: CompanyData;
  readonly evidence: EvidenceData;
  readonly replay: ReplayData;
  readonly matrix: DecisionMatrixData;
  readonly matrixRow: MatrixCompany | null;
  readonly engines: EngineListData;
}

/**
 * Fetch all five governed endpoints in parallel for the given sector.
 * If any single endpoint fails the whole surface fails — honest error, no partial rendering.
 */
async function fetchAllSectorData(sector: string): Promise<SectorSurfaceData> {
  const [company, evidence, replay, matrix, engines] = await Promise.all([
    fetchCompanyData(sector),
    fetchEvidenceData(sector),
    fetchReplayData(sector),
    fetchDecisionMatrixData(),
    fetchEngines(),
  ]);

  const engine = engines.engines.find(
    e => e.sectorFamily.toLowerCase() === sector.toLowerCase(),
  );
  if (!engine) throw new Error(`engine registry has no entry for sector: ${sector}`);

  const matrixRow = matrix.companies.find(
    c => c.sector.toLowerCase() === sector.toLowerCase(),
  ) ?? null;

  return { sector, engine, company, evidence, replay, matrix, matrixRow, engines };
}

/**
 * Derive the 13 canonical sector names from the decision-matrix response.
 * This is the "N+12 pattern" from the orphan spec's S6 — sourced from governed data, never hardcoded.
 */
function sectorOptionsFromMatrix(matrix: DecisionMatrixData): readonly string[] {
  return matrix.companies.map(c => c.sector);
}

export function SectorIntelligence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SectorSurfaceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAllSectorData(id)
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load sector data: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { sector, engine, company, evidence, replay, matrix, matrixRow } = data;
  const pillarEntries = company.pillars
    ? Object.entries(company.pillars).map(([k, v]) => ({ key: k, value: v }))
    : null;

  const selectorOptions = sectorOptionsFromMatrix(matrix);

  return (
    <section aria-label="Sector intelligence" data-testid="sector-intelligence">
      {/* Sector selector — options sourced from governed /api/decision-matrix */}
      <div data-testid="sector-selector" style={{ marginBottom: 16 }}>
        <label htmlFor="sector-select" style={{ fontSize: 13, fontWeight: 600 }}>Sector</label>
        <select
          id="sector-select"
          data-testid="sector-select"
          value={sector}
          onChange={(e) => navigate(`/research/sector/${encodeURIComponent(e.target.value)}`)}
          style={{ marginLeft: 8, padding: '4px 8px' }}
        >
          {selectorOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Sector identity header — uses CompanyHeader pattern but with sector-level semantics */}
      <CompanyHeader
        companyName={`${sector} — Sector Research`}
        sector={sector}
        verdict={company.decision.verdict}
        composite={company.decision.composite}
        confidence={company.decision.confidence}
        freshness={company.provenance.freshness}
        subLabel={company.resolvedSubsegment
          ? `${company.resolvedSubsegment}${company.resolvedArchetype ? ` · ${company.resolvedArchetype}` : ''}`
          : null}
      />

      {/* Engine identity section */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Certified Engine</h2>
      <div data-testid="sector-engine-identity" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', fontSize: 13 }}>
        <dt>Engine ID</dt><dd><code>{engine.engineId}</code></dd>
        <dt>IES</dt><dd>{engine.ies} — {engine.iesTitle}</dd>
        <dt>Engine version</dt><dd>{engine.engineVersion}</dd>
        <dt>SEC version</dt><dd>{engine.secVersion}</dd>
        <dt>SEMC version</dt><dd>{engine.semcVersion}</dd>
        <dt>Calibration</dt><dd>{engine.calibrationProfile} v{engine.calibrationVersion}</dd>
      </div>
      {engine.capabilities.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-ink-secondary)' }}>
          Capabilities: {engine.capabilities.join(', ')}
        </div>
      )}

      {/* Overrides */}
      {company.overrides.length > 0 && (
        <MetricGroup label="Overrides Applied">
          <ul data-testid="sector-overrides" style={{ paddingLeft: 20 }}>
            {company.overrides.map((o) => <li key={o}><StatusBadge status="warning" label={o} /></li>)}
          </ul>
        </MetricGroup>
      )}

      {/* Pillars — only where the certified engine exposes them; else unavailable (no fabrication). */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Business Quality / Growth / Valuation / Risk</h2>
      {pillarEntries ? (
        <MetricGroup label="Certified pillar scores">
          {pillarEntries.map((p) => (
            <MetricCard
              key={p.key}
              label={p.key}
              value={p.value}
              direction={p.value >= 60 ? 'positive' : p.value >= 40 ? 'neutral' : 'negative'}
            />
          ))}
        </MetricGroup>
      ) : (
        <div data-testid="pillars-unavailable" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}>
          Pillar scores are not exposed by the certified engine for this sector. They are shown as unavailable rather than derived in the frontend.
        </div>
      )}

      {/* Certified input metrics (traceable, SNAPSHOT inputs) */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Sector Inputs (SNAPSHOT)</h2>
      <DataTable
        columns={[
          { key: 'key', header: 'Metric', render: (r: { key: string }) => r.key },
          { key: 'value', header: 'Value', render: (r: { key: string; value: unknown }) => (typeof r.value === 'number' ? r.value : String(r.value ?? 'unavailable')) },
        ]}
        rows={company.inputs}
        emptyLabel="No input metrics available"
      />

      {/* Position in the governed universe */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Position in Governed Universe</h2>
      {matrixRow ? (
        <div data-testid="sector-universe-position" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', fontSize: 13 }}>
          <dt>Verdict</dt><dd>{matrixRow.verdict}</dd>
          <dt>Composite</dt><dd>{matrixRow.composite}</dd>
          <dt>Quality axis</dt><dd data-testid="sector-quality">{matrixRow.quality === null ? 'unavailable' : matrixRow.quality}</dd>
          <dt>Valuation axis</dt><dd data-testid="sector-valuation">{matrixRow.valuation === null ? 'unavailable' : matrixRow.valuation}</dd>
        </div>
      ) : (
        <div data-testid="universe-unavailable" style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          Universe position unavailable for this sector.
        </div>
      )}
      <p data-testid="matrix-disclaimer" style={{ fontSize: 11, color: 'var(--color-ink-secondary)', marginTop: 4 }}>
        {matrix.note}
      </p>

      {/* Evidence chain summary */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Evidence Chain</h2>
      <div data-testid="sector-evidence" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        <EvidenceCard reference={company.evidence} />
      </div>
      <div data-testid="sector-evidence-detail" style={{ marginTop: 12, fontSize: 13 }}>
        <p>Evidence ID: <code>{evidence.evidence.evidenceId}</code></p>
        <p>Recommendation: {evidence.evidence.recommendation}</p>
        <p>Composite score: {evidence.evidence.compositeScore}</p>
        <p>Methodology: {evidence.evidence.provenance.methodologyVersion}</p>
      </div>
      {evidence.evidence.keyMetrics.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 14 }}>Key Metrics</h3>
          <DataTable
            columns={[
              { key: 'name', header: 'Metric', render: (r: { name: string }) => r.name },
              { key: 'value', header: 'Value', render: (r: { value: number }) => r.value },
            ]}
            rows={evidence.evidence.keyMetrics}
            emptyLabel="No key metrics"
          />
        </div>
      )}
      {evidence.evidence.supportingScores.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 14 }}>Supporting Scores</h3>
          <DataTable
            columns={[
              { key: 'name', header: 'Score', render: (r: { name: string }) => r.name },
              { key: 'value', header: 'Value', render: (r: { value: number }) => r.value },
            ]}
            rows={evidence.evidence.supportingScores}
            emptyLabel="No supporting scores"
          />
        </div>
      )}
      {evidence.evidence.decisionRulesApplied.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 14 }}>Decision Rules Applied</h3>
          <ul data-testid="sector-decision-rules" style={{ paddingLeft: 20, fontSize: 13 }}>
            {evidence.evidence.decisionRulesApplied.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {/* Replay verification summary */}
      <h2 style={{ fontSize: 18, marginTop: 24 }}>Replay Verification</h2>
      <div data-testid="sector-replay" style={{ fontSize: 13 }}>
        <p>Reproduced: <strong>{replay.replay.reproduced ? '✓ Yes' : '✕ No'}</strong></p>
        <p>Byte-identical: <strong>{replay.replay.byteIdentical ? '✓ Yes' : '✕ No'}</strong></p>
        <p>Field-level difference available: {replay.differenceAvailable ? 'Yes' : 'No'}</p>
        <p style={{ fontSize: 11, color: 'var(--color-ink-secondary)' }}>{replay.note}</p>
      </div>

      {/* Mandatory link to Company surface for full trust chain */}
      <p style={{ marginTop: 16 }}>
        <Link to={`/research/company/${encodeURIComponent(sector)}`} data-testid="sector-company-link">
          View full certified result for {sector} →
        </Link>
      </p>
      <p style={{ marginTop: 4 }}>
        <Link to={`/evidence/replay/${encodeURIComponent(sector)}`}>
          Open replay explorer →
        </Link>
      </p>

      {/* Provenance footer */}
      <div data-testid="sector-provenance" style={{ marginTop: 24, padding: 12, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-1)', fontSize: 12 }}>
        <CertifiedBadge /> <FreshnessBadge state="snapshot" />
        <p style={{ marginTop: 8, color: 'var(--color-ink-secondary)' }}>
          {company.provenance.dataSource} · freshness {company.provenance.freshness} · calibrated at {company.provenance.calibratedAt}
        </p>
        <p style={{ color: 'var(--color-ink-secondary)', marginTop: 4 }}>
          All data is a frozen SNAPSHOT from the v1.1 Replay Baseline. No live data, time series, or external source is represented.
        </p>
      </div>
    </section>
  );
}
