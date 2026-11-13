/**
 * Contract tests for `tools/windows/collect-reports-inventory.ps1`.
 *
 * WHY A TEST ON A POWERSHELL FILE
 *   The script is the operator's single entry point for the W03 Reports inventory. Its
 *   guarantees are load-bearing and can be checked from its source: it never touches NP-04
 *   itself, it changes nothing on the host, it stays parseable by Windows PowerShell 5.1, it
 *   runs the repository's inventory CLI through the installed runner with the same `.env.local`
 *   sources as the IRR transport, and it exits with the CLI's exit code.
 *
 * SIMULATION BOUNDARY
 *   These are STATIC checks of the script text. PowerShell is not executed here, no Windows
 *   host is involved, and nothing below is W03 evidence.
 *
 * @vitest-environment node
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { DETAIL_FILE, LOCAL_ONLY_DIRECTORY, SANITIZED_DIRECTORY, SUMMARY_JSON_FILE } from './collect-reports-inventory.js';
import { COPY_ATTEMPTS_LIMIT, DEFAULT_COPY_ATTEMPTS, DEFAULT_RETRY_DELAY_MS, INVENTORY_EXIT_CODES, NP04_DATABASE_PATH_SETTING, RETRY_DELAY_LIMIT_MS } from './reportsInventory.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, '../../../..');
const SCRIPT_PATH = path.join(REPOSITORY_ROOT, 'tools/windows/collect-reports-inventory.ps1');

/** Read once. A missing script is a hard failure, not a skipped test. */
const SCRIPT_BYTES = readFileSync(SCRIPT_PATH);
const SCRIPT = SCRIPT_BYTES.toString('utf8');
const LINES = SCRIPT.split(/\r?\n/);
/** Statement lines: the comment-based help and `#` comments removed. */
const CODE_LINES = SCRIPT.replace(/<#[\s\S]*?#>/, '')
  .split(/\r?\n/)
  .filter((line) => !/^\s*#/.test(line));
const CODE = CODE_LINES.join('\n');
/** Statement lines with every string literal emptied, for operator-level checks. */
const BARE_LINES = CODE_LINES.map((line) => line.replace(/'(?:[^']|'')*'/g, "''").replace(/"[^"]*"/g, '""'));
const BARE = BARE_LINES.join('\n');

describe('the inventory entry point stays parseable by Windows PowerShell 5.1', () => {
  it('is pure ASCII without a byte-order mark', () => {
    expect(LINES.filter((line) => /[^\x00-\x7F]/.test(line))).toEqual([]);
    expect(SCRIPT_BYTES[0]).toBe('<'.charCodeAt(0));
  });

  it('uses no else, elseif or finally — the Windows PowerShell 5.1 constraint in force', () => {
    expect(LINES.filter((line) => /(^|[^a-zA-Z-])(else|elseif|finally)([^a-zA-Z-]|$)/.test(line))).toEqual([]);
  });

  it('uses no PowerShell 7-only operator', () => {
    expect(BARE).not.toMatch(/\?\?|&&|\|\||\?\s*:|\?\./);
  });

  it('is balanced, including its quotes', () => {
    expect((SCRIPT.match(/\{/g) ?? []).length).toBe((SCRIPT.match(/\}/g) ?? []).length);
    expect((BARE.match(/\(/g) ?? []).length).toBe((BARE.match(/\)/g) ?? []).length);
    expect((BARE.match(/\[/g) ?? []).length).toBe((BARE.match(/\]/g) ?? []).length);
    // After every complete literal is emptied, no line may hold an odd quote.
    expect(BARE_LINES.filter((line) => (line.match(/'/g) ?? []).length % 2 !== 0 || (line.match(/"/g) ?? []).length % 2 !== 0)).toEqual([]);
  });

  it('declares its parameters first, with the same bounds and defaults as the CLI', () => {
    expect(CODE.trimStart().startsWith('[CmdletBinding()]')).toBe(true);
    expect(CODE).toContain(`[ValidateRange(1, ${COPY_ATTEMPTS_LIMIT})][int]$MaxAttempts = ${DEFAULT_COPY_ATTEMPTS}`);
    expect(CODE).toContain(`[ValidateRange(0, ${RETRY_DELAY_LIMIT_MS})][int]$RetryDelayMs = ${DEFAULT_RETRY_DELAY_MS}`);
    expect(CODE).toContain('[switch]$ValidateOnly');
  });
});

describe('the inventory entry point never touches NP-04 and changes nothing on the host', () => {
  it('holds no value of the NP-04 path setting: it tests the setting only for emptiness', () => {
    const valueReads = CODE_LINES.filter((line) => /GetEnvironmentVariable\(/.test(line));
    expect(valueReads).toHaveLength(1);
    expect(valueReads[0]).toContain('[string]::IsNullOrEmpty(');
    expect(CODE).not.toMatch(/\$env:IIPS_/);
    // .env.local is parsed for key names; the value side of a line is never captured.
    expect(CODE).toContain("'^(export\\s+)?([A-Za-z_][A-Za-z0-9_.\\-]*)\\s*='");
    expect(CODE).toContain(`'${NP04_DATABASE_PATH_SETTING}'`);
  });

  it('names no database file and no database tool: only the CLI knows where NP-04 is', () => {
    expect(CODE).not.toMatch(/\.db\b|-wal\b|-shm\b|sqlite3|System\.Data|Microsoft\.Data|PRAGMA/i);
    // Outside messages, SQLite appears only as the runtime flag for Node below 22.13.
    const sqliteLines = BARE_LINES.filter((line) => /sqlite/i.test(line));
    expect(sqliteLines.map((line) => line.trim())).toEqual([
      '$needsSqliteFlag = $false',
      "if (($nodeMajor -eq 22) -and ($nodeMinor -lt 13)) { $needsSqliteFlag = $true }",
      "if ($needsSqliteFlag) { $nodeArguments += '' }",
    ]);
    expect(CODE.split("'--experimental-sqlite'")).toHaveLength(2);
    expect(CODE).not.toMatch(/migrat/i);
  });

  it('starts, stops and restarts nothing', () => {
    expect(CODE).not.toMatch(/\b(Start-Process|Start-Service|Stop-Service|Restart-Service|Stop-Process|Start-Job|Invoke-Command|Invoke-Expression|New-Service|Set-Service)\b/);
    expect(CODE).not.toMatch(/\bsc(\.exe)?\s+(start|stop|config|create)\b/i);
    expect(CODE).not.toMatch(/\btaskkill\b|\bschtasks\b|\bnet\s+(start|stop)\b/i);
  });

  it('writes no file and changes no configuration', () => {
    expect(CODE).not.toMatch(/\b(Set-Content|Add-Content|Out-File|New-Item|Remove-Item|Move-Item|Copy-Item|Rename-Item|Set-ItemProperty|Clear-Content|Set-Acl)\b/);
    expect(CODE).not.toMatch(/WriteAllText|WriteAllBytes|WriteAllLines|\[System\.IO\.File\]::(Create|Delete|Move|Copy|Open)/);
    // The only redirection is discarding git's stderr; nothing is redirected into a file.
    const redirections = BARE_LINES.flatMap((line) => line.match(/\S*>+\S*/g) ?? []);
    expect(redirections.filter((token) => token !== '2>$null' && token !== '2>$null)).Trim()')).toEqual([]);
  });

  it('sets, changes and removes no environment variable', () => {
    expect(CODE).not.toMatch(/\$env:[A-Za-z_][A-Za-z0-9_]*\s*=[^=]/);
    expect(CODE).not.toMatch(/SetEnvironmentVariable|\bsetx\b|Remove-Item\s+env:|Set-Item\s+env:/i);
  });

  it('issues no network request and installs nothing', () => {
    expect(CODE).not.toMatch(/Invoke-RestMethod|Invoke-WebRequest|\bcurl\b|\biwr\b|Net\.WebClient|Start-BitsTransfer|localhost|127\.0\.0\.1/);
    expect(CODE).not.toMatch(/&\s*npm\b|^\s*npm\s/m);
    expect(CODE).not.toMatch(/&\s*npx\b|^\s*npx\s/m);
  });

  it('executes exactly two external programs: node and git, and git only for read-only facts', () => {
    const invoked = Array.from(CODE.matchAll(/&\s*([A-Za-z][\w.-]*)/g)).map((match) => match[1]);
    expect(Array.from(new Set(invoked)).sort()).toEqual(['git', 'node']);
    for (const line of CODE_LINES.filter((candidate) => /&\s*git\b/.test(candidate))) expect(line).toMatch(/rev-parse HEAD|status --porcelain/);
  });

  it('reads the exact capture only to select it by digest and never prints its path or digest', () => {
    expect(CODE).toContain("'LOCAL-ONLY-DO-NOT-PUBLISH\\exact-owner-bound-portfolio-capture.json'");
    expect(CODE).toContain('(Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant()');
    expect(CODE).not.toMatch(/Get-Content[^\n]*\$(candidate|captureToUse|CaptureFile)/);
    expect(CODE).not.toMatch(/ConvertFrom-Json/);
    expect(CODE).not.toMatch(/Write-(Host|Info|Caution|Step)[^\n]*\$(captureToUse|CaptureFile|candidate|digest|expected|matching)\b/);
  });

  it('refuses to guess between several captures', () => {
    expect(CODE).toContain('if ((-not $expected) -and ($candidates.Count -eq 1)) { $captureToUse = $candidates[0] }');
    expect(CODE).toMatch(/if \(\(-not \$expected\) -and \(\$candidates\.Count -gt 1\)\) \{\s*\n\s*Stop-Preflight/);
    expect(CODE).toMatch(/if \(\$matching\.Count -eq 0\) \{\s*\n\s*Stop-Preflight/);
  });
});

describe('the inventory entry point runs the repository CLI and propagates its exit code', () => {
  it('points at the inventory CLI and the installed runner, both of which exist in the repository layout', () => {
    expect(CODE).toContain("'server\\reports\\inventory\\collect-reports-inventory.ts'");
    expect(CODE).toContain("'node_modules\\tsx\\dist\\cli.mjs'");
    expect(existsSync(path.join(REPOSITORY_ROOT, 'frontend/server/reports/inventory/collect-reports-inventory.ts'))).toBe(true);
  });

  it('loads the same .env.local sources, in the same order, as the IRR transport', () => {
    const manifest = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, 'frontend/package.json'), 'utf8')) as { scripts: Record<string, string> };
    const flags = ['--env-file-if-exists=../.env.local', '--env-file-if-exists=.env.local'];
    for (const flag of flags) {
      expect(manifest.scripts['server:dev']).toContain(flag);
      expect(manifest.scripts['reports:inventory']).toContain(flag);
      expect(CODE).toContain(`'${flag}'`);
    }
    expect(CODE.indexOf(`'${flags[0]}'`)).toBeLessThan(CODE.indexOf(`'${flags[1]}'`));
    expect(manifest.scripts['reports:inventory']).toContain('server/reports/inventory/collect-reports-inventory.ts');
    expect(manifest.scripts['typecheck:reports-inventory']).toBe('tsc -p tsconfig.reports-inventory.json');
    // The relative flags are only right when node runs from frontend\.
    expect(CODE).toMatch(/Push-Location -LiteralPath \$frontend\s*\n& node @nodeArguments\s*\n\$inventoryExitCode = \$LASTEXITCODE\s*\nPop-Location/);
  });

  it('puts the runtime flag between the runner and the CLI, where the runner hands it to node', () => {
    const runner = CODE.indexOf('$nodeArguments = @($tsx)');
    const flag = CODE.indexOf("$nodeArguments += '--experimental-sqlite'");
    const cli = CODE.indexOf('  $cli,');
    expect(runner).toBeGreaterThan(-1);
    expect(flag).toBeGreaterThan(runner);
    expect(cli).toBeGreaterThan(flag);
    expect(CODE).toContain('if (($nodeMajor -eq 22) -and ($nodeMinor -ge 9)) { $nodeOk = $true }');
  });

  it('passes every operator choice to the CLI and nothing else', () => {
    const passed = Array.from(CODE.matchAll(/'(--[a-z0-9-]+)(?:=[^']*)?'/g)).map((match) => match[1]);
    expect(Array.from(new Set(passed)).sort()).toEqual(
      ['--capture-file', '--env-file-if-exists', '--expected-capture-sha256', '--experimental-sqlite', '--irr-commit', '--irr-dirty', '--irr-transport-process-count', '--max-attempts', '--output-root', '--retry-delay-ms', '--validate-only'].sort(),
    );
    expect(CODE).toContain("if ($ValidateOnly) { $nodeArguments += '--validate-only' }");
    expect(CODE).toContain("if ($captureToUse -and $expected) { $nodeArguments += @('--expected-capture-sha256', $expected) }");
  });

  it('exits with the CLI exit code, and with 2 on a failed preflight', () => {
    const last = CODE_LINES.filter((line) => line.trim() !== '').pop();
    expect(last).toBe('exit $inventoryExitCode');
    const exits = CODE_LINES.filter((line) => /^\s*exit\b/.test(line)).map((line) => line.trim());
    expect(exits.sort()).toEqual(['exit $inventoryExitCode', 'exit 2']);
    expect(INVENTORY_EXIT_CODES.CONFIGURATION_INVALID).toBe(2);
  });

  it('documents every exit code the CLI can return, with the same meaning', () => {
    for (const [outcome, code] of Object.entries(INVENTORY_EXIT_CODES)) {
      expect(SCRIPT, `${code} ${outcome}`).toMatch(new RegExp(`^\\s*${code}\\s+${outcome}\\b`, 'm'));
    }
  });

  it('defaults the output root to a per-user directory outside the repository', () => {
    expect(CODE).toContain("$OutputRoot = Join-Path $env:LOCALAPPDATA 'IIPS\\w03-reports-inventory'");
    expect(CODE).toContain("$CaptureRoot = Join-Path $env:LOCALAPPDATA 'IIPS\\w11-dep1-capture'");
  });

  it('tells the operator which output is local-only and which is publishable, with the names the CLI writes', () => {
    expect(SCRIPT).toContain(`${LOCAL_ONLY_DIRECTORY}\\${DETAIL_FILE}`);
    expect(SCRIPT).toContain(`${SANITIZED_DIRECTORY}\\${SUMMARY_JSON_FILE}`);
    expect(SCRIPT).toContain('Publish ONLY the two files under SANITIZED-INVENTORY.');
    expect(SCRIPT).toContain('Nothing was created or initialized to change it.');
  });
});
