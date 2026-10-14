/**
 * CV-42 — zero-test / false-green guard for CI.
 *
 * Reads the Vitest JSON summary written by `npm run test:ci` and fails the job unless the run
 * actually executed a non-zero number of tests and every discovered test passed. This is
 * deliberately stricter than a non-zero exit code: the failure class it removes is a runner that
 * exits `0` having collected nothing (the CV-35 class, which no pipeline currently catches).
 *
 * Fail-closed by construction — a missing report, unreadable JSON, an absent counter, a
 * non-integer counter, a zero count or a non-passing summary all exit non-zero. Nothing in this
 * file converts a failure into a success, and it reads no configuration: the path is an argument.
 */
import { readFileSync } from 'node:fs';
import process from 'node:process';

const summaryPath = process.argv[2];

function fail(message) {
  console.error(`assert-tests: ${message}`);
  process.exit(1);
}

if (!summaryPath) {
  fail('no Vitest summary path supplied (usage: node .ci/assert-tests.js <report.json>)');
}

let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
} catch (error) {
  fail(
    `cannot read the Vitest summary at ${summaryPath}: ${error instanceof Error ? error.message : String(error)}. ` +
      'A missing or malformed report means the test step did not run as configured — that is a failure, not a pass.',
  );
}

const total = summary?.numTotalTests;
if (!Number.isInteger(total)) {
  fail(`summary carries no integer numTotalTests field (found ${JSON.stringify(total)})`);
}
if (total === 0) {
  fail('the runner discovered 0 tests; refusing to report success (CV-35 false-green class)');
}
if (summary.success !== true) {
  fail(`summary does not report success (success: ${JSON.stringify(summary.success)})`);
}

const failed = summary?.numFailedTests;
if (!Number.isInteger(failed) || failed !== 0) {
  fail(`${JSON.stringify(failed)} test(s) failed`);
}

const files = Array.isArray(summary.testResults) ? summary.testResults.length : 0;
if (files === 0) {
  fail('the summary lists 0 test files');
}

// Skipped/todo tests are reported but not treated as failures: the suite's current disposition
// for them is a product decision, and CI must not silently change it.
const pending = summary?.numPendingTests ?? 0;
const todo = summary?.numTodoTests ?? 0;
console.log(
  `assert-tests: OK — ${files} test file(s), ${total} test(s), 0 failed` +
    (pending || todo ? ` (${pending} pending, ${todo} todo, reported not enforced)` : ''),
);
