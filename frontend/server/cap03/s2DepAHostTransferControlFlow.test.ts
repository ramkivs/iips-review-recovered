/**
 * CAP-03 S2-DEP-A host-transfer instrument — terminal-state control-flow contract.
 *
 * Authority: IRR tracker §16.192 (`CV-CORR-172`, `CHG-2026-10-29-14`), rev-6.
 * Pins (regression teeth, per fix pass):
 *  - rev-2: a failed remote-SHA check after a completed push could print
 *    `RESULT: PASS` (fixed rev 3; still pinned);
 *  - rev-3: init outside the try (no terminal line at all on init failure)
 *    and blind "nothing was pushed" wording (fixed rev 4);
 *  - rev-4: the footer asserted non-publication for rejected/indeterminate
 *    pushes even when the origin read was empty or UNVERIFIABLE, and PHASE-10
 *    treated a Contains-match over unvalidated ls-remote output as
 *    verification without checking the exit code (fixed rev 5: read-classifier
 *    arms; exit-code-checked, exact ref-line-match verification);
 *  - rev-5: PHASE-4 piped `git clone` output through the run log without `--quiet`, so
 *    PowerShell 5.1 converted git's routine progress into a terminating
 *    NativeCommandError (fixed rev 6: quiet clone; exit-code gate and the PHASE-4b
 *    running-bytes identity gate remain untouched and mandatory).
 * Structural interpretation: each top-level `if ($STATE ...)` block executes
 * iff its gate holds; a Set-Blocked flips the state for later pass-gated
 * blocks; an exception unwinds past the footer into the catch; Set-Result
 * emits exactly once (later attempts are guarded no-ops). No PowerShell
 * runtime exists in CI; these assertions interpret the published script's
 * real block layout.
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

// The single-emit guard makes SUPPRESSED entries guarded no-ops: the contract
// is exactly ONE real terminal emission with the right value.
const real = (out: string[]) => out.filter((x) => x !== 'SUPPRESSED' && x !== 'RAW-EMIT' && x !== 'CATCH-CONSULTS-ORIGIN');

describe('S2-DEP-A instrument rev 6 — terminal reporting contract (§16.192)', () => {
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

  it('push outcome states: five-state machine; attempted-push paths consult origin BEFORE any claim; rev5 classifies the read', () => {
    const push = BLOCKS[PUSH_IDX] as Block;
    for (const st of ['not-attempted', 'indeterminate', 'rejected', "'success'", 'verified']) {
      expect(SRC, `state string present: ${st}`).toContain(st);
    }
    expect(push.text).toMatch(/\$script:PUSHSTATE = 'indeterminate'/);
    expect(push.text).toMatch(/if \(\$pushCode -ne 0\) \{ \$script:PUSHSTATE = 'rejected' \}/);
    expect(push.text).toMatch(/PUSH-COMPLETED/);
    expect(push.text, 'consult inside reject/indet arm').toMatch(/'indeterminate'\) \{\s*\$script:REMOTE = Get-RemoteRef \$BRANCH/);
    expect(push.text).toMatch(/\$script:REMREAD = Get-ReadClass \$script:REMOTE \$headSha/);
    const consultIdx = push.text.search(/Get-RemoteRef \$BRANCH/);
    for (const claim of [
      'origin ref read \\[',
      'does not carry this run head - no published branch from this run',
      'outcome INDETERMINATE - absence is NOT assumed',
      'state unconfirmed by this run',
    ]) {
      const at = push.text.search(new RegExp(claim));
      expect(at, `claim located: ${claim}`).toBeGreaterThan(-1);
      expect(at, `every claim follows the origin consult: ${claim}`).toBeGreaterThan(consultIdx);
    }
    expect(SRC).not.toMatch(/nothing was pushed/);
    const absentArm = push.text.split('\n').find((l) => l.includes('does not carry this run head')) ?? '';
    expect(absentArm, 'in-block absence line gated on non-UNVERIFIABLE read').toContain("StartsWith('UNVERIFIABLE') -eq $false");
    expect(SRC).toMatch(/if \(\$read\.Count -eq 0\) \{ return 'ABSENT' \}/);
  });

  it('rev5 read classifier: total, ordered, else-free; every terminal wording keys on it', () => {
    const fn = SRC.slice(SRC.indexOf('function Get-ReadClass'), SRC.indexOf('function Get-HostHash'));
    expect(fn.length, 'function located').toBeGreaterThan(10);
    expect(fn).toMatch(/if \(\$head -eq ''\) \{ return 'unverifiable' \}/);
    expect(fn).toMatch(/if \(\$read -eq ''\) \{ return 'not-read' \}/);
    expect(fn).toMatch(/StartsWith\('UNVERIFIABLE'\) -eq \$true\) \{ return 'unverifiable' \}/);
    expect(fn).toMatch(/-eq 'ABSENT'\) \{ return 'confirmed-absent' \}/);
    expect(fn).toMatch(/Contains\(\$head\) -eq \$true\) \{ return 'carries-head' \}/);
    expect(fn).toMatch(/return 'other-head'/);
    expect(fn).not.toMatch(/\b(else|exit|break)\b/);
    expect((SRC.match(/Get-ReadClass/g) ?? []).length, 'def + 4 call sites').toBe(5);
  });

  it('rev5 footer: five mutually exclusive remote-read arms; unknown/unverifiable NEVER claim non-publication; grounded arms do', () => {
    const foot = (BLOCKS[FOOTER_IDX] as Block).text;
    const arms = foot.split('\n').filter((l) => l.includes("REMREAD -eq '"));
    expect(arms.length, 'exactly five classified arms').toBe(5);
    const arm = (cls: string) => arms.find((l) => l.includes(`REMREAD -eq '${cls}'`)) ?? '';
    const claim = 'nothing from this run is published';
    expect(arm('not-read')).toContain('UNKNOWN');
    expect(arm('not-read')).not.toContain(claim);
    expect(arm('unverifiable')).toContain('UNKNOWN');
    expect(arm('unverifiable')).toContain('absence is NOT assumed');
    expect(arm('unverifiable')).not.toContain(claim);
    expect(arm('carries-head')).toContain('CANNOT be claimed');
    expect(arm('carries-head')).not.toContain(claim);
    expect(arm('confirmed-absent')).toContain(claim);
    expect(arm('confirmed-absent')).toContain('verified origin read');
    expect(arm('other-head')).toContain(claim);
    expect(arm('other-head')).toContain('different head');
    expect(SRC, 'blind rev-4 arm is gone').not.toMatch(
      /origin ref read: \[' \+ \$script:REMOTE \+ '\]; nothing from this run is published at this head/,
    );
    const { out } = simulate({ kind: 'blockfail', index: PUSH_IDX });
    expect(real(out)).toEqual(['BLOCKED']);
    expect(out[0]).toBe('BLOCKED');
    expect(foot).toMatch(/no ref update by this run is possible/);
    expect(foot).toMatch(/push completed \(exit 0\) but the run did not finish verification/);
  });

  it('rev5 PHASE-10: exit code captured immediately; verified only on exit 0 AND exactly one exact ref-line match; failed query partial output NEVER verifies', () => {
    const verify = (BLOCKS[VERIFY_IDX] as Block).text;
    expect(verify).toMatch(
      /\$remoteOut = @\(& git\.exe -C \$REPOD ls-remote origin \('refs\/heads\/' \+ \$BRANCH\) 2>\$null\)\n\s*\$verifyCode = \$LASTEXITCODE/,
    );
    expect(verify).toMatch(/\$verifyCode = -1/); // throw path counts as failed query
    expect(verify).toMatch(/if \(\$verifyCode -ne 0\) \{ \$script:REMOTE = \('UNVERIFIABLE \(git ls-remote exit ' \+ \$verifyCode/);
    expect(verify).toMatch(/partial output quoted but NEVER used for verification/);
    expect(verify).toMatch(/\$parts\[0\] -eq \$headSha -and \$parts\[1\] -eq \('refs\/heads\/' \+ \$BRANCH\)/);
    expect(verify).toMatch(/if \(\$verifyCode -eq 0 -and \$exact -eq 1\) \{\n\s*\$script:PUSHSTATE = 'verified'/);
    expect(verify).toMatch(/partial output establishes NOTHING/);
    expect(verify).toMatch(/REMOTE ANOMALY: ' \+ \$exact \+ ' exact matching lines \(exactly 1 expected\)/);
    expect((SRC.match(/PUSHSTATE = 'verified'/g) ?? []).length, 'single verified assignment').toBe(1);
    expect(verify).not.toMatch(/Set-Result/); // terminal stays with the footer/PASS block
    expect(verify).toMatch(/no exact line/); // mismatch arm requires a successful query
  });

  it('remote SHA mismatch (verified-absent query): footer post-push arm names the branch that exists; sim one BLOCKED', () => {
    const verify = BLOCKS[VERIFY_IDX] as Block;
    expect(verify.text).toMatch(/REMOTE SHA MISMATCH/);
    expect(verify.text).toMatch(/PUSH-COMPLETED above stands - a branch exists on origin/);
    const { out } = simulate({ kind: 'blockfail', index: VERIFY_IDX });
    expect(real(out)).toEqual(['BLOCKED']);
    expect(SRC).toMatch(/PUSHSTATE -eq 'success' -or \$script:PUSHSTATE -eq 'verified'\) \{ Set-Result \('BLOCKED \(post-push\)/);
  });

  it('indeterminate + UNVERIFIABLE never reported absent; catch classifies and consults origin when uncached', () => {
    expect(SRC).toMatch(/UNVERIFIABLE \(git ls-remote exit/);
    expect(SRC).toMatch(/UNVERIFIABLE \(ls-remote threw/);
    const cb = catchBlock();
    expect(cb).toMatch(/PUSHSTATE -eq 'success' -or \$script:PUSHSTATE -eq 'verified' -or \$script:PUSHSTATE -eq 'indeterminate'/);
    expect(cb).toMatch(/if \(\$script:REMOTE -eq ''\) \{ \$script:REMOTE = Get-RemoteRef \$BRANCH \}/);
    expect(cb).toMatch(/\$script:REMREAD = Get-ReadClass \$script:REMOTE \$headSha/);
    expect(cb).toMatch(/a branch may exist on origin/);
    expect(cb).not.toMatch(/Set-Result 'PASS'/);
    const { out } = simulate({ kind: 'exception-after-push' });
    expect(out).toContain('CATCH-CONSULTS-ORIGIN');
    expect(real(out)).toEqual(['BLOCKED']);
    expect(out).not.toContain('PASS');
    expect(out).not.toContain('CATCH-PASS-LEAK');
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

  it('rev6 PHASE-4: quiet clone so PS 5.1 never treats routine progress as a terminating error; exit-code and identity gates intact', () => {
    const i = LINES.findIndex((l) => /git\.exe clone/.test(l));
    expect(i, 'clone call located').toBeGreaterThan(-1);
    expect(LINES[i]).toMatch(/& git\.exe clone --quiet -- \$REPO_URL \$REPOD 2>&1 \| ForEach-Object \{ Write-Log \('git: ' \+ \$_\.ToString\(\)\) \}/);
    expect(LINES[i + 1], 'genuine error handling preserved').toMatch(/if \(\$LASTEXITCODE -ne 0\) \{ Set-Blocked 'git clone failed' \}/);
    expect(SRC, 'no un-quieted clone anywhere').not.toMatch(/git\.exe clone (?!--quiet)/);
    // PHASE-4b running-bytes identity gate untouched (this gate fail-closed on the locally patched copy)
    expect(SRC).toMatch(/\$runDig = \(Get-FileHash -LiteralPath \$PSCommandPath -Algorithm SHA256\)\.Hash\.ToLower\(\)/);
    expect(SRC).toMatch(/if \(\$runDig -ne \$pubInstr\.sha\) \{ Set-Blocked 'running script bytes differ from the published instrument blob on origin\/main/);
    expect(SRC).toMatch(/re-run the bootstrap block/);
    for (const l of LINES.filter((x) => x.includes('2>&1'))) {
      expect(l, 'every merged-stderr native call is quiet-guarded: ' + l.trim().slice(0, 64)).toMatch(/--quiet|commit -q|Out-Null/);
    }
  });

  it('frozen hash record and 19-path byte gates preserved from revs 3/4', () => {
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

  it('authorization anchors at rev 6 (marker CHG-2026-10-29-14, baseline 4908842e, immutable locus, sealed digests, drift logging)', () => {
    for (const anchor of [
      'CHG-2026-10-29-14',
      '4908842e40d0c23c42a7f4b8cbebeade579ac2d9',
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
    expect(SRC).toMatch(/' rev6'/);
    expect(SRC).not.toMatch(/rev5/);
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
