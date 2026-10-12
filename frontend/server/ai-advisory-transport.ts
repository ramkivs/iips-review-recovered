/**
 * Program v3.0 — AI Advisory G2 transport (read-only, non-authoritative).
 *
 * Direct, credential-free read path:
 *
 *   GET /api/ai-advisory/:sectorKey
 *     → AiAssistedRuntime.executeWithAi (SOLE orchestration path)
 *     → read-only AiAdvisory DTO → React.
 *
 * No identity or authorization principal is created. `AiAssistedRuntime.executeWithAi` remains
 * the sole authoritative orchestration path — `AiAdvisor.advise()` is never called directly.
 *
 * Calibration is current main's v1.1.0 certified 13-engine generation (ENGINE_FACTORY +
 * frozen Replay Baseline in `executive-transport.ts`); no superseded engine class, engine
 * ID, or baseline version is referenced. The advice is generated from a CERTIFIED engine
 * result executed on its frozen baseline inputs. AI NEVER alters the certified result
 * (A===B invariant, integrity-checked). The DTO carries ONLY the governed AiAdvice fields
 * (kind, text, grounded, nonAuthoritative, model, modelVersion, engineResultRef). Fields the
 * contract does not provide (timestamp, tenant, provider, confidence, citations, decision)
 * are NOT fabricated — they are listed in `unavailable`.
 *
 * Failure semantics: 404 unknown/unresolvable sector; 503 `engine-result-not-completed`
 * when the engine result is not COMPLETED (advisor body not consulted); 503
 * `advisory-unavailable` when the advisor cannot produce advice; 500 engine/runtime/transport
 * failure. No authentication or identity check is required.
 *
 * READ-ONLY. No AI configuration / prompt / provider / model-selection / mutation surface.
 */
import http from 'node:http';
import { AiAssistedRuntime, adviceId, type AiAdvice, type AiAdvisor } from '../../iips-platform/src/distributed/AiAssistedRuntime';
import type { ExecutionResult, SectorPlugin } from '../../iips-platform/src/plugin-loader/PluginContract';
import { resolveSectorEngine as defaultResolveSectorEngine } from './executive-transport';

/** The exact authorized advisory sentence. Fixed; no interpolation; no result-dependent slots. */
export const ADVISORY_TEXT =
  'This is a supplementary advisory explanation. It is not a certified engine result and does not alter the certified result.';

/** Mandatory non-authoritative marker rendered adjacent to the canonical `AI EXPLANATION` badge. */
export const ADVISORY_LABEL = 'AI EXPLANATION ≠ CERTIFIED RESULT' as const;

/** The advisory is derived from the frozen certified baseline, so freshness is SNAPSHOT. */
export const ADVISORY_FRESHNESS = 'SNAPSHOT' as const;

/** Governed fields the contract does not provide. Listed, never fabricated. */
export const ADVISORY_UNAVAILABLE = ['timestamp', 'tenant', 'provider', 'confidence', 'citations', 'decision'] as const;

/** The deterministic advisor identity. Truthful: no external AI model is implied. */
export const ADVISOR_MODEL = 'iips-deterministic-advisor' as const;
export const ADVISOR_MODEL_VERSION = '1.0.0' as const;

/** Thrown when the engine result is not COMPLETED, so the advisory body is never produced. */
export class EngineResultNotCompletedError extends Error {
  constructor(readonly state: ExecutionResult['state']) {
    super(`engine result not completed (${state})`);
    this.name = 'EngineResultNotCompletedError';
  }
}

/**
 * The deterministic in-process advisor.
 *
 * Deterministic; no external AI, provider or network; no additional reads. Consumes ONLY the
 * engine result and the evidence object it is handed. Does not mutate the engine result and
 * fabricates nothing: `text` is the fixed authorized sentence and `grounded` reflects whether
 * the evidence actually carries the certified composite and verdict.
 */
export function createDeterministicAdvisor(): AiAdvisor {
  return {
    advise(engineResult: ExecutionResult, evidence: Record<string, unknown>): AiAdvice {
      const grounded =
        typeof evidence.composite === 'number' && typeof evidence.verdict === 'string';

      return {
        kind: 'explanation',
        text: ADVISORY_TEXT,
        grounded,
        nonAuthoritative: true,
        model: ADVISOR_MODEL,
        modelVersion: ADVISOR_MODEL_VERSION,
        ...(engineResult.snapshotRef !== undefined ? { engineResultRef: engineResult.snapshotRef } : {}),
      };
    },
  };
}

