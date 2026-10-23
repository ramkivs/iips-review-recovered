/** Inspect a real process-local Screen original; replay occurs only on explicit user action. */
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CAPTURE_UUID, fetchReplayData, fetchScreenCapture, replayScreenCapture, type CaptureInspection, type ReplayData, type ReplayOutcome } from '../../api/replay';
import { ReplaySummary } from '../../components/evidence/EvidenceExplorerComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { FreshnessBadge } from '../../components/ui/Badges';

type View = CaptureInspection | ReplayData;
export function ReplayExplorer() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<View | null>(null);
  const [loadedId, setLoadedId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const pending = useRef(false);
  const identity = useRef(id);
  identity.current = id;
  const captureHandle = Boolean(id && CAPTURE_UUID.test(id));

  useEffect(() => {
    const token = ++generation.current;
    let active = true;
    pending.current = false;
    setBusy(false); setData(null); setLoading(true); setError(null); setActionError(null);
    if (!id) { setLoading(false); return; }
    const read = CAPTURE_UUID.test(id) ? fetchScreenCapture(id) : fetchReplayData(id);
    read.then(value => {
      if (active && token === generation.current) { setData(value); setLoadedId(id); }
    }).catch(e => { if (active) { setError(String(e)); setLoadedId(id); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; generation.current++; };
  }, [id]);

  async function replay() {
    if (!id || !data?.original || pending.current) return;
    const requestedId = id;
    const token = generation.current;
    pending.current = true; setBusy(true); setActionError(null);
    const waiting: ReplayOutcome = { state: 'NOT_PERFORMED', diagnostic: 'Independent replay is in progress; no comparison outcome yet.' };
    setData(previous => previous ? { ...previous, replay: waiting } : previous);
    try {
      const response = await replayScreenCapture(requestedId);
      if (identity.current === requestedId && token === generation.current) {
        setData(previous => previous ? { ...previous, replay: response.replay } : previous);
      }
    } catch (e) {
      if (identity.current === requestedId && token === generation.current) {
        setActionError(`Replay outcome could not be established: ${String(e)}. No difference is claimed.`);
      }
    } finally {
      if (identity.current === requestedId && token === generation.current) { pending.current = false; setBusy(false); }
    }
  }
  if (!id) return <UnavailableState />;
  if (loading || loadedId !== id) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load replay: ${error}`} />;
  if (!data) return <UnavailableState />;
  const original = data.original;
  return (
    <section aria-label="Replay explorer">
      <h1>Replay — {id}</h1>
      <p>This application capture is retained only in the current server process. It is not durable history,
        private user storage, an evidence archive or a new certification.</p>
      {original && (
        <section data-testid="replay-original" aria-label="Retained original Screen evaluation">
          <h2>Retained original Screen evaluation</h2>
          <FreshnessBadge state="snapshot" />
          <p>Capture occurrence <code>{original.snapshotId}</code> · {original.schemaVersion}</p>
          <p>Definition <code>{original.definition.definitionId}</code> · version {original.definition.version}</p>
          <p>Definition digest <code>{original.execution.definitionDigest}</code></p>
          <p>Population <code>{original.definition.populationIdentity}</code> · {original.execution.memberCount} members</p>
          <p>Original result: {original.result.matchedCount} of {original.result.totalPopulationCount} matched · {original.result.executionStatus}</p>
          <p>executionId <code>{original.execution.executionId}</code></p>
          <p>resultId <code>{original.result.resultId}</code></p>
          <p>Evaluator {original.execution.evaluatorId} / {original.execution.evaluatorVersion} / {original.execution.executionSemanticsVersion}</p>
          <p>Original Screen timestamp: {original.execution.timestamp ?? 'not recorded'} · requestId: {original.execution.requestId ?? 'not recorded'}</p>
          <p>Vintage {original.vintage.mode} · {original.vintage.dataVersion} as of {original.vintage.asOf} · {original.vintage.dataSource}</p>
          <details><summary>Original canonical predicates and member results</summary>
            <pre>{JSON.stringify(original.definition.predicates, null, 2)}</pre>
            <table><thead><tr><th>Sector</th><th>Reference</th><th>Original status</th><th>Error</th></tr></thead>
              <tbody>{original.result.members.map(member => <tr key={`${member.sector}:${member.referenceId}`}>
                <td>{member.sector}</td><td>{member.referenceId}</td><td>{member.memberResultStatus}</td><td>{member.memberErrorCode || '—'}</td>
              </tr>)}</tbody>
            </table>
          </details>
          <h3>Original upstream references</h3>
          <p>These genuine original producer references are retained as identifiers only. Stage A does not retain or retrieve the upstream evidence packages/snapshots.</p>
          <ul data-testid="replay-evidence-refs">{original.memberProvenance.map(p => <li key={`${p.sector}:${p.referenceId}`}>
            {p.sector} / {p.referenceId}: <code>{p.snapshotId}</code> · <code>{p.evidenceId}</code> · original producer audit {p.timestamp}
          </li>)}</ul>
          <button type="button" data-testid="replay-run" onClick={() => void replay()} disabled={busy}>
            {busy ? 'Replaying…' : 'Replay saved Screen inputs'}
          </button>
        </section>
      )}
      {!original && !captureHandle && <p>No retained original is selected. This sector link provides reference availability only.</p>}
      {actionError && <p role="alert">{actionError} The previous confirmed outcome below does not describe this request.</p>}
      {(busy || actionError) && <p data-testid="replay-previous-outcome">Previous confirmed outcome, not the latest request{busy ? ' (request in progress)' : ''}.</p>}
      <ReplaySummary replay={data.replay} />
      {data.replay.result && <p data-testid="replay-actual-result">Replay result: {data.replay.result.matchedCount} of {data.replay.result.totalPopulationCount} matched · resultId <code>{data.replay.result.resultId}</code></p>}
      {'note' in data && <p>{data.note}</p>}
      <p><Link to="/screener">Run a new governed Screen</Link></p>
      {!captureHandle && <p><Link to={`/evidence/${encodeURIComponent(id)}`}>Reference evidence context →</Link></p>}
    </section>
  );
}
