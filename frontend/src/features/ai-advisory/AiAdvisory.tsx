/**
 * Program v3.0 — Phase 13.2: AI Explanation (read-only, non-authoritative).
 *
 * Presents the governed AiAssistedRuntime advisory for a certified engine result. It is STRICTLY
 * NON-AUTHORITATIVE: the mandatory label "AI EXPLANATION ≠ CERTIFIED RESULT" is shown, the
 * grounded flag and model/version are surfaced, and any field the governed contract does not
 * provide (timestamp, tenant, provider, confidence, citations, decision) renders UNAVAILABLE.
 *
 * React is NOT an authorization authority and contains ZERO reasoning/decision logic — it only
 * formats the governed advisory DTO. The server (SecuredExecutor → EnterpriseRuntime → tenant →
 * audit → AiAssistedRuntime) is authoritative.
 */
import { useEffect, useState } from 'react';
import { fetchAiAdvisory, type AiAdvisoryDto } from '../../api/aiAdvisory';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { AiBadge, FreshnessBadge, StatusBadge } from '../../components/ui/Badges';

const DEFAULT_ENGINE_RESULT = 'Technology'; // certified sector key (frozen baseline)

export function AiAdvisory() {
  const [data, setData] = useState<AiAdvisoryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [engineResultId, setEngineResultId] = useState(DEFAULT_ENGINE_RESULT);

  const load = (id: string) => {
    setLoading(true);
    setError(null);
    fetchAiAdvisory(id)
      .then((d) => { setData(d); })
      .catch((e) => { setError(String(e)); setData(null); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(engineResultId); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [engineResultId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <UnavailableState />;

  return (
    <section aria-label="AI explanation">
      <header style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>AI Explanation</h1>
          <AiBadge />
          <FreshnessBadge state={data.freshness === 'SNAPSHOT' ? 'snapshot' : data.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13, fontWeight: 600 }}>
          {data.label}
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13 }}>Engine result</label>
        <select
          aria-label="Engine result"
          value={engineResultId}
          onChange={(e) => setEngineResultId(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'var(--color-surface-1)' }}
        >
          {['Technology', 'Banking', 'Energy', 'Utilities', 'Consumer', 'Industrials'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div data-testid="ai-advice" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 16, background: 'var(--color-surface-1)' }}>
        <p style={{ margin: 0, fontSize: 14 }}>{data.text}</p>
        <dl style={{ fontSize: 13, margin: '12px 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px' }}>
          <dt>Kind</dt><dd>{data.kind}</dd>
          <dt>Grounded</dt><dd>{data.grounded ? <StatusBadge status="positive" label="GROUNDED" /> : <StatusBadge status="warning" label="NOT GROUNDED" />}</dd>
          <dt>Model</dt><dd>{data.model} · {data.modelVersion}</dd>
          <dt>Engine result ref</dt><dd>{data.engineResultRef ?? 'unavailable'}</dd>
          <dt>Advice id</dt><dd>{data.adviceId}</dd>
        </dl>
      </div>

      <div data-testid="ai-unavailable" style={{ marginTop: 16 }}>
        <UnavailableState reason="Fields not provided by the governed contract (rendered unavailable, never fabricated)" />
        <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          Unavailable: {data.unavailable.join(', ')}. AI is never a decision authority.
        </p>
      </div>
    </section>
  );
}
