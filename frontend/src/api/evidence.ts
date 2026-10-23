/**
 * Program v3.0 — Phase 10: Typed API client for the Evidence Explorer.
 * Inspection surface over governed v2.0 evidence/snapshot/replay contracts.
 * No analytical/reasoning logic in the client.
 */
import type { Verdict } from '../components/decision/DecisionComponents';
import { decodeReplayOutcome, type ReplayOutcome } from './replay';
import { noAuthFetch } from '../core/network/noAuthFetch';
import type { ExecutiveProvenance } from './executive';

export interface EvidenceData {
  readonly referenceOnly: true;
  readonly decision: { readonly verdict: Verdict; readonly composite: number; readonly confidence: number | null };
  readonly evidence: {
    readonly evidenceId: string;
    readonly engineId: string;
    readonly recommendation: string;
    readonly compositeScore: number;
    readonly confidence: number;
    readonly keyMetrics: readonly { readonly id: string; readonly name: string; readonly value: number }[];
    readonly supportingScores: readonly { readonly id: string; readonly name: string; readonly value: number }[];
    readonly calibrationVersion: string;
    readonly decisionRulesApplied: readonly string[];
    readonly replayReference: string | null;
    readonly provenance: { readonly frameworkVersion: string; readonly engineVersion: string; readonly methodologyVersion: string; readonly snapshotId: string };
    readonly generatedAt: string;
  };
  readonly snapshot: {
    readonly snapshotId: string;
    readonly engineId: string;
    readonly schemaVersion: string;
    readonly generatedAt: string;
    readonly verdict: string;
    readonly scores: Readonly<Record<string, number>>;
  };
  readonly replay: ReplayOutcome;
  readonly provenance: ExecutiveProvenance;
}

export async function fetchEvidenceData(sector: string, baseUrl = ''): Promise<EvidenceData> {
  const res = await noAuthFetch(`${baseUrl}/api/evidence/${encodeURIComponent(sector)}`);
  if (!res.ok) throw new Error(`evidence transport returned ${res.status}`);
  const value: unknown = await res.json();
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid reference Evidence response');
  const data = value as Record<string, unknown>;
  const evidence = data.evidence;
  if (data.referenceOnly !== true || evidence === null || typeof evidence !== 'object' || Array.isArray(evidence)
    || (evidence as Record<string, unknown>).replayReference !== null
    || decodeReplayOutcome(data.replay).state !== 'NOT_PERFORMED') throw new Error('Invalid reference-only Evidence/replay contract');
  return data as unknown as EvidenceData;
}
