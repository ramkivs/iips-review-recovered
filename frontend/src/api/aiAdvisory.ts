/**
 * Program v3.0 — Phase 13.2: Typed API client for the AI Advisory (read-only, non-authoritative).
 *
 * Mirrors the governed AiAssistedRuntime contract exactly (verified in Phase 13.1). Semantically
 * inert: the client maps governed advisory fields to the UI. It NEVER computes confidence,
 * recommendations, or decisions, and never fabricates a field. Fields the governed contract does
 * not provide (timestamp, tenant, provider, confidence, citations, decision) are NOT modeled —
 * the UI renders them UNAVAILABLE.
 */
import type { Freshness } from './admin';

/** Governed AI advisory output (exact subset of AiAssistedRuntime.AiAdvice). */
export interface AiAdvisoryDto {
  readonly adviceId: string;
  readonly engineResultId: string;
  readonly kind: 'explanation' | 'summary' | 'hypothesis' | 'anomaly' | 'research';
  readonly text: string;
  readonly grounded: boolean;
  readonly nonAuthoritative: true;
  readonly model: string;
  readonly modelVersion: string;
  readonly engineResultRef?: string;
  readonly label: 'AI EXPLANATION ≠ CERTIFIED RESULT';
  readonly freshness: Freshness;
  /** Fields intentionally not provided by the governed contract (rendered UNAVAILABLE). */
  readonly unavailable: readonly string[];
}

const BASE = '/api';

/** Fetch the governed AI advisory for a certified engine result. */
export async function fetchAiAdvisory(engineResultId: string, baseUrl = ''): Promise<AiAdvisoryDto> {
  const res = await fetch(`${baseUrl}${BASE}/ai-advisory/${encodeURIComponent(engineResultId)}`);
  if (res.status === 401) throw new Error('Authentication required (401)');
  if (res.status === 403) throw new Error('Authorization denied (403)');
  if (res.status === 404) throw new Error('Engine result not found');
  if (!res.ok) throw new Error(`ai-advisory transport returned ${res.status}`);
  return (await res.json()) as AiAdvisoryDto;
}
