import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReplaySummary, SnapshotMetadataPanel, EvidenceRecordCard } from './EvidenceExplorerComponents';
import { REPLAY_STATES } from '../../api/replay';
describe('truthful application replay summaries', () => {
  it.each(REPLAY_STATES)('renders %s as a distinct explicit state', state => {
    render(<ReplaySummary replay={{ state, diagnostic: `Diagnostic for ${state}` }} />);
    expect(screen.getByTestId('replay-state')).toHaveTextContent(state);
    expect(screen.getByTestId('replay-summary')).toHaveTextContent(`Diagnostic for ${state}`);
    expect(screen.queryByText('MATCH')).not.toBeInTheDocument(); expect(screen.queryByText('DIFFERENCE')).not.toBeInTheDocument();
    expect(screen.queryByText(/Byte-identical: Yes/)).not.toBeInTheDocument();
    if (state !== 'COMPLETED_DIFFERENT') expect(screen.queryByText('Different canonical Screen result')).not.toBeInTheDocument();
    if (state !== 'COMPLETED_EQUIVALENT') expect(screen.queryByText('Equivalent canonical Screen result')).not.toBeInTheDocument();
  });
  it('limits equivalence to the native Screen comparison and says attempts are not retained', () => {
    render(<ReplaySummary replay={{ state: 'COMPLETED_EQUIVALENT', comparisonScope: 'NP12RES-v01', attemptId: 'unit-attempt' }} />);
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('NP12RES-v01');
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('Not snapshot, HTTP, evidence-package or upstream-pipeline byte identity');
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('not retained as history');
  });
  it('labels preserved reference aliases rather than suggesting durable evidence packages', () => {
    render(<><SnapshotMetadataPanel referenceOnly snapshot={{ snapshotId: 'snap_Banking', engineId: 'sector.banking', schemaVersion: 'snapshot-1.0', generatedAt: '2026-08-09', verdict: 'Watch' }} />
      <EvidenceRecordCard referenceOnly evidence={{ evidenceId: 'ev_Banking', engineId: 'sector.banking', recommendation: 'Watch', compositeScore: 47.1, confidence: 0.8, calibrationVersion: '1.0.0', decisionRulesApplied: [], generatedAt: '2026-08-09' }} /></>);
    expect(screen.getByTestId('snapshot-metadata-panel')).toHaveTextContent('Reference snapshot alias');
    expect(screen.getByTestId('evidence-record-card')).toHaveTextContent('Reference evidence alias');
    expect(screen.getByTestId('evidence-record-card')).toHaveTextContent('47.1');
  });
});
