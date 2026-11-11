/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const script = path.join(root, 'tools/windows/diagnose-ipc-pipe-lifecycle.ps1');
const harness = path.join(root, 'tools/windows/diagnose-ipc-pipe-lifecycle.mjs');

describe('synthetic pipe lifecycle diagnostic', () => {
  it('has a Windows PowerShell 5.1 wrapper with selectable Node and a safe default output', () => {
    const text = readFileSync(script, 'utf8');
    expect(text).toMatch(/^#Requires -Version 5\.1/m);
    expect(text).toContain('[Environment]::OSVersion.Platform');
    expect(text).toContain('[string]$NodePath');
    expect(text).toContain('[int]$TimeoutMs = 5000');
    expect(text).toContain('diagnostics\\$stamp-$suffix');
    expect(text).toContain('$LASTEXITCODE');
    expect(text).not.toMatch(/[^\x00-\x7f]|\r/);
    expect(text).not.toContain('iips-user-portfolio-v1');
  });

  it('uses an isolated server, framing, and both lifecycles', () => {
    const text = readFileSync(harness, 'utf8');
    expect(text).toContain('allowHalfOpen: true');
    expect(text).toContain('server.maxConnections = 1');
    expect(text).toContain('writeUInt32BE');
    expect(text).toContain("mode === 'end-after-write'");
    expect(text).toContain("['end-after-write', 'keep-open']");
    expect(text).toContain('socket.destroy()');
    expect(text).toContain('randomUUID()');
    expect(text).not.toContain('iips-user-portfolio-v1');
  });

  it('requires controls and distinguishes supported, unreproduced and mixed patterns', () => {
    const program = `
      import { verdict } from ${JSON.stringify(pathToFileURL(harness).href)};
      const config = { iterations: 2, timeout: 1000 };
      const make = (delayMs, mode, responseReceived) => ({
        delayMs, mode, responseReceived, timedOut: false, serverFrame: true,
        endMs: 1, terminalMs: responseReceived ? 10 : 52
      });
      const good = [0, 100].flatMap(d => ['end-after-write', 'keep-open']
        .flatMap(m => [1, 2].map(() => make(d, m, true))));
      const supported = good.map(r => r.delayMs === 100 && r.mode === 'end-after-write'
        ? { ...r, responseReceived: false, terminalMs: 52 } : r);
      const mixed = supported.map((r, i) => i === 4 ? { ...r, responseReceived: true } : r);
      console.log(JSON.stringify([
        verdict(supported, config, 'win32').verdict,
        verdict(good, config, 'win32').verdict,
        verdict(mixed, config, 'win32').verdict,
        verdict(supported, { ...config, iterations: 1 }, 'win32').verdict,
        verdict(supported, config, 'linux').verdict
      ]));`;
    const run = spawnSync(process.execPath, ['--input-type=module', '-e', program], { encoding: 'utf8' });
    expect(run.status, run.stderr).toBe(0);
    expect(JSON.parse(run.stdout)).toEqual(['CONFIRMED_PATTERN', 'REFUTED_PATTERN', 'INCONCLUSIVE', 'INCONCLUSIVE', 'INCONCLUSIVE']);
  });

  it.skipIf(process.platform === 'win32')('runs both modes over AF_UNIX but refuses a Windows verdict', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'irr-lifecycle-test-'));
    try {
      const run = spawnSync(process.execPath, [harness, '--delays', '0,75', '--iterations', '2', '--timeout', '1000', '--out', dir], { encoding: 'utf8', timeout: 15000 });
      expect(run.error).toBeUndefined();
      expect(run.status).toBe(2);
      expect(run.stdout).toContain('AF_UNIX mechanics only');
      const entries = readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
      expect(entries).toHaveLength(9);
      expect(entries[0].uv).toBeTruthy();
      for (const trial of entries.slice(1)) {
        expect(trial.classification).toBe('SUCCESS');
        expect(trial.responseReceived).toBe(true);
        expect(trial.timedOut).toBe(false);
        expect(trial.bytesReceived).toBeGreaterThan(4);
        expect(trial.writeOutcome).toBe('flushed');
        expect(trial.events.find((e: { event: string }) => e.event === 'connect').msFromConnect).toBe(0);
        expect(trial.events.some((e: { event: string }) => e.event === 'write-callback')).toBe(true);
        expect(trial.events.some((e: { event: string }) => e.event === 'end-called')).toBe(trial.mode === 'end-after-write');
      }
      const summary = JSON.parse(readFileSync(path.join(dir, 'summary.json'), 'utf8'));
      expect(summary.verdict).toBe('INCONCLUSIVE');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it.skipIf(process.platform === 'win32')('records timeout and still attempts the delayed server write', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'irr-lifecycle-timeout-'));
    try {
      const run = spawnSync(process.execPath, [harness, '--delays', '150', '--iterations', '1', '--timeout', '30', '--out', dir], { encoding: 'utf8', timeout: 15000 });
      expect(run.error).toBeUndefined();
      expect(run.status).toBe(2);
      const entries = readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split('\n').slice(1).map(line => JSON.parse(line));
      for (const trial of entries) {
        expect(trial.timedOut).toBe(true);
        expect(trial.classification).toBe('OUTCOME_UNKNOWN');
        expect(trial.reason).toBe('TIMEOUT');
        expect(trial.events.some((e: { event: string }) => e.event === 'write-attempt')).toBe(true);
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
