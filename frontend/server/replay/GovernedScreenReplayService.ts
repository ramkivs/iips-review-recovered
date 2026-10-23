/** Independent governed Screen replay. No engine ReplayService, producer or expected-result executor input. */
import { randomUUID } from 'node:crypto';
import { TransportError } from '../transport-error';
import { executeScreen, ScreenExecutionError } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import { ScreenDefinitionError } from '../../../iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition';
import { ScreenProducerError } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import {
  LIMITS, CapturePolicyError, OriginalContractError, ScreenCaptureStore,
  assembleCapture, preflightCapture, projectExecution, validateOriginal, validateResult,
  deriveExecution, canonicalResultBytes, detachedFrozen,
  type OriginalRunner, type OriginalScreenReceipt, type PreparedScreen,
  type ReplayOutcome, type ScreenEvaluationSnapshot, type ExecutionProjection,
} from './ScreenEvaluationSnapshot';

export interface WireReply { readonly status: number; readonly body: unknown; readonly json: string }
export function wireReply(status: number, body: unknown): WireReply {
  const json = JSON.stringify(body);
  if (Buffer.byteLength(json, 'utf8') > LIMITS.responseBytes) throw new CapturePolicyError(500, 'RESPONSE_TOO_LARGE', 'The response exceeds the application limit.');
  return { status, body, json };
}
export interface ReplayReplyBody { readonly snapshotId?: string; readonly original?: ScreenEvaluationSnapshot; readonly replay: ReplayOutcome }

