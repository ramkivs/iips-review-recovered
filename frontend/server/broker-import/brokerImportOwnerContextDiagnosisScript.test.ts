/**
 * Contract tests for `tools/windows/diagnose-broker-import-owner-context.ps1`.
 *
 * WHY A TEST ON A POWERSHELL FILE
 *   The script is the operator's only host-side instrument for this incident, and
 *   two of its guarantees are load-bearing:
 *
 *     1. it must stay READ ONLY and must stay parseable by Windows PowerShell 5.1
 *        (no else / elseif / finally, per the operating constraint in force);
 *     2. its process-role classifier must identify the ONE process that can serve
 *        \\.\pipe\iips-user-portfolio-v1 — the node process running IPD's
 *        `ipc\entrypoint.js` — and must never report an IRR executive transport
 *        as an IPD provider candidate.
 *
 *   (2) was wrong on the first host run: the classifier matched on the IPD
 *   repository path alone, so both IRR executive transports were reported under
 *   "IPD provider PID candidates". These tests pin the corrected behaviour.
 *
 * HOW THE CLASSIFIER IS TESTED WITHOUT POWERSHELL
 *   The role rules are EXTRACTED FROM THE SCRIPT SOURCE, not duplicated here, so
 *   editing the script changes what these tests assert. PowerShell single-quoted
 *   strings are literal, and .NET and JavaScript agree on every construct the
 *   rules use (`\\`, `\.`, character classes, `*`, `+`), so the extracted pattern
 *   text is used directly as a JavaScript RegExp.
 *
 * SIMULATION BOUNDARY
 *   The command lines below are the nine real `node.exe` command lines the operator's
 *   Windows host reported. Applying the classifier to them here is a SIMULATION of
 *   the host run: it proves the script's logic, not the host's process table.
 *
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(HERE, '../../../tools/windows/diagnose-broker-import-owner-context.ps1');

/** Read once. A missing script is a hard failure, not a skipped test. */
const SCRIPT = readFileSync(SCRIPT_PATH, 'utf8');
const LINES = SCRIPT.split(/\r?\n/);

interface RoleRule {
  readonly pattern: string;
  readonly role: string;
  /** True when PowerShell only evaluates the rule while the role is still the default. */
  readonly guarded: boolean;
}

const ROLE_RULES: readonly RoleRule[] = LINES.flatMap(line => {
  const match = /if \(\$cmd -match '([^']+)'\) \{ \$role = '([^']+)' \}/.exec(line);
  if (match === null) return [];
  return [{
    pattern: match[1],
    role: match[2],
    guarded: /if \(\$role -eq 'unrecognised node process'\)/.test(line),
  }];
});

const DEFAULT_ROLE = 'unrecognised node process';
const PIPE_SERVER_ROLE = 'IPD IPC provider (pipe-server candidate)';

/** Mirrors the script's first-match-wins loop, including its guard. */
function classifyCommandLine(cmd: string): string {
  let role = DEFAULT_ROLE;
  for (const rule of ROLE_RULES) {
    if (rule.guarded && role !== DEFAULT_ROLE) continue;
    if (new RegExp(rule.pattern).test(cmd)) role = rule.role;
  }
  return role;
}

/**
 * The nine `node.exe` command lines reported by the operator's Windows host,
 * keyed by PID. Two are truncated at 150 characters by the script's own output
 * limit; the parts the classifier depends on are intact.
 */
const HOST_COMMAND_LINES: Readonly<Record<string, string>> = {
  '27488': '"C:\\Node22\\node-v22.16.0-win-x64\\node.exe" H:\\IIPS\\iips-production-market-data\\dist\\src\\providers\\dhan\\dhan_local_daemon.js ',
  '25456': '"C:\\Node22\\node-v22.16.0-win-x64\\node.exe" H:\\IIPS\\iips-production-market-data\\dist\\src\\ipc\\entrypoint.js ',
  '26248': '"C:\\Node22\\node-v22.16.0-win-x64\\\\node.exe"  "C:\\Node22\\node-v22.16.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js" run server:dev',
  '23724': '"node"   "C:\\tmp\\iips-review-recovered\\frontend\\node_modules\\.bin\\..\\tsx\\dist\\cli.mjs" --env-file-if-exists=../.env.local server/executive-transport.ts',
  '8268': '"C:\\Program Files\\nodejs\\node.exe" --require C:\\tmp\\iips-review-recovered\\frontend\\node_modules\\tsx\\dist\\preflight.cjs --import file:///C:/tmp/iips-review-recovered/frontend/server/executive-transport.ts',
  '10996': '"C:\\Node22\\node-v22.16.0-win-x64\\\\node.exe"  "C:\\Node22\\node-v22.16.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js" run dev -- --host 127.0.0.1 --port 5176',
  '3408': '"node"   "C:\\tmp\\iips-review-recovered\\frontend\\node_modules\\.bin\\..\\vite\\bin\\vite.js" --host 127.0.0.1 --port 5176 --strictPort',
  '21132': '"C:\\Node22\\node-v22.16.0-win-x64\\\\node.exe"  "C:\\Node22\\node-v22.16.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js" run dev -- --host 127.0.0.1 --port 5174',
  '18768': '"node"   "H:\\IIPS\\iips-production-market-data\\node_modules\\.bin\\..\\vite\\bin\\vite.js" --host 127.0.0.1 --port 5174 --strictPort',
};