/**
 * Wraps the advisor so the advisory BODY is never produced for a non-COMPLETED engine result.
 * The throw is raised before any advisory content is constructed.
 */
export function guardAdvisorCompletion(inner: AiAdvisor): AiAdvisor {
  return {
    advise(engineResult: ExecutionResult, evidence: Record<string, unknown>): AiAdvice {
      if (engineResult.state !== 'COMPLETED') throw new EngineResultNotCompletedError(engineResult.state);
      return inner.advise(engineResult, evidence);
    },
  };
}

/** A resolved sector: the governed engineId, its engine constructor, and its frozen baseline inputs. */
export interface ResolvedSectorEngine {
  readonly sector: string;
  readonly engineId: string;
  readonly makeEngine: () => SectorPlugin;
  readonly inputs: Readonly<Record<string, unknown>>;
}

/**
 * Build the governed 12-field success DTO. No field is added, removed or renamed.
 * `adviceId` is produced by the canonical platform helper.
 */
export function buildAiAdvisoryDto(advice: AiAdvice, engineResultId: string): Record<string, unknown> {
  return {
    adviceId: adviceId(`ai-advisory|${advice.engineResultRef ?? engineResultId}`),
    engineResultId,
    kind: advice.kind,
    text: advice.text,
    grounded: advice.grounded,
    nonAuthoritative: advice.nonAuthoritative,
    model: advice.model,
    modelVersion: advice.modelVersion,
    ...(advice.engineResultRef !== undefined ? { engineResultRef: advice.engineResultRef } : {}),
    label: ADVISORY_LABEL,
    freshness: ADVISORY_FRESHNESS,
    unavailable: [...ADVISORY_UNAVAILABLE],
  };
}

/** Injectable advisor seam (test-only; production always uses the default deterministic advisor). */
export interface AiAdvisoryHandlerOptions {
  readonly advisor?: AiAdvisor;
}

/**
 * GET /api/ai-advisory/:sectorKey
 *
 * Sector coverage is derived from the governed ENGINE_FACTORY mapping supplied by the resolver
 * — no sector is enumerated here. The resolver defaults to the executive composition
 * (`resolveSectorEngine` over the v1.1.0 certified baseline); tests may inject a stub.
 */
export async function handleAiAdvisoryRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  resolveSectorEngine: (sectorKey: string) => ResolvedSectorEngine | null = defaultResolveSectorEngine,
  opts: AiAdvisoryHandlerOptions = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  try {
    const match = (req.url ?? '').match(/^\/api\/ai-advisory\/([^/]+)$/);
    if (!match) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'not found' }));
      return;
    }
    const sectorKey = decodeURIComponent(match[1]);

    // Resolve the sector key through the governed mapping. Unknown → pre-existing 404.
    const resolved = resolveSectorEngine(sectorKey);
    if (!resolved) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: `engine result not found: ${sectorKey}` }));
      return;
    }

    // executeWithAi is the sole orchestration path. The engine is executed exactly once,
    // by the platform runtime, on the frozen baseline inputs. advise() is never called directly.
    const runtime = new AiAssistedRuntime(
      guardAdvisorCompletion(opts.advisor ?? createDeterministicAdvisor()),
    );
    let advice: AiAdvice;
    let engineResultUnchanged: boolean;
    try {
      const executed = runtime.executeWithAi(resolved.engineId, resolved.makeEngine, {
        requestId: `ai-advisory-${resolved.engineId}`,
        inputs: resolved.inputs as Record<string, unknown>,
      });
      advice = executed.advice;
      engineResultUnchanged = executed.engineResultUnchanged;
    } catch (e) {
      // Non-COMPLETED engine result: the advisory body was never produced.
      if (e instanceof EngineResultNotCompletedError) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: e.message, code: 'engine-result-not-completed' }));
        return;
      }
      // The advisor could not produce advice. No fallback, no fabricated or partial advice.
      res.writeHead(503);
      res.end(JSON.stringify({ error: 'advisory unavailable', code: 'advisory-unavailable' }));
      return;
    }

    // A===B — the certified engine result is returned unchanged and is never mutated here.
    if (!engineResultUnchanged) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'engine result integrity check failed' }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify(buildAiAdvisoryDto(advice, resolved.sector)));
    // adviceLog() lineage is retained on the runtime instance for the request that produced it.
    void runtime.adviceLog();
  } catch (e) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'ai advisory transport error', detail: String(e) }));
  }
}
