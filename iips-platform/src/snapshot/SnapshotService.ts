/**
 * Snapshot Service — immutable snapshot creation (IES-005 P4 §11, IES-006.2A).
 *
 * Snapshots store execution context in provenance for deterministic replay recomputation.
 */
import type { Clock } from '../infrastructure/Clock';
import type { IdProvider } from '../infrastructure/IdProvider';
import { deepFreeze } from '../infrastructure/deepFreeze';

export interface SnapshotInput {
  readonly engineId: string;
  readonly metrics: Readonly<Record<string, number>>;
  readonly scores: Readonly<Record<string, number>>;
  readonly verdict?: string;
  readonly evidenceRefs?: readonly string[];
  readonly provenance?: Readonly<Record<string, string>>;
  readonly executionContext?: {
    readonly requestId: string;
    readonly inputs: Readonly<Record<string, unknown>>;
    readonly contractVersion?: string;
    readonly calibrationVersion?: string;
  };
}

export interface Snapshot {
  readonly snapshotId: string;
  readonly engineId: string;
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly metrics: Readonly<Record<string, number>>;
  readonly scores: Readonly<Record<string, number>>;
  readonly verdict?: string;
  readonly evidenceRefs: readonly string[];
  readonly provenance: Readonly<Record<string, string>>;
}

export class SnapshotService {
  constructor(
    private readonly clock: Clock,
    private readonly idProvider: IdProvider,
    private readonly schemaVersion = 'snapshot-1.0',
  ) {}

  create(input: SnapshotInput): Readonly<Snapshot> {
    const provenance: Record<string, string> = { ...(input.provenance ?? {}) };
    if (input.executionContext) {
      provenance.engineId = input.engineId;
      provenance.requestId = input.executionContext.requestId;
      if (input.executionContext.contractVersion) {
        provenance.contractVersion = input.executionContext.contractVersion;
      }
      if (input.executionContext.calibrationVersion) {
        provenance.calibrationVersion = input.executionContext.calibrationVersion;
      }
      for (const [key, value] of Object.entries(input.executionContext.inputs)) {
        if (value !== undefined && !key.startsWith('__engine_')) {
          try {
            const serialized = JSON.stringify(value);
            if (serialized !== undefined) {
              provenance[`input.${key}`] = serialized;
            }
          } catch {
            // Skip non-JSON/circular host-injected references
          }
        }
      }
    }

    const snapshot: Snapshot = {
      snapshotId: this.idProvider.generate('SNAP', `${input.engineId}|${this.clock.now()}`),
      engineId: input.engineId,
      schemaVersion: this.schemaVersion,
      generatedAt: this.clock.now(),
      metrics: Object.freeze({ ...input.metrics }),
      scores: Object.freeze({ ...input.scores }),
      verdict: input.verdict,
      evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
      provenance: Object.freeze(provenance),
    };
    return deepFreeze(snapshot);
  }
}
