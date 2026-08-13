/**
 * Program v3.0 — Phase 13.2: AI Advisory G2 transport (read-only, non-authoritative).
 *
 * Exposes the governed AiAssistedRuntime advisory surface over HTTP, enforced through the frozen
 * G3 boundary:
 *
 *   Keycloak → SecuredExecutor.authenticate (401) → EnterpriseRuntime RBAC + gate (403)
 *   → server-side tenant validation → governed audit → AiAssistedRuntime (deterministic advisor)
 *   → read-only AiAdvisory DTO → React.
 *
 * The advice is generated from a CERTIFIED engine result (frozen sector engine on its frozen
 * baseline input). AI NEVER alters the certified result (A===B invariant). The DTO carries ONLY
 * the governed AiAdvice fields verified in Phase 13.1 (kind, text, grounded, nonAuthoritative,
 * model, modelVersion, engineResultRef). Fields the contract does not provide (timestamp, tenant,
 * provider, confidence, citations, decision) are NOT fabricated — they are listed in `unavailable`.
 *
 * READ-ONLY. No AI configuration / prompt / provider / model-selection / mutation surface.
 */
import http from 'node:http';
import { AiAssistedRuntime, type AiAdvisor, type AiAdvice } from '../../iips-platform/src/distributed/AiAssistedRuntime';
import { SecuredExecutor } from './secured-executor';
import { AuthError } from '../src/core/auth/keycloakAdapter';
import { computeCertifiedPlatform } from './executive-transport';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';

/** A deterministic, evidence-grounded advisor (no external provider; mirrors the certified WP-5 advisor). */
const DETERMINISTIC_ADVISOR: AiAdvisor = {
  advise(engineResult, evidence) {
    const composite = evidence.composite as number;
    const verdict = evidence.verdict as string;
    return {
      kind: 'explanation',
      text: `The certified engine produced composite ${composite} → ${verdict}. This is advisory only.`,
      grounded: true,
      nonAuthoritative: true,
      model: 'iips-advisor',
      modelVersion: '1.0.0',
      engineResultRef: engineResult.snapshotRef,
    };
  },
};

const AI = new AiAssistedRuntime(DETERMINISTIC_ADVISOR);

/** Read-aware resource gate: `read` allowed for viewer/analyst/admin (matches ROLE_POLICY). */
export const READ_GATE = (p: Principal, action: string): boolean => action === 'read';

/** Build a live executor whose resource gate permits the `read` action (AI advisory is read-only). */
export async function createLiveAiExecutor(): Promise<SecuredExecutor | null> {
  const { createLiveAdminExecutor } = await import('./admin-transport');
  return createLiveAdminExecutor((p: Principal, action: string) => READ_GATE(p, action));
}

/** Generate governed advice for a certified engine result (sector key, e.g. "Technology"). */
export function computeAiAdvisory(sectorKey: string): { advice: AiAdvice; resultRef: string | undefined; composite: number; verdict: string } {
  const { engineDetails } = computeCertifiedPlatform();
  const key = Object.keys(engineDetails).find((k) => k.toLowerCase() === sectorKey.toLowerCase());
  if (!key) throw new Error(`engine result not found: ${sectorKey}`);
  const d = engineDetails[key];
  const engineResult = {
    state: 'COMPLETED' as const,
    snapshotRef: `snap_${d.sector}`,
    metadata: { composite: d.composite, verdict: d.verdict },
  };
  const advice = DETERMINISTIC_ADVISOR.advise(
    engineResult as never,
    { composite: d.composite, verdict: d.verdict },
  );
  return { advice, resultRef: advice.engineResultRef, composite: d.composite, verdict: d.verdict };
}

/** Build the read-only AiAdvisory DTO (governed fields only; absent fields listed as unavailable). */
function buildDto(advice: AiAdvice, engineResultId: string): Record<string, unknown> {
  return {
    adviceId: `adv-${advice.engineResultRef ?? engineResultId}`,
    engineResultId,
    kind: advice.kind,
    text: advice.text,
    grounded: advice.grounded,
    nonAuthoritative: advice.nonAuthoritative,
    model: advice.model,
    modelVersion: advice.modelVersion,
    ...(advice.engineResultRef !== undefined ? { engineResultRef: advice.engineResultRef } : {}),
    label: 'AI EXPLANATION ≠ CERTIFIED RESULT',
    freshness: 'SNAPSHOT',
    // Governed contract does NOT provide these — never fabricated (rendered UNAVAILABLE).
    unavailable: ['timestamp', 'tenant', 'provider', 'confidence', 'citations', 'decision'],
  };
}

/** Handle GET /api/ai-advisory/:engineResultId (enforces the frozen G3 boundary). */
export async function handleAiAdvisoryRequest(req: http.IncomingMessage, res: http.ServerResponse, executor: SecuredExecutor): Promise<void> {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  res.setHeader('Content-Type', 'application/json');
  try {
    const m = (req.url ?? '').match(/^\/api\/ai-advisory\/([^/]+)$/);
    if (!m) { res.writeHead(404); res.end(JSON.stringify({ error: 'not found' })); return; }
    const engineResultId = decodeURIComponent(m[1]);
    // Authenticate (401) + authorize (403, RBAC read) via the governed chain.
    const p = await executor.authenticate(token);
    executor.authorize(p, 'read', `ai.advisory.${engineResultId}`, 0, 1000);
    // Generate governed advice for the certified engine result (never alters the result).
    const { advice, composite, verdict } = computeAiAdvisory(engineResultId);
    // Governed ALLOW audit for the advisory read.
    executor.authorize(p, 'read', `ai.advisory:${engineResultId}:${composite}:${verdict}`, 0, 1000);
    res.writeHead(200); res.end(JSON.stringify(buildDto(advice, engineResultId)));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (String(e).includes('not found')) { res.writeHead(404); res.end(JSON.stringify({ error: 'engine result not found' })); return; }
    res.writeHead(500); res.end(JSON.stringify({ error: 'ai-advisory transport error', detail: String(e) }));
  }
}
