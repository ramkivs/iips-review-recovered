/**
 * NP-13 — Decision Evidence landing.
 *
 * This is a read-only index over the existing governed executive read. It does not create
 * evidence, calculate values, persist state, or execute replay.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchExecutiveData, type ExecutiveData } from '../../api/executive';
import { DecisionBadge, type Verdict } from '../../components/decision/DecisionComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge, FreshnessBadge } from '../../components/ui/Badges';

const GOVERNED_EVIDENCE_SUBJECTS = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecommunications',
  'Automobile',
  'Materials & Metals',
] as const;

const GOVERNED_VERDICTS: readonly Verdict[] = ['Strong Buy', 'Buy', 'Accumulate', 'Hold', 'Watch', 'Avoid'];
const GOVERNED_SUBJECT_SET = new Set<string>(GOVERNED_EVIDENCE_SUBJECTS);

type EvidenceLandingData = Pick<ExecutiveData, 'decisions' | 'provenance'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && GOVERNED_VERDICTS.includes(value as Verdict);
}

/**
 * Validate only the governed values required by this landing. The list is rendered from the
 * response; the subject set below is a completeness guard, never a fallback or data source.
 */
function isCompleteGovernedRead(value: unknown): value is EvidenceLandingData {
  if (!isRecord(value) || !Array.isArray(value.decisions) || !isRecord(value.provenance)) return false;
  if (value.decisions.length !== GOVERNED_EVIDENCE_SUBJECTS.length) return false;

  const { provenance } = value;
  if (
    provenance.freshness !== 'SNAPSHOT' ||
    typeof provenance.dataSource !== 'string' ||
    typeof provenance.calibratedAt !== 'string' ||
    typeof provenance.transportSemantics !== 'string'
  ) return false;

  const seen = new Set<string>();
  return value.decisions.every((decision) => {
    if (!isRecord(decision)) return false;
    const { sector, verdict, composite, confidence } = decision;
    if (
      typeof sector !== 'string' ||
      !GOVERNED_SUBJECT_SET.has(sector) ||
      seen.has(sector) ||
      !isVerdict(verdict) ||
      !isFiniteNumber(composite) ||
      !isFiniteNumber(confidence)
    ) return false;
    seen.add(sector);
    return true;
  }) && seen.size === GOVERNED_EVIDENCE_SUBJECTS.length;
}

export function EvidenceLanding() {
  const [data, setData] = useState<EvidenceLandingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchExecutiveData()
      .then((candidate) => {
        if (!active) return;
        if (!isCompleteGovernedRead(candidate)) {
          setData(null);
          setError(null);
          setUnavailable(true);
          return;
        }
        setData(candidate);
        setError(null);
        setUnavailable(false);
      })
      .catch((cause) => {
        if (active) {
          setData(null);
          setUnavailable(false);
          setError(String(cause));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load Decision Evidence: ${error}`} />;
  if (unavailable || !data) return <UnavailableState reason="Decision Evidence unavailable" />;

  return (
    <section aria-label="Decision Evidence" data-testid="evidence-landing">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Decision Evidence</h1>
          <CertifiedBadge />
          <FreshnessBadge state="snapshot" />
        </div>
        <p data-testid="evidence-landing-provenance" style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          {data.provenance.dataSource} · freshness {data.provenance.freshness}
        </p>
      </header>

      <h2 style={{ fontSize: 18 }}>Existing Evidence Subjects</h2>
      <ul data-testid="evidence-subject-list" style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
        {data.decisions.map((subject) => (
          <li
            key={subject.sector}
            data-testid="evidence-subject"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
          >
            <Link to={`/evidence/${encodeURIComponent(subject.sector)}`}>{subject.sector}</Link>
            <DecisionBadge verdict={subject.verdict} />
          </li>
        ))}
      </ul>
    </section>
  );
}