describe('the diagnosis script is safe to paste and stays read-only', () => {
  it('uses no else, elseif or finally — the Windows PowerShell 5.1 constraint', () => {
    // Counted as whole tokens so a word like "elsewhere" cannot mask a violation.
    const offenders = LINES.filter(line => /(^|[^a-zA-Z-])(else|elseif|finally)([^a-zA-Z-]|$)/.test(line));
    expect(offenders).toEqual([]);
  });

  it('contains no write-capable verb at the start of a statement', () => {
    const offenders = LINES.filter(line =>
      /^\s*(Set-Content|Add-Content|Out-File|New-Item|Remove-Item|Set-ItemProperty|Restart-Service|Stop-Service|Start-Service|Stop-Process|Remove-Job)\b/.test(line));
    // Remove-Job cleans up the script's own bounded timeout jobs; nothing else may write.
    expect(offenders.every(line => /Remove-Job/.test(line))).toBe(true);
  });

  it('issues no network request and never dispatches a portfolio write', () => {
    const offenders = LINES.filter(line =>
      /Invoke-RestMethod|Invoke-WebRequest|importBroker|portfolio\.save|\bcurl\b|\biwr\b/.test(line));
    expect(offenders).toEqual([]);
  });

  it('is balanced — an unbalanced brace would make the pasted script unparseable', () => {
    const opens = (SCRIPT.match(/\{/g) ?? []).length;
    const closes = (SCRIPT.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
  });
});

describe('the stale hard-coded provider PID is gone', () => {
  it('never names PID 21568, which is absent from the current host process table', () => {
    expect(SCRIPT).not.toContain('21568');
  });

  it('identifies the pipe-server candidate by the IPC entrypoint in its command line', () => {
    // The replacement for the stale PID: a role, not a number. A PID is only ever
    // what the host reports at run time; a role survives a restart.
    // String.raw: the script stores the PowerShell single-quoted literal verbatim, so
    // the pattern appears in the file exactly as written here.
    expect(SCRIPT).toContain(String.raw`[\\/]ipc[\\/]entrypoint\.js`);
    expect(SCRIPT).toContain(PIPE_SERVER_ROLE);
  });
});

describe('process-role classification against the operator’s nine real command lines', () => {
  it('extracted the classifier rules from the script itself', () => {
    // Guards against the block being edited away, which would silently reduce
    // every assertion below to a classification of "unrecognised".
    expect(ROLE_RULES.length).toBeGreaterThanOrEqual(4);
    expect(ROLE_RULES.some(rule => rule.role === PIPE_SERVER_ROLE)).toBe(true);
    expect(ROLE_RULES.some(rule => rule.role === 'IRR executive transport')).toBe(true);
  });

  it('classifies PID 25456 as the pipe-server candidate — IPD’s ipc\\entrypoint.js', () => {
    expect(classifyCommandLine(HOST_COMMAND_LINES['25456'])).toBe(PIPE_SERVER_ROLE);
  });

  it('classifies PIDs 8268 and 23724 as IRR executive transports, never as IPD providers', () => {
    expect(classifyCommandLine(HOST_COMMAND_LINES['8268'])).toBe('IRR executive transport');
    expect(classifyCommandLine(HOST_COMMAND_LINES['23724'])).toBe('IRR executive transport');
  });

  it('classifies PID 27488 as a provider daemon, not the IPC provider', () => {
    // dhan_local_daemon.js lives in the IPD tree and was previously reported as an
    // IPD provider candidate purely because of that path.
    expect(classifyCommandLine(HOST_COMMAND_LINES['27488'])).toBe('IPD provider daemon (not the IPC provider)');
  });

  it('classifies the two vite dev servers as vite, not as IPD providers', () => {
    expect(classifyCommandLine(HOST_COMMAND_LINES['3408'])).toBe('vite dev server');
    expect(classifyCommandLine(HOST_COMMAND_LINES['18768'])).toBe('vite dev server');
  });

  it('leaves the three npm wrappers unrecognised', () => {
    expect(classifyCommandLine(HOST_COMMAND_LINES['26248'])).toBe(DEFAULT_ROLE);
    expect(classifyCommandLine(HOST_COMMAND_LINES['10996'])).toBe(DEFAULT_ROLE);
    expect(classifyCommandLine(HOST_COMMAND_LINES['21132'])).toBe(DEFAULT_ROLE);
  });

  it('reports exactly ONE pipe-server candidate: PID 25456', () => {
    // The regression this fixes: the previous classifier produced
    // "27488, 25456, 23724, 8268, 18768", which listed both IRR executive
    // transports as IPD provider candidates.
    const candidates = Object.keys(HOST_COMMAND_LINES)
      .filter(pid => classifyCommandLine(HOST_COMMAND_LINES[pid]) === PIPE_SERVER_ROLE);
    expect(candidates).toEqual(['25456']);
  });

  it('never reports an IRR process as a pipe-server candidate', () => {
    for (const [pid, cmd] of Object.entries(HOST_COMMAND_LINES)) {
      const role = classifyCommandLine(cmd);
      const isIrrProcess = cmd.includes('iips-review-recovered');
      if (isIrrProcess) expect(role, pid).not.toBe(PIPE_SERVER_ROLE);
    }
  });
});
