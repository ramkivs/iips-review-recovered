/**
 * Program v3.0 — NP-13 (D5, §5.2): the MINIMUM protection for reserved Evidence paths.
 *
 * `/evidence/snapshots` and the bare `/evidence/replay` would otherwise be captured by the dynamic
 * `/evidence/:id` route and resolve as evidence "subjects" (issuing `GET /api/evidence/<word>`). This
 * renders the existing explicit unavailable state instead. It performs NO request, and it neither
 * authorizes nor implies a Snapshots (or any other) capability; Replay remains reachable only through an
 * evidence subject at `/evidence/replay/:id`.
 */
import { UnavailableState } from '../../components/state/StateComponents';

const REASON = {
  Snapshots: 'Snapshots — unavailable',
  Replay: 'Replay — unavailable without an evidence subject',
} as const;

export function ReservedEvidencePath({ surface }: { surface: keyof typeof REASON }) {
  return (
    <section aria-label={`${surface} unavailable`} data-testid="evidence-reserved-path">
      <UnavailableState reason={REASON[surface]} />
    </section>
  );
}
