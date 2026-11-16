/**
 * Contract tests for `tools/windows/capture-owner-bound-portfolio.ps1`.
 *
 * WHY A TEST ON A POWERSHELL FILE
 *   The script is the operator's single entry point for the W11 dependency 1 capture.
 *   Its guarantees are load-bearing and can be checked from its source: it is read-only
 *   toward IPD and toward the host configuration, it stays parseable by Windows
 *   PowerShell 5.1, it runs the repository's capture CLI through the installed runner
 *   the same way the IRR transport is started, and it exits with the CLI's exit code.
 *
 * SIMULATION BOUNDARY
 *   These are STATIC checks of the script text plus a simulation of its command-line
 *   classifier against command lines a Windows host reported earlier. PowerShell is not
 *   executed here, no Windows host is involved, and nothing below is capture evidence.
 *
 * @vitest-environment node
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CAPTURE_EXIT_CODES } from './ownerBoundPortfolioCapture.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, '../../../..');
const SCRIPT_PATH = path.join(REPOSITORY_ROOT, 'tools/windows/capture-owner-bound-portfolio.ps1');

/** Read once. A missing script is a hard failure, not a skipped test. */
const SCRIPT = readFileSync(SCRIPT_PATH, 'utf8');
const LINES = SCRIPT.split(/\r?\n/);
/** Statement lines: the comment-based help and `#` comments removed. */
const CODE_LINES = SCRIPT.replace(/<#[\s\S]*?#>/, '')
  .split(/\r?\n/)
  .filter((line) => !/^\s*#/.test(line));
const CODE = CODE_LINES.join('\n');
/** Statement lines with every string literal emptied, for operator-level checks. */
const BARE_LINES = CODE_LINES.map((line) => line.replace(/'(?:[^']|'')*'/g, "''").replace(/"[^"]*"/g, '""'));
const BARE = BARE_LINES.join('\n');

describe('the capture entry point stays parseable by Windows PowerShell 5.1', () => {
  it('is pure ASCII — PowerShell 5.1 reads a BOM-less file in the ANSI code page', () => {
    const offenders = LINES.filter((line) => /[^\x00-\x7F]/.test(line));
    expect(offenders).toEqual([]);
  });

  it('uses no else, elseif or finally — the Windows PowerShell 5.1 constraint in force', () => {
    const offenders = LINES.filter((line) => /(^|[^a-zA-Z-])(else|elseif|finally)([^a-zA-Z-]|$)/.test(line));
    expect(offenders).toEqual([]);
  });

  it('uses no PowerShell 7-only operator', () => {
    // Null-coalescing, pipeline chains and the ternary are PowerShell 7 syntax.
    expect(BARE).not.toMatch(/\?\?|&&|\|\||\?\s*:|\?\./);
  });

  it('is balanced — an unbalanced brace would make the script unparseable', () => {
    expect((SCRIPT.match(/\{/g) ?? []).length).toBe((SCRIPT.match(/\}/g) ?? []).length);
    expect((CODE.match(/\[/g) ?? []).length).toBe((CODE.match(/\]/g) ?? []).length);
  });

  it('declares its parameters first, with bounded attempts and delay', () => {
    expect(CODE.trimStart().startsWith('[CmdletBinding()]')).toBe(true);
    expect(CODE).toContain('[ValidateRange(1, 5)][int]$MaxAttempts = 3');
    expect(CODE).toContain('[ValidateRange(0, 10000)][int]$RetryDelayMs = 500');
  });
});

describe('the capture entry point is read-only toward IPD and the host', () => {
  it('starts, stops and restarts nothing', () => {
    expect(CODE).not.toMatch(
      /\b(Start-Process|Start-Service|Stop-Service|Restart-Service|Stop-Process|Start-Job|Invoke-Command|Invoke-Expression|New-Service|Set-Service)\b/,
    );
    expect(CODE).not.toMatch(/\bsc(\.exe)?\s+(start|stop|config|create)\b/i);
    expect(CODE).not.toMatch(/\btaskkill\b|\bschtasks\b|\bnet\s+(start|stop)\b/i);
  });

  it('writes no file and changes no configuration', () => {
    expect(CODE).not.toMatch(
      /\b(Set-Content|Add-Content|Out-File|New-Item|Remove-Item|Move-Item|Copy-Item|Rename-Item|Set-ItemProperty|Clear-Content|Set-Acl)\b/,
    );
    expect(CODE).not.toMatch(/WriteAllText|WriteAllBytes|WriteAllLines|\[System\.IO\.File\]::(Create|Delete|Move)/);
    // The only redirection is discarding git's stderr; nothing is redirected into a file.
    const redirections = BARE_LINES.flatMap((line) => line.match(/\S*>+\S*/g) ?? []);
    expect(redirections.filter((token) => token !== '2>$null' && token !== '2>$null)).Trim()')).toEqual([]);
    expect(redirections.length).toBeGreaterThan(0);
  });

  it('sets, changes and removes no environment variable', () => {
    expect(CODE).not.toMatch(/\$env:[A-Za-z_][A-Za-z0-9_]*\s*=[^=]/);
    expect(CODE).not.toMatch(/SetEnvironmentVariable|\bsetx\b|Remove-Item\s+env:|Set-Item\s+env:/i);
  });

  it('issues no network request and installs nothing', () => {
    expect(CODE).not.toMatch(/Invoke-RestMethod|Invoke-WebRequest|\bcurl\b|\biwr\b|Net\.WebClient|Start-BitsTransfer/);
    // `npm ci` appears only inside the advice string; npm is never executed.
    expect(CODE).not.toMatch(/&\s*npm\b|^\s*npm\s/m);
    expect(CODE).not.toMatch(/&\s*npx\b|^\s*npx\s/m);
  });

  it('never names a write operation, a database or a migration', () => {
    expect(SCRIPT).not.toMatch(/portfolio\.(create|save|reset|delete|importBroker)/);
    expect(CODE).not.toMatch(/sqlite|\.db\b|migrat/i);
  });

  it('reads setting NAMES only: no setting value is written to the console', () => {
    // The only use of a setting's value is an emptiness test.
    const valueReads = CODE_LINES.filter((line) => /GetEnvironmentVariable\(/.test(line));
    expect(valueReads).toHaveLength(1);
    expect(valueReads[0]).toContain('[string]::IsNullOrEmpty(');
    // .env.local is parsed for key names; the value side of a line is never captured.
    expect(CODE).toContain("'^(export\\s+)?([A-Za-z_][A-Za-z0-9_.\\-]*)\\s*='");
    expect(CODE).not.toMatch(/Write-(Host|Info|Caution)[^\n]*\$PortfolioId/);
  });

  it('executes exactly two external programs: node and git', () => {
    const invoked = Array.from(CODE.matchAll(/&\s*([A-Za-z][\w.-]*)/g)).map((match) => match[1]);
    expect(Array.from(new Set(invoked)).sort()).toEqual(['git', 'node']);
    // git is used for read-only facts only.
    const gitLines = CODE_LINES.filter((line) => /&\s*git\b/.test(line));
    for (const line of gitLines) expect(line).toMatch(/rev-parse HEAD|status --porcelain/);
  });
});

describe('the capture entry point runs the repository CLI and propagates its exit code', () => {
  it('points at the capture CLI and the installed runner, both of which exist in the repository layout', () => {
    expect(CODE).toContain("'server\\user-portfolio\\capture\\capture-owner-bound-portfolio.ts'");
    expect(CODE).toContain("'node_modules\\tsx\\dist\\cli.mjs'");
    expect(existsSync(path.join(REPOSITORY_ROOT, 'frontend/server/user-portfolio/capture/capture-owner-bound-portfolio.ts'))).toBe(true);
  });

  it('loads the same .env.local sources, in the same order, as the IRR transport', () => {
    const manifest = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, 'frontend/package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    const flags = ['--env-file-if-exists=../.env.local', '--env-file-if-exists=.env.local'];
    for (const flag of flags) {
      expect(manifest.scripts['server:dev']).toContain(flag);
      expect(manifest.scripts['portfolio:capture']).toContain(flag);
      expect(CODE).toContain(`'${flag}'`);
    }
    expect(CODE.indexOf(`'${flags[0]}'`)).toBeLessThan(CODE.indexOf(`'${flags[1]}'`));
    expect(manifest.scripts['portfolio:capture']).toContain('server/user-portfolio/capture/capture-owner-bound-portfolio.ts');
    // The relative flags are only right when node runs from frontend\.
    expect(CODE).toMatch(/Push-Location -LiteralPath \$frontend\s*\n& node @nodeArguments\s*\n\$captureExitCode = \$LASTEXITCODE\s*\nPop-Location/);
  });

  it('exits with the CLI exit code, and with 2 on a failed preflight', () => {
    expect(CODE_LINES[CODE_LINES.length - 1] === '' ? CODE_LINES[CODE_LINES.length - 2] : CODE_LINES[CODE_LINES.length - 1]).toBe(
      'exit $captureExitCode',
    );
    const exits = CODE_LINES.filter((line) => /^\s*exit\b/.test(line)).map((line) => line.trim());
    expect(exits.sort()).toEqual(['exit $captureExitCode', 'exit 2']);
    expect(CAPTURE_EXIT_CODES.CONFIGURATION_INVALID).toBe(2);
  });

  it('documents every exit code the CLI can return, with the same meaning', () => {
    for (const [outcome, code] of Object.entries(CAPTURE_EXIT_CODES)) {
      const documented = new RegExp(`^\\s*${code}\\s+${outcome}\\b`, 'm');
      expect(SCRIPT, `${code} ${outcome}`).toMatch(documented);
    }
  });

  it('passes the portfolio id only when the operator supplied one, and defaults to none', () => {
    expect(CODE).toContain("[string]$PortfolioId = ''");
    expect(CODE).toContain("if ($PortfolioId) { $nodeArguments += @('--portfolio-id', $PortfolioId) }");
    expect(SCRIPT).not.toContain('DEFAULT_PORTFOLIO');
  });

  it('defaults the output root to a per-user directory outside the repository', () => {
    expect(CODE).toContain("$OutputRoot = Join-Path $env:LOCALAPPDATA 'IIPS\\w11-dep1-capture'");
  });

  it('tells the operator which output is local-only and which is publishable', () => {
    expect(SCRIPT).toContain('LOCAL-ONLY-DO-NOT-PUBLISH');
    expect(SCRIPT).toContain('SANITIZED-SUMMARY');
    expect(SCRIPT).toContain('NOT the complete capture evidence');
    expect(SCRIPT).toContain('Nothing synthetic was substituted');
  });
});

describe('IPD process recognition against command lines a Windows host reported (simulation)', () => {
  // PowerShell single-quoted strings are literal, and .NET and JavaScript agree on every
  // construct these two patterns use, so the pattern text is taken FROM THE SCRIPT and
  // used directly as a JavaScript RegExp. Editing the script changes what is asserted.
  const processPattern = /\$commandLine -match '([^']+)'/.exec(SCRIPT)?.[1];
  const rootPattern = /\$ipdCommandLines\[0\] -match '([^']+)'/.exec(SCRIPT)?.[1];

  const IPD_IPC = '"C:\\Node22\\node-v22.16.0-win-x64\\node.exe" H:\\IIPS\\iips-production-market-data\\dist\\src\\ipc\\entrypoint.js ';
  const OTHERS = [
    '"C:\\Node22\\node-v22.16.0-win-x64\\node.exe" H:\\IIPS\\iips-production-market-data\\dist\\src\\providers\\dhan\\dhan_local_daemon.js ',
    '"node"   "C:\\tmp\\iips-review-recovered\\frontend\\node_modules\\.bin\\..\\tsx\\dist\\cli.mjs" --env-file-if-exists=../.env.local server/executive-transport.ts',
    '"node"   "H:\\IIPS\\iips-production-market-data\\node_modules\\.bin\\..\\vite\\bin\\vite.js" --host 127.0.0.1 --port 5174 --strictPort',
  ];

  it('extracted both patterns from the script', () => {
    expect(processPattern).toBeDefined();
    expect(rootPattern).toBeDefined();
  });

  it('recognises only the process running IPD’s ipc\\entrypoint.js', () => {
    const pattern = new RegExp(processPattern as string);
    expect(pattern.test(IPD_IPC)).toBe(true);
    for (const other of OTHERS) expect(pattern.test(other)).toBe(false);
  });

  it('derives the IPD checkout from the command line, not from the node path before it', () => {
    const pattern = new RegExp(rootPattern as string);
    expect(pattern.exec(IPD_IPC)?.[1]).toBe('H:\\IIPS\\iips-production-market-data');
    // An unquoted node path must not be swallowed into the checkout path.
    expect(pattern.exec('C:\\node\\node.exe H:\\IIPS\\ipd\\dist\\src\\ipc\\entrypoint.js')?.[1]).toBe('H:\\IIPS\\ipd');
    expect(pattern.exec('"C:\\Program Files\\nodejs\\node.exe" "D:\\My Work\\ipd\\dist\\src\\ipc\\entrypoint.js"')?.[1]).toBe(
      'D:\\My Work\\ipd',
    );
  });
});
