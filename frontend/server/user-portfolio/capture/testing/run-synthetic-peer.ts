#!/usr/bin/env tsx
/**
 * TEST FIXTURE ONLY — runs the synthetic peer as a process, for the hosted-runner
 * end-to-end test of the PowerShell entry point.
 *
 *   tsx server/user-portfolio/capture/testing/run-synthetic-peer.ts <endpoint path> [mode]
 *
 * Serves fabricated data marked `SYNTHETIC-W11-DEP1-FIXTURE`. It is not IPD. A capture
 * taken against it is a utility test and is never evidence. The capture utility never
 * starts this process: only a test harness does.
 */
import { startSyntheticPeer, type SyntheticPeerMode } from './syntheticIpcPeer.js';

const endpointPath = process.argv[2];
const mode = (process.argv[3] ?? 'CONSISTENT') as SyntheticPeerMode;

if (endpointPath === undefined || endpointPath.length === 0) {
  process.stderr.write('usage: run-synthetic-peer <endpoint path> [CONSISTENT|CLASS_P|FIRST_ATTEMPT_INCONSISTENT]\n');
  process.exitCode = 2;
} else {
  startSyntheticPeer(endpointPath, mode).then(
    () => {
      process.stdout.write('SYNTHETIC TEST PEER READY (not IPD; not evidence)\n');
    },
    () => {
      process.stderr.write('the synthetic test peer could not listen on the endpoint\n');
      process.exitCode = 1;
    },
  );
}