/** Dependencies are internal composition/test seams, never selectable by HTTP clients. */
export interface ReplayComputation {
  execute: typeof executeScreen;
  compare: (original: Buffer, actual: Buffer) => boolean;
}
export class GovernedScreenReplayService {
  private active = false;
  constructor(readonly store: ScreenCaptureStore, private readonly computation: ReplayComputation = {
    execute: input => executeScreen(input), compare: (original, actual) => original.equals(actual),
  }) {}
  acquireOperation(): (() => void) | undefined {
    if (this.active) return undefined;
    this.active = true;
    let released = false;
    return () => { if (!released) { released = true; this.active = false; } };
  }
  capture(definition: unknown, runOriginal: OriginalRunner, cancelled: () => boolean = () => false): WireReply {
    let reservation: ReturnType<ScreenCaptureStore['reserve']> | undefined;
    let saved: ReturnType<typeof preflightCapture> | undefined;
    let receipt: OriginalScreenReceipt | undefined;
    let validatedOriginal: ScreenEvaluationSnapshot | undefined;
    let executionStarted = false;
    let evaluationState: 'NOT_STARTED' | 'FAILED' | 'COMPLETED' = 'NOT_STARTED';
    let phase: 'REQUEST' | 'PRODUCTION' | 'CAPTURE' | 'EXECUTION' = 'CAPTURE';
    try {
      reservation = this.store.reserve(); // worst-case slot/byte reservation precedes production
      phase = 'PRODUCTION';
      receipt = runOriginal(definition, (prepared: PreparedScreen) => {
        phase = 'CAPTURE';
        if (saved) throw new Error('Original preflight must occur exactly once.');
        saved = preflightCapture(reservation!.snapshotId, prepared, this.store.config.maxCaptureBytes);
        if (cancelled()) throw new CapturePolicyError(400, 'CAPTURE_REQUEST_ABORTED', 'The request ended before Screen execution.');
        phase = 'EXECUTION';
        executionStarted = true;
      });
      evaluationState = 'COMPLETED';
      phase = 'CAPTURE';
      if (!saved) throw new Error('The original runner did not perform preflight.');
      validatedOriginal = validateOriginal(assembleCapture(reservation.snapshotId, saved, projectExecution(receipt.execution), receipt.result));
      const original = validatedOriginal;
      // Preparation/serialization can fail; do all of it BEFORE the atomic append.
      const response = wireReply(201, { captureState: 'RETAINED', evaluationState: 'COMPLETED', original });
      reservation.commit(original);
      return response;
    } catch (error) {
      if (executionStarted && evaluationState === 'NOT_STARTED') evaluationState = 'FAILED';
      let status = 500;
      let code = evaluationState === 'COMPLETED' ? 'CAPTURE_RETENTION_FAILED' : 'CAPTURE_FAILED';
      let diagnostic = evaluationState === 'COMPLETED'
        ? 'The Screen completed, but its original was not retained. No replay handle is available.'
        : 'The capture operation failed; no original was retained.';
      if (error instanceof TransportError && evaluationState !== 'COMPLETED') {
        status = error.status; code = 'CAPTURE_REQUEST_REJECTED'; phase = 'REQUEST'; diagnostic = error.message;
      } else if (error instanceof OriginalContractError && evaluationState !== 'COMPLETED') {
        status = 422; code = error.code; diagnostic = error.message;
      } else if (error instanceof CapturePolicyError && evaluationState !== 'COMPLETED') {
        status = error.status; code = error.code; diagnostic = error.message;
      } else if (evaluationState !== 'COMPLETED' && (error instanceof ScreenDefinitionError || error instanceof ScreenProducerError || error instanceof ScreenExecutionError)) {
        status = 422; code = error.code;
        if (error instanceof ScreenDefinitionError) phase = 'REQUEST';
        diagnostic = error instanceof ScreenProducerError ? 'Original member production failed; the Screen was not evaluated.'
          : error instanceof ScreenDefinitionError ? 'The original Screen definition was rejected.' : 'The original Screen execution failed.';
      }
      let evaluation: { execution: ExecutionProjection; result: OriginalScreenReceipt['result']; vintage: OriginalScreenReceipt['vintage'] } | undefined;
      if (evaluationState === 'COMPLETED' && validatedOriginal) {
        // Only previously validated, immutable and size-bounded original fields may be transient output.
        // A malformed post-evaluation receipt is not repaired, truncated or exposed as canonical output.
        evaluation = { execution: validatedOriginal.execution, result: validatedOriginal.result, vintage: validatedOriginal.vintage };
      }
      return wireReply(status, { captureState: 'NOT_RETAINED', evaluationState, phase, code, diagnostic,
        ...(evaluation ? { evaluation } : {}) });
    } finally {
      reservation?.release();
    }
  }
  private original(id: string): ScreenEvaluationSnapshot | ReplayOutcome {
    const value = this.store.get(id);
    if (!value) return { state: 'ORIGINAL_UNAVAILABLE', code: 'ORIGINAL_UNAVAILABLE', diagnostic: 'This original is unavailable in this process. It may belong to a previous or different process.' };
    try { return validateOriginal(value, id); }
    catch (error) {
      if (error instanceof OriginalContractError) return { state: error.state, code: error.code, diagnostic: error.message };
      return { state: 'ORIGINAL_INVALID', code: 'ORIGINAL_INVALID', diagnostic: 'Original integrity validation failed; no replay was performed.' };
    }
  }
  inspect(id: string): WireReply {
    const original = this.original(id);
    if ('state' in original) return wireReply(original.state === 'ORIGINAL_UNAVAILABLE' ? 404 : 422, { replay: original });
    return wireReply(200, { original, replay: { state: 'NOT_PERFORMED', diagnostic: 'Original loaded. Select Replay to independently evaluate its saved inputs.' } });
  }
  replay(id: string): WireReply {
    const original = this.original(id);
    if ('state' in original) return wireReply(original.state === 'ORIGINAL_UNAVAILABLE' ? 404 : 422, { replay: original });
    const attemptId = randomUUID();
    let output: ReturnType<typeof executeScreen>;
    try {
      const { definition } = deriveExecution(original.definition, original.memberInputs, original.execution);
      // Expected execution/result NEVER cross the evaluator boundary. Preserve audit absence.
      output = this.computation.execute({
        definition, members: original.memberInputs,
        ...(Object.prototype.hasOwnProperty.call(original.execution, 'timestamp') ? { timestamp: original.execution.timestamp } : {}),
        ...(Object.prototype.hasOwnProperty.call(original.execution, 'requestId') ? { requestId: original.execution.requestId } : {}),
      });
    } catch {
      return wireReply(500, { snapshotId: id, replay: { state: 'EXECUTION_FAILED', attemptId, code: 'REPLAY_EXECUTION_FAILED', diagnostic: 'Independent Screen execution failed. No difference was established.' } });
    }
    try {
      const execution = projectExecution(output.execution);
      const expected = deriveExecution(original.definition, original.memberInputs, original.execution);
      // No result evaluation here: verify the actual execution's complete input bindings.
      if (JSON.stringify(execution) !== JSON.stringify(projectExecution(expected.execution))) throw new Error('Replay execution binding mismatch.');
      validateResult(output.result, execution);
      const equivalent = this.computation.compare(canonicalResultBytes(original.result), canonicalResultBytes(output.result));
      return wireReply(200, { snapshotId: id, replay: detachedFrozen({
        state: equivalent ? 'COMPLETED_EQUIVALENT' : 'COMPLETED_DIFFERENT', attemptId,
        comparisonScope: 'NP12RES-v01', execution, result: output.result,
        diagnostic: equivalent ? 'Equivalent canonical Screen result.' : 'Independent replay completed with a different canonical Screen result.',
      }) });
    } catch {
      return wireReply(500, { snapshotId: id, replay: { state: 'COMPARISON_FAILED', attemptId,
        code: 'REPLAY_COMPARISON_FAILED', diagnostic: 'A trustworthy canonical comparison could not be completed. No difference was established.' } });
    }
  }
}
