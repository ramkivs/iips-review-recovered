/**
 * AC-X2 — run the assess→persist→read cycle under the zero-socket probe, from a plain Node process.
 *
 * The test suite asserts the same thing (`server/investment/zero-socket.test.ts`). This CLI exists because the evidence
 * should not be produced *by the test runner*: the runner is extra machinery in the same process as the measurement, and
 * a reader is entitled to see the cycle measured in an ordinary process as well. It also splits the cycle across two
 * processes, so the read is measured in a process that did not do the writing.
 *
 *   tsx server/investment/cli/zero-socket-cycle.ts write --handoff <dir>/handoff.json --record <dir>/write.json
 *   tsx server/investment/cli/zero-socket-cycle.ts read  --handoff <dir>/handoff.json --record <dir>/read.json
 *
 * Exit code 0 means the phase passed; 1 means it did not, and the record says why. Nothing here writes to the product
 * store, and nothing here starts a server.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { prepareM1Environment } from '../demo/m1Pipeline.js';
import { runZeroSocketCycle, runZeroSocketReadCycle, summarise } from '../demo/zeroSocketProbe.js';

interface Handoff {
  readonly dbPath: string;
  readonly issuerId: string;
  readonly headReportId: string;
  readonly writeRecord: string;
}

function arg(name: string): string | null {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<number> {
  const phase = process.argv[2] ?? '';
  const recordPath = arg('record');
  const handoffPath = arg('handoff');
  if (recordPath === null || handoffPath === null) {
    process.stderr.write('usage: zero-socket-cycle.ts <write|read> --handoff <path> --record <path>\n');
    return 2;
  }

  if (phase === 'write') {
    // The environment is deliberately NOT cleaned up: the read phase runs in another process, against this store.
    const env = prepareM1Environment();
    const report = await runZeroSocketCycle({ environment: env });
    mkdirSync(dirname(recordPath), { recursive: true });
    writeFileSync(recordPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    const handoff: Handoff = {
      dbPath: env.dbPath,
      issuerId: 'IN:EQISIN:IN0000000201',
      headReportId: report.cycle.headReportId,
      writeRecord: recordPath,
    };
    writeFileSync(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`, 'utf8');
    process.stdout.write(`\n${summarise(report)}\n\nhandoff: ${handoffPath}\nrecord:  ${recordPath}\n`);
    return report.determination.pass ? 0 : 1;
  }

  if (phase === 'read') {
    const handoff = JSON.parse(readFileSync(handoffPath, 'utf8')) as Handoff;
    const report = await runZeroSocketReadCycle({ databasePath: handoff.dbPath });
    mkdirSync(dirname(recordPath), { recursive: true });
    writeFileSync(recordPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    const headMatches = report.cycle.headReportId === handoff.headReportId;
    process.stdout.write(
      `\n${summarise(report)}\n\nread head ${report.cycle.headReportId} ${headMatches ? '==' : '!='} written head ${handoff.headReportId}\nrecord: ${recordPath}\n`,
    );
    return report.determination.pass && headMatches ? 0 : 1;
  }

  process.stderr.write(`unknown phase "${phase}"; expected write or read\n`);
  return 2;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    process.exit(1);
  },
);
