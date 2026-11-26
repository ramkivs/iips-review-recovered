/**
 * W-38 operator command: one local startup readiness preflight.
 *
 * Usage (from `frontend/`): `npm run w38:preflight`
 *
 * The command reads only server-side transport configuration from `process.env`, performs one
 * authenticated loopback diagnostics read through IPD's own client, prints seven fixed-text
 * PASS / FAIL / CONFIG-MISSING lines plus an overall result, and exits non-zero unless every
 * check passed. It never prints a credential, a URL, a filesystem path or a vault-scheme reference.
 */

import { formatPreflightReport, runStartupPreflight } from './dhanStartupPreflight';

const report = await runStartupPreflight(process.env);
process.stdout.write(`${formatPreflightReport(report)}\n`);
process.exitCode = report.overall === 'READY' ? 0 : 1;
