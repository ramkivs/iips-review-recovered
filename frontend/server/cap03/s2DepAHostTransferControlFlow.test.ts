/**
 * CAP-03 S2-DEP-A host-transfer instrument — terminal-state control-flow contract.
 *
 * Authority: IRR tracker §16.189 (`CV-CORR-169`, `CHG-2026-10-29-11`), rev-4.
 * Pins (regression teeth, per fix pass):
 *  - rev-2 defect: a failed remote-SHA check after a completed push emitting
 *    `RESULT: PASS` (fixed rev 3; still pinned);
 *  - rev-3 defect: initialization (source dir + durable log) OUTSIDE the try,
 *    so an init failure produced NO terminal line at all, and unguarded
 *    Add-Content inside Write-Log (fixed rev 4: console-first logging with a
 *    guarded durable sink; init inside PHASE-0; terminal always emitted from
 *    the guarded region — external process kill stays out of scope and the
 *    script no longer claims otherwise);
 *  - rev-3 defect: push failures reported "nothing was pushed" WITHOUT ever
 *    consulting origin (fixed rev 4: five-state PUSHSTATE machine; every
 *    attempted-push outcome reads the remote ref before any absence claim;
 *    UNVERIFIABLE reads never assume absence).
 * Structural interpretation: each top-level `if ($STATE ...)` block executes
 * iff its gate holds; a Set-Blocked flips the state for later pass-gated
 * blocks; an exception unwinds past the footer into the catch; Set-Result
 * emits exactly once. No PowerShell runtime exists in CI; these assertions
 * interpret the published script's real block layout.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(
  new URL('../../../docs/integration/IIPS_v3.0_CAP03_S2_DEP_A_HOST_TRANSFER_2026-10-29.ps1', import.meta.url),
);
const SRC = readFileSync(SCRIPT_PATH, 'utf8');
const LINES = SRC.split('\n');
const TRY_LINE = LINES.findIndex((l) => /^try \{$/.test(l));

type Block = { cond: 'pass' | 'notpass'; text: string; start: number; end: number };

function gatedBlocks(): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < LINES.length; i++) {
    const m = LINES[i].match(/^  if \(\$STATE -(?<op>eq|ne) 'PASS'\) \{\s*$/);
    if (!m) continue;
    let depth = 1;
    let j = i + 1;
    for (; j < LINES.length && depth > 0; j++) {
      for (const c of LINES[j]) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
      }
    }
    blocks.push({
      cond: m.groups?.op === 'eq' ? 'pass' : 'notpass',
      text: LINES.slice(i + 1, Math.max(i + 1, j - 1)).join('\n'),
      start: i,
      end: j,
    });
  }
  return blocks;
}
const BLOCKS = gatedBlocks();
expect(BLOCKS.length, 'gated blocks located').toBeGreaterThanOrEqual(14);

function catchBlock(): string {
  const i = LINES.findIndex((l) => /^catch \{\s*$/.test(l));
  expect(i, 'catch block present').toBeGreaterThan(-1);
  let depth = 1;
  let j = i + 1;
  for (; j < LINES.length && depth > 0; j++) {
    for (const c of LINES[j]) {
      if (c === '{') depth++;
      else if (c === '}') depth--;
    }
  }
  return LINES.slice(i + 1, j - 1).join('\n');
}

const INIT_IDX = BLOCKS.findIndex((b) => /PHASE-0 initialization/.test(b.text));
const PUSH_IDX = BLOCKS.findIndex((b) => /PUSH-COMPLETED/.test(b.text) && /git exit 0/.test(b.text));
const VERIFY_IDX = BLOCKS.findIndex((b) => /REMOTE SHA MISMATCH/.test(b.text));
const SUCCESS_IDX = BLOCKS.findIndex((b) => /Set-Result 'PASS'/.test(b.text));
const FOOTER_IDX = BLOCKS.findIndex((b) => b.cond === 'notpass' && /Set-Result 'BLOCKED/.test(b.text));

type Injection = { kind: 'none' } | { kind: 'blockfail'; index: number } | { kind: 'exception-after-push' };

function simulate(inject: Injection): { out: string[]; pushState: string } {
  const out: string[] = [];
  let state: 'PASS' | 'BLOCKED' = 'PASS';
  let pushState = 'not-attempted';
  let attempted = false;
  let unwound = false;
  const alreadySet = (): boolean => out.includes('PASS') || out.includes('BLOCKED');
  const emitFrom = (text: string): void => {
    for (const line of text.split('\n')) {
      if (/Set-Result 'PASS'/.test(line)) {
        out.push(alreadySet() ? 'SUPPRESSED' : 'PASS');
      } else if (/Set-Result \(?'BLOCKED/.test(line)) {
        out.push(alreadySet() ? 'SUPPRESSED' : 'BLOCKED');
      } else if (/Write-Log 'RESULT: /.test(line)) {
        out.push('RAW-EMIT');
      }
    }
  };
  BLOCKS.forEach((b, idx) => {
    if (unwound) return;
    if (inject.kind === 'exception-after-push' && attempted && idx > PUSH_IDX) {
      unwound = true; // the throw unwinds every remaining try statement
      const cb = catchBlock();
      if (/Set-Result 'PASS'/.test(cb)) out.push('CATCH-PASS-LEAK');
      if (!alreadySet()) out.push('BLOCKED');
      if (/Get-RemoteRef/.test(cb) && /if \(\$script:REMOTE -eq ''\)/.test(cb)) out.push('CATCH-CONSULTS-ORIGIN');
      return;
    }
    const runs = b.cond === 'pass' ? state === 'PASS' : state !== 'PASS';
    if (!runs) return;
    if (idx === PUSH_IDX && !(inject.kind === 'blockfail' && inject.index === PUSH_IDX)) { attempted = true; pushState = 'success'; }
    if (idx === VERIFY_IDX && pushState === 'success' && !(inject.kind === 'blockfail' && inject.index === VERIFY_IDX)) pushState = 'verified';
    emitFrom(b.text);
    if (inject.kind === 'blockfail' && idx === inject.index) state = 'BLOCKED';
  });
  return { out, pushState };
}

// The single-emit guard means SUPPRESSED entries are guarded no-ops: the
// contract is exactly ONE real terminal emission with the right value.
const real = (out: string[]) => out.filter((x) => x !== 'SUPPRESSED' && x !== 'RAW-EMIT' && x !== 'CATCH-CONSULTS-ORIGIN');

describe('S2-DEP-A instrument rev 4 — terminal reporting contract (§16.189)', () => {
  it('block structure: init, push, verification, success and footer are separate gated blocks in order', () => {
    expect(INIT_IDX).toBe(0);
    expect(PUSH_IDX).toBeGreaterThan(INIT_IDX);
    expect(VERIFY_IDX).toBeGreaterThan(PUSH_IDX);
    expect(SUCCESS_IDX).toBeGreaterThan(VERIFY_IDX);
    expect(FOOTER_IDX).toBeGreaterThan(SUCCESS_IDX);
    expect(BLOCKS[SUCCESS_IDX]?.cond).toBe('pass');
    expect(BLOCKS[VERIFY_IDX]?.cond).toBe('pass');
    expect(BLOCKS[FOOTER_IDX]?.cond).toBe('notpass');
  });

  it('initialization boundary: source-dir/log setup runs INSIDE try; console-first logging; guarded durable sink; init failure still terminates once', () => {
    const outside = LINES.slice(0, TRY_LINE).filter((l) => /New-Item -ItemType Directory -Force -Path \$SRC_ROOT|Add-Content -LiteralPath \$LOG(?!REF)/.test(l));
    expect(outside, 'no raw init statements outside (before) the try').toEqual([]);
    const init = BLOCKS[INIT_IDX] as Block;
    expect(init.text).toMatch(/New-Item -ItemType Directory -Force -Path \$SRC_ROOT/);
    expect(init.text).toMatch(/Add-Content -LiteralPath \$LOG -Value \$hdr/);
    expect(init.text).toMatch(/\$script:LOGOK = \$true/);
    expect(init.text).toMatch(/catch \{/);
    expect(init.text).toMatch(/initialization failed before any gate ran/);
    expect(init.text).not.toMatch(/Set-Result/); // terminal belongs to the footer, once
    expect(SRC).toMatch(/function Write-Log\(\[string\]\$m\) \{\s*\n\s*\$line = [^\n]+\n\s*Write-Host \$line\s*\n\s*if \(\$script:LOGOK -eq \$true\) \{/);
    expect(SRC).toMatch(/LOG-LOST/); // loss is disclosed, never silent
    const sim = simulate({ kind: 'blockfail', index: INIT_IDX });
    expect(real(sim.out)).toEqual(['BLOCKED']); // exactly one REAL terminal emission, no PASS
    expect(SRC).not.toMatch(/Write-Log 'RESULT: /); // only Set-Result writes RESULT lines
  });

  it('single-emit guard wraps both sinks: console always, durable log best-effort', () => {
    const guard = SRC.match(/function Set-Result\(\[string\]\$r\) \{\s*\n\s*if \(\$script:RESULT -eq ''\) \{/);
    expect(guard, 'single-emit guard').not.toBeNull();
    expect(SRC).toMatch(/Write-Host \$line\s*\n\s*if \(\$script:LOGOK -eq \$true\) \{\s*\n\s*try \{ Add-Content -LiteralPath \$script:LOGREF -Value \$line \} catch/);
    expect(SRC).toMatch(/the durable log is unavailable; this terminal line exists only on the console/);
  });

  it('push outcome states: five-state machine; attempted-push paths consult origin BEFORE claiming absence; unverifiable never assumes absent', () => {
    const push = BLOCKS[PUSH_IDX] as Block;
    for (const st of ['not-attempted', 'indeterminate', 'rejected', "'success'", 'verified']) {
      expect(SRC, `state string present: ${st}`).toContain(st);
    }
    expect(push.text).toMatch(/\$script:PUSHSTATE = 'indeterminate'/);
    expect(push.text).toMatch(/if \(\$pushCode -ne 0\) \{ \$script:PUSHSTATE = 'rejected' \}/);
    expect(push.text).toMatch(/if \(\$pushCode -eq 0\) \{/);
    expect(push.text).toMatch(/PUSH-COMPLETED/);
    // consultation precedes ANY claim in all three reporting branches:
    const pushSrc = (BLOCKS[PUSH_IDX] as Block).text;
    expect(pushSrc, 'origin consulted INSIDE the reject/indeterminate arm').toMatch(
      /'indeterminate'\) \{\s*\$script:REMOTE = Get-RemoteRef \$BRANCH/,
    );
    const consultIdx = pushSrc.search(/Get-RemoteRef \$BRANCH/);
    const claims = [
      'origin ref read \\[',
      'does not carry this run head - no published branch from this run',
      'outcome INDETERMINATE - absence is NOT assumed',
      'state unconfirmed by this run',
    ];
    for (const claim of claims) {
      const at = pushSrc.search(new RegExp(claim));
      expect(at, `claim located: ${claim}`).toBeGreaterThan(-1);
      expect(at, `every claim follows the origin consult: ${claim}`).toBeGreaterThan(consultIdx);
    }
    // the blind phrase from rev 3 is gone everywhere
    expect(SRC).not.toMatch(/nothing was pushed/);
    // absence is asserted only from a verifiable read; the empty-read signal is 'ABSENT'
    const absentArm = pushSrc.split('\n').find((l) => l.includes('does not carry this run head')) ?? '';
    expect(absentArm, 'absence line is gated on a non-UNVERIFIABLE read').toContain("StartsWith('UNVERIFIABLE') -eq $false");
    expect(SRC).toMatch(/if \(\$read\.Count -eq 0\) \{ return 'ABSENT' \}/);
  });

  it('push failure (rejected): sim yields one BLOCKED with remote read quoted; no PASS; commit preserved', () => {
    const { out } = simulate({ kind: 'blockfail', index: PUSH_IDX });
    expect(real(out)).toEqual(['BLOCKED']);
    expect(out[0]).toBe('BLOCKED');
    const footer = BLOCKS[FOOTER_IDX] as Block;
    expect(footer.text).toMatch(/PUSHSTATE -eq 'rejected' -or \$script:PUSHSTATE -eq 'indeterminate'/);
    expect(footer.text).toMatch(/origin ref read: \[' \+ \$script:REMOTE/);
    expect(footer.text).toMatch(/no ref update by this run is possible/);
    expect(footer.text).toMatch(/push completed \(exit 0\) but the run did not finish verification/);
  });

  it('indeterminate + UNVERIFIABLE: reported as indeterminate, indistinguishable absence never asserted; catch on post-push states consults origin', () => {
    expect(SRC).toMatch(/UNVERIFIABLE \(git ls-remote exit/);
    expect(SRC).toMatch(/UNVERIFIABLE \(ls-remote threw/);
    const cb = catchBlock();
    expect(cb).toMatch(/PUSHSTATE -eq 'success' -or \$script:PUSHSTATE -eq 'verified' -or \$script:PUSHSTATE -eq 'indeterminate'/);
    expect(cb).toMatch(/if \(\$script:REMOTE -eq ''\) \{ \$script:REMOTE = Get-RemoteRef \$BRANCH \}/);
    expect(cb).toMatch(/a branch may exist on origin/);
    expect(cb).not.toMatch(/Set-Result 'PASS'/);
    const { out } = simulate({ kind: 'exception-after-push' });
    expect(out).toContain('CATCH-CONSULTS-ORIGIN');
    expect(real(out)).toEqual(['BLOCKED']);
    expect(out).not.toContain('PASS');
    expect(out).not.toContain('CATCH-PASS-LEAK');
  });

  it('remote SHA mismatch (success-unverified): verify block emits nothing terminal; footer names the branch that EXISTS on origin', () => {
    const verify = BLOCKS[VERIFY_IDX] as Block;
    expect(verify.text).not.toMatch(/Set-Result/);
    expect(verify.text).toMatch(/REMOTE SHA MISMATCH/);
    expect(verify.text).toMatch(/PUSH-COMPLETED above stands - a branch exists on origin/);
    const { out } = simulate({ kind: 'blockfail', index: VERIFY_IDX });
    expect(real(out)).toEqual(['BLOCKED']);
    expect(SRC).toMatch(/PUSHSTATE -eq 'success' -or \$script:PUSHSTATE -eq 'verified'\) \{ Set-Result \('BLOCKED \(post-push\)/);
  });

  it('PASS is structurally gated on verified state, not only on STATE (defense in depth)', () => {
    const success = BLOCKS[SUCCESS_IDX] as Block;
    const gateAt = success.text.search(/if \(\$script:PUSHSTATE -eq 'verified'\) \{/);
    const passAt = success.text.search(/Set-Result 'PASS'/);
    expect(gateAt).toBeGreaterThanOrEqual(0);
    expect(passAt).toBeGreaterThan(gateAt);
    expect(success.text).toMatch(/PASS requires PUSHSTATE verified/);
    const { out } = simulate({ kind: 'none' });
    expect(real(out)).toEqual(['PASS']);
    expect(out[0]).toBe('PASS'); // first real emission is the terminal one; later arms are guard-suppressed no-ops
    const idx = LINES.findIndex((l) => /Set-Result 'PASS'/.test(l));
    expect(idx).toBeGreaterThan(LINES.findIndex((l) => /PUSH-COMPLETED/.test(l)));
    expect(idx).toBeGreaterThan(LINES.findIndex((l) => /remote head verified/.test(l)));
  });

  it('frozen hash record and 19-path byte gates preserved from rev 3', () => {
    expect(SRC).toMatch(/\$hostExpected\['evidence\/cap03-s2\/deposit-host-hashes\.txt'\]/);
    const writes = SRC.match(/Add-Content -LiteralPath \$HASHES/g) ?? [];
    expect(writes.length, 'record built pre-commit only').toBe(5);
    expect(SRC).not.toMatch(/Add-Content -LiteralPath \$HASHES -Value \('# deposit branch/);
    expect(SRC).toMatch(/\$staged\.Count -ne 19/);
    for (const gate of ['STAGED BYTE MISMATCH', 'STAGED BYTE COUNT MISMATCH', 'COMMITTED BYTE MISMATCH', 'check-attr text eol', 'core\\.autocrlf false', 'core\\.safecrlf false', 'host MANIFEST\\.json differs from published blob', 'seal line disagrees with host hash', "\\.StartsWith\\('evidence/cap03-s2/'\\)", 'Get-GitBlobDigest \\(\':\' \\+ \\$k\\)', "Get-GitBlobDigest \\('HEAD:' \\+ \\$k\\)"]) {
      expect(new RegExp(gate).test(SRC), `gate: ${gate}`).toBe(true);
    }
    const mapEntries = SRC.match(/\$hostExpected\[('|\()/g) ?? [];
    expect(mapEntries.length).toBe(5);
    expect(SRC).toMatch(/host copy byte-identical to committed copy/);
  });

  it('authorization anchors preserved (marker -11, baseline 1bc39c06, immutable locus, sealed digests, drift logging)', () => {
    for (const anchor of [
      'CHG-2026-10-29-11',
      '1bc39c06df7eb505c6124467fb7316982384c7aa',
      '2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478',
      '9d3c09dbdb691c2527a45605dea20826b4ec2ba2f110985ee3f1033783b5225e',
      '9c9319fa3d7eaa822834c2f500e04dfec2b18d8157724843126a749b2bec91ab',
      'a1c94ba6a2b96e08a1dc9e7e1d2c73be92c6c38f09d74aa4f00c5d8e445e0ede',
      '$trk.Contains($APPROVAL_MARKER)',
      'MAIN-MOVED',
      'Get-FileHash -LiteralPath $PSCommandPath',
    ]) {
      expect(SRC, `anchor: ${anchor}`).toContain(anchor);
    }
  });

  it('constraint surface: no else/elseif/finally/exit/break anywhere, ASCII-only, balanced, terminal kept open', () => {
    expect(SRC).not.toMatch(/\belse\b/);
    expect(SRC).not.toMatch(/\belseif\b/);
    expect(SRC).not.toMatch(/\bfinally\b/);
    expect(SRC).not.toMatch(/^\s*(exit|break)\b/m);
    expect(SRC).toMatch(/^[\t\n\x20-\x7e]*$/);
    const pairs: Array<[string, string]> = [['{', '}'], ['(', ')'], ['[', ']']];
    for (const [a, b] of pairs) {
      expect(SRC.split('').filter((c) => c === a).length, `balance ${a}${b}`).toBe(
        SRC.split('').filter((c) => c === b).length,
      );
    }
    expect((SRC.match(/Read-Host/g) ?? []).length).toBe(1);
    expect((SRC.match(/S2-DEP-A host transfer finished/g) ?? []).length).toBe(1);
  });
});
