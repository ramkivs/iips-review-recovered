/**
 * Replay Service — reproduce completed executions (IES-005 P4 §10, IES-006.2A).
 *
 * Independently recomputes the engine result from the stored snapshot's
 * execution context via the registered replay executor and compares the
 * recomputed output against the stored immutable snapshot. `reproduced` and
 * `byteIdentical` are computed from actual re-execution and SHA-256 comparison,
 * never returned as literals.
 */
import type { Snapshot } from '../snapshot/SnapshotService';
import { SnapshotStore } from '../snapshot/SnapshotStore';
import { createHash } from 'node:crypto';

export interface ReplayResult {
  readonly snapshotId: string;
  readonly reproduced: boolean;
  readonly byteIdentical: boolean;
  readonly evidenceRefs: readonly string[];
  readonly recomputedMetrics?: Readonly<Record<string, number>>;
  readonly recomputedScores?: Readonly<Record<string, number>>;
  readonly recomputedVerdict?: string;
  readonly diagnostic?: string;
}

/** Execution context stored with the snapshot for replay. */
export interface ExecutionContext {
  readonly engineId: string;
  readonly requestId: string;
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly contractVersion?: string;
  readonly calibrationVersion?: string;
}

export interface ReplayExecutionOutput {
  readonly metrics: Record<string, number>;
  readonly scores: Record<string, number>;
  readonly verdict?: string;
}

/** Executor function type for replay recomputation. */
export type ReplayExecutor = (
  engineId: string,
  requestId: string,
  inputs: Record<string, unknown>,
) => ReplayExecutionOutput | null;

/** Compute a deterministic SHA-256 hash of a numeric record for byte-identity comparison. */
function hashRecord(record: Readonly<Record<string, number>>): string {
  const sortedEntries = Object.keys(record)
    .sort()
    .map((key) => [key, record[key]] as const);
  return createHash('sha256').update(JSON.stringify(sortedEntries)).digest('hex');
}

export class ReplayService {
  private executor: ReplayExecutor | null = null;

  constructor(private readonly store: SnapshotStore) {}

  /** Register the executor function for replay recomputation. */
  setExecutor(executor: ReplayExecutor): void {
    this.executor = executor;
  }

  /**
   * Replay a snapshot by independently recomputing the execution result
   * and verifying byte-identity against the stored snapshot.
   */
  replay(snapshotId: string): ReplayResult | undefined {
    const snapshot = this.store.get(snapshotId);
    if (!snapshot) return undefined;

    if (!this.executor) {
      return {
        snapshotId,
        reproduced: false,
        byteIdentical: false,
        evidenceRefs: snapshot.evidenceRefs,
        diagnostic: 'No executor registered — cannot perform replay recomputation',
      };
    }

    const executionContext = this.extractExecutionContext(snapshot);
    if (!executionContext) {
      return {
        snapshotId,
        reproduced: false,
        byteIdentical: false,
        evidenceRefs: snapshot.evidenceRefs,
        diagnostic: 'No execution context available for replay',
      };
    }

    let recomputed: ReplayExecutionOutput | null;
    try {
      recomputed = this.executor(
        executionContext.engineId,
        executionContext.requestId,
        { ...executionContext.inputs },
      );
    } catch (err) {
      return {
        snapshotId,
        reproduced: false,
        byteIdentical: false,
        evidenceRefs: snapshot.evidenceRefs,
        diagnostic: `Re-execution failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!recomputed) {
      return {
        snapshotId,
        reproduced: false,
        byteIdentical: false,
        evidenceRefs: snapshot.evidenceRefs,
        diagnostic: 'Re-execution returned null',
      };
    }

    const metricsMatch = hashRecord(recomputed.metrics) === hashRecord(snapshot.metrics);
    const scoresMatch = hashRecord(recomputed.scores) === hashRecord(snapshot.scores);
    const verdictMatch = recomputed.verdict === snapshot.verdict;
    const byteIdentical = metricsMatch && scoresMatch && verdictMatch;

    return {
      snapshotId,
      reproduced: true,
      byteIdentical,
      evidenceRefs: snapshot.evidenceRefs,
      recomputedMetrics: Object.freeze({ ...recomputed.metrics }),
      recomputedScores: Object.freeze({ ...recomputed.scores }),
      recomputedVerdict: recomputed.verdict,
      diagnostic: byteIdentical
        ? 'Replay successful — byte-identical'
        : 'Replay completed — output differs',
    };
  }

  replayAll(): ReplayResult[] {
    return this.store.list().map((s) => this.replay(s.snapshotId)!);
  }

  private extractExecutionContext(snapshot: Snapshot): ExecutionContext | null {
    const p = snapshot.provenance;
    if (!p || !p.engineId || !p.requestId) {
      return null;
    }

    const inputs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(p)) {
      if (key.startsWith('input.')) {
        const inputKey = key.slice(6);
        try {
          inputs[inputKey] = JSON.parse(value);
        } catch {
          inputs[inputKey] = value;
        }
      }
    }

    return {
      engineId: p.engineId,
      requestId: p.requestId,
      inputs,
      contractVersion: p.contractVersion,
      calibrationVersion: p.calibrationVersion,
    };
  }
}

export type { Snapshot };
