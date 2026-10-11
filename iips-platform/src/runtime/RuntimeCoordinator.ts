/**
 * Runtime Coordinator — execution orchestration (IES-005 P4 §3/§6/§7, IES-006.2A).
 *
 * Registers a governed replay executor with ReplayService and binds execution
 * context when creating snapshots so replay performs actual recomputation.
 */
import type { Container } from '../di/Container';
import type { PluginLoader } from '../plugin-loader/PluginLoader';
import type { ExecutionRequest, ExecutionResult } from '../plugin-loader/PluginContract';
import type { SnapshotService } from '../snapshot/SnapshotService';
import type { SnapshotStore } from '../snapshot/SnapshotStore';
import type { ReplayService, ReplayExecutor, ReplayExecutionOutput } from '../replay/ReplayService';

export type RuntimeState =
  | 'READY'
  | 'INITIALIZED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REPLAYING';

const DIRECT_SNAPSHOT_MARKER = '__directSnapshotRecord';

interface DirectSnapshotPayload {
  readonly [DIRECT_SNAPSHOT_MARKER]: true;
  readonly requestInputs?: Readonly<Record<string, unknown>>;
  readonly metrics: Readonly<Record<string, number>>;
  readonly scores: Readonly<Record<string, number>>;
  readonly verdict?: string;
}

export class RuntimeCoordinator {
  private state: RuntimeState = 'READY';
  private activeExecution: { engineId: string; request: ExecutionRequest; recordedSnapshot: boolean } | null = null;
  private readonly unrecordedRequests = new Map<string, ExecutionRequest>();
  private replayCapture: { engineId: string; captured: ReplayExecutionOutput | null } | null = null;

  constructor(
    private readonly container: Container,
    private readonly plugins: PluginLoader,
    private readonly snapshotService: SnapshotService,
    private readonly snapshotStore: SnapshotStore,
    private readonly replayService: ReplayService,
  ) {
    this.replayService.setExecutor(this.createReplayExecutor());
  }

  getState(): RuntimeState {
    return this.state;
  }

  initialize(): void {
    this.state = 'INITIALIZED';
  }

  /** Execute a plugin request and produce a snapshot. */
  execute(engineId: string, request: ExecutionRequest): { result: ExecutionResult; snapshotId?: string } {
    this.state = 'RUNNING';
    const prevExecution = this.activeExecution;
    const currentExecution = { engineId, request, recordedSnapshot: false };
    this.activeExecution = currentExecution;
    try {
      const result = this.plugins.execute(engineId, request);
      if (!result) {
        this.state = 'FAILED';
        throw new Error(`Unknown engine: ${engineId}`);
      }
      if (!currentExecution.recordedSnapshot) {
        this.unrecordedRequests.set(engineId, request);
      } else {
        this.unrecordedRequests.delete(engineId);
      }
      if (result.state === 'COMPLETED') {
        this.state = 'COMPLETED';
        return { result, snapshotId: result.snapshotRef };
      }
      this.state = result.state === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
      return { result };
    } finally {
      this.activeExecution = prevExecution;
    }
  }

  /** Create + store a snapshot from computed outputs (with execution context for replay). */
  recordSnapshot(
    engineId: string,
    metrics: Record<string, number>,
    scores: Record<string, number>,
    verdict?: string,
    requestId?: string,
    inputs?: Record<string, unknown>,
  ) {
    if (this.replayCapture && this.replayCapture.engineId === engineId) {
      const recomputedSnap = this.snapshotService.create({
        engineId,
        metrics,
        scores,
        verdict,
      });
      this.replayCapture.captured = {
        metrics: { ...recomputedSnap.metrics },
        scores: { ...recomputedSnap.scores },
        verdict: recomputedSnap.verdict,
      };
      return recomputedSnap;
    }

    if (this.activeExecution && this.activeExecution.engineId === engineId) {
      this.activeExecution.recordedSnapshot = true;
    }

    const activeForEngine =
      this.activeExecution && this.activeExecution.engineId === engineId
        ? this.activeExecution.request
        : this.plugins.activeRequest?.(engineId);
    const unrecordedRequest = this.unrecordedRequests.get(engineId);

    const executionContext =
      requestId !== undefined
        ? {
            requestId,
            inputs: inputs ?? {},
          }
        : activeForEngine !== undefined
          ? {
              requestId: activeForEngine.requestId,
              inputs: activeForEngine.inputs,
            }
          : {
              requestId: unrecordedRequest?.requestId ?? `snapshot-${engineId}`,
              inputs: {
                [DIRECT_SNAPSHOT_MARKER]: true,
                ...(unrecordedRequest ? { requestInputs: unrecordedRequest.inputs } : {}),
                metrics: { ...metrics },
                scores: { ...scores },
                ...(verdict !== undefined ? { verdict } : {}),
              } satisfies DirectSnapshotPayload,
            };

    const snapshot = this.snapshotService.create({
      engineId,
      metrics,
      scores,
      verdict,
      executionContext,
    });
    this.snapshotStore.append(snapshot);
    return snapshot;
  }

  replay(snapshotId: string) {
    this.state = 'REPLAYING';
    const r = this.replayService.replay(snapshotId);
    this.state = 'COMPLETED';
    return r;
  }

  private createReplayExecutor(): ReplayExecutor {
    return (engineId: string, requestId: string, inputs: Record<string, unknown>): ReplayExecutionOutput | null => {
      if (inputs[DIRECT_SNAPSHOT_MARKER] === true) {
        const direct = inputs as unknown as DirectSnapshotPayload;
        if (direct.requestInputs !== undefined && this.plugins.has(engineId)) {
          const execResult = this.plugins.execute(engineId, {
            requestId,
            inputs: direct.requestInputs,
          });
          if (!execResult || execResult.state !== 'COMPLETED') {
            return null;
          }
        }
        const recomputed = this.snapshotService.create({
          engineId,
          metrics: direct.metrics,
          scores: direct.scores,
          verdict: direct.verdict,
        });
        return {
          metrics: { ...recomputed.metrics },
          scores: { ...recomputed.scores },
          verdict: recomputed.verdict,
        };
      }

      if (!this.plugins.has(engineId)) {
        return null;
      }

      const prevCapture = this.replayCapture;
      const captureState: { engineId: string; captured: ReplayExecutionOutput | null } = {
        engineId,
        captured: null,
      };
      this.replayCapture = captureState;
      try {
        const result = this.plugins.execute(engineId, { requestId, inputs });
        if (!result || result.state !== 'COMPLETED') {
          return null;
        }
        return captureState.captured;
      } finally {
        this.replayCapture = prevCapture;
      }
    };
  }
}
