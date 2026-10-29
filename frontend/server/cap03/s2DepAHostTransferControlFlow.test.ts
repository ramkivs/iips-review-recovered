/**
 * CAP-03 S2-DEP-A host-transfer instrument — terminal-state control-flow contract.
 *
 * Authority: IRR tracker §16.188 (`CV-CORR-168`, `CHG-2026-10-29-10`), rev-3
 * correction of the rev-2 defect in which a failed remote-head verification
 * (push succeeded, SHA mismatch) emitted `RESULT: PASS` from inside the same
 * unguarded block as the blocking call. These tests pin the corrected control
 * flow so the defect class cannot silently return: a terminal PASS must be
 * structurally unreachable once any gate has failed, and every terminal line
 * must flow through the single-emit guard. No PowerShell runtime exists in CI;
 * the assertions interpret the published script's real block layout (each
 * top-level `if ($STATE ...)` block executes iff its gate holds; a failure
 * flips the state for every later pass-gated block; an exception unwinds past
 * the footer into the catch).
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

type Block = { cond: 'pass' | 'notpass'; text: string; start: number; end: number };

function blocksUntil(needle: RegExp): { list: Block[] } {
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
  expect(blocks.some((b) => needle.test(b.text)), 'gated blocks located').toBe(true);
  return { list: blocks };
}
const BLOCKS = blocksUntil(/PHASE-9 push/).list;

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

const PUSH_IDX = BLOCKS.findIndex((b) => /PUSH-COMPLETED/.test(b.text) && /git exit 0/.test(b.text));
const VERIFY_IDX = BLOCKS.findIndex((b) => /REMOTE SHA MISMATCH/.test(b.text));
const SUCCESS_IDX = BLOCKS.findIndex((b) => /Set-Result 'PASS'/.test(b.text));
const FOOTER_IDX = BLOCKS.findIndex((b) => b.cond === 'notpass' && /Set-Result 'BLOCKED/.test(b.text));

type Injection = { kind: 'none' } | { kind: 'blockfail'; index: number } | { kind: 'exception-after-push' };

/**
 * Interpret the gate semantics and return the ORDERED terminal emissions:
 * 'PASS' (from Set-Result 'PASS'), 'BLOCKED' (first guarded Set-Result BLOCKED),
 * 'SUPPRESSED' (a later Set-Result while one already stands — proves the
 * single-emit guard is doing work), 'RAW-EMIT' (any bypassing Write-Log of a
 * RESULT: literal outside the helper — must never appear).
 */
function simulate(inject: Injection): { out: string[]; pushed: boolean } {
  const out: string[] = [];
  let state: 'PASS' | 'BLOCKED' = 'PASS';
  let pushed = false;
  let unwound = false;
  const alreadySet = (): boolean => out.includes('PASS') || out.includes('BLOCKED');
  const emitFrom = (text: string): void => {
    for (const line of text.split('\n')) {
      if (/Set-Result 'PASS'/.test(line)) {
        out.push(alreadySet() ? 'SUPPRESSED' : 'PASS');
      } else if (/Set-Result 'BLOCKED/.test(line)) {
        out.push(alreadySet() ? 'SUPPRESSED' : 'BLOCKED');
      } else if (/Write-Log 'RESULT: /.test(line)) {
        out.push('RAW-EMIT');
      }
    }
  };
  BLOCKS.forEach((b, idx) => {
    if (unwound) return;
    if (inject.kind === 'exception-after-push' && pushed && idx > PUSH_IDX && idx !== FOOTER_IDX) {
      // the throw unwinds past every remaining try statement, including the footer
      unwound = true;
      const cb = catchBlock();
      // catch's three guarded Set-Result paths, evaluated for the current flags:
      const post = /PUSHED -eq \$true -and \$script:RESULT -eq ''/.test(cb);
      const unchanged = /PUSHED -eq \$true -and \$script:RESULT -ne ''/.test(cb);
      if (/Set-Result 'PASS'/.test(cb)) out.push('CATCH-PASS-LEAK');
      if (post && !alreadySet()) out.push('BLOCKED');
      if (post && alreadySet() && unchanged) out.push('TERMINAL-UNCHANGED');
      return;
    }
    const runs = b.cond === 'pass' ? state === 'PASS' : state !== 'PASS';
    if (!runs) return;
    if (idx === PUSH_IDX && !(inject.kind === 'blockfail' && inject.index === PUSH_IDX)) pushed = true;
    emitFrom(b.text);
    if (inject.kind === 'blockfail' && idx === inject.index) state = 'BLOCKED';
  });
  return { out, pushed };
}

describe('S2-DEP-A instrument — terminal-state contract (rev 3, §16.188)', () => {
  it('structure: push, remote-verification and success are three SEPARATE state-gated blocks', () => {
    expect(PUSH_IDX).toBeGreaterThan(-1);
    expect(VERIFY_IDX).toBeGreaterThan(PUSH_IDX);
    expect(SUCCESS_IDX).toBeGreaterThan(VERIFY_IDX);
    expect(FOOTER_IDX).toBeGreaterThan(SUCCESS_IDX);
    expect(BLOCKS[SUCCESS_IDX]?.cond).toBe('pass');
    expect(BLOCKS[VERIFY_IDX]?.cond).toBe('pass');
  });

  it('regression (rev-2 defect): remote-SHA mismatch after a successful push never yields RESULT: PASS', () => {
    const verify = BLOCKS[VERIFY_IDX];
    expect(verify).toBeDefined();
    // the failing block itself contains no terminal emission at all
    expect((verify as Block).text).not.toMatch(/Set-Result/);
    expect((verify as Block).text).not.toMatch(/RESULT: PASS/);
    const { out, pushed } = simulate({ kind: 'blockfail', index: VERIFY_IDX });
    expect(pushed).toBe(true);
    expect(out).not.toContain('PASS');
    expect(out).not.toContain('RAW-EMIT');
    expect(out.filter((r) => r === 'BLOCKED').length).toBe(1);
    // and the footer that stands in is the post-push wording, not "nothing was pushed"
    const footer = BLOCKS[FOOTER_IDX];
    expect((footer as Block).text).toMatch(/\$script:PUSHED -eq \$true[\s\S]*BLOCKED \(post-push\)/);
    expect((footer as Block).text).toMatch(/\$script:PUSHED -eq \$false[\s\S]*nothing was pushed/);
  });

  it('push failure: non-zero git exit blocks before any terminal statement; no ref-update claimed; no PASS', () => {
    const push = BLOCKS[PUSH_IDX];
    expect(push).toBeDefined();
    const t = (push as Block).text;
    expect(t).toMatch(/\$pushCode = \$LASTEXITCODE/);
    expect(t).toMatch(/if \(\$pushCode -ne 0\) \{ Set-Blocked \(/);
    expect(t).toMatch(/No ref update reached origin/);
    expect(t).toMatch(/if \(\$pushCode -eq 0\) \{/);
    expect(t).toMatch(/\$script:PUSHED = \$true/);
    expect(t).not.toMatch(/Set-Result/);
    const { out, pushed } = simulate({ kind: 'blockfail', index: PUSH_IDX });
    expect(pushed).toBe(false);
    expect(out).not.toContain('PASS');
    expect(out).not.toContain('RAW-EMIT');
    expect(out.filter((r) => r === 'BLOCKED').length).toBe(1);
  });

  it('post-push exception: truthful partial-post-push terminal (BLOCKED, branch may exist), never PASS, never a false "nothing was pushed"', () => {
    const cb = catchBlock();
    expect(cb).toMatch(/PUSHED -eq \$true -and \$script:RESULT -eq ''/);
    expect(cb).toMatch(/BLOCKED \(exception, post-push\)/);
    expect(cb).toMatch(/terminal result unchanged/);
    expect(cb).toMatch(/nothing was pushed \(no PUSH-COMPLETED line above\)/);
    expect(cb).not.toMatch(/Set-Result 'PASS'/);
    const { out } = simulate({ kind: 'exception-after-push' });
    expect(out).not.toContain('PASS');
    expect(out).not.toContain('RAW-EMIT');
    expect(out).not.toContain('CATCH-PASS-LEAK');
    expect(out.filter((r) => r === 'BLOCKED').length).toBe(1);
  });

  it('successful completion: exactly one PASS, after push and remote verification, via the single-emit guard', () => {
    const { out, pushed } = simulate({ kind: 'none' });
    expect(pushed).toBe(true);
    expect(out).toEqual(['PASS']);
    // the ONLY place a RESULT: line is written is the guarded helper
    const guard = SRC.match(/function Set-Result\(\[string\]\$r\) \{\s*\n\s*if \(\$script:RESULT -eq ''\) \{/);
    expect(guard, 'single-emit guard').not.toBeNull();
    const rawEmits = LINES.filter((l) => /Write-Log 'RESULT: /.test(l) && !/\('RESULT: ' \+ \$r\)/.test(l));
    expect(rawEmits).toEqual([]);
  });

  it('hash-record consistency: record frozen at staging; host copy stays byte-identical to the committed copy', () => {
    expect(SRC).toMatch(/\$hostExpected\['evidence\/cap03-s2\/deposit-host-hashes\.txt'\]/);
    const writes = SRC.match(/Add-Content -LiteralPath \$HASHES/g) ?? [];
    expect(writes.length, 'record built pre-commit only: header + 15-line loop + MANIFEST + seal + transcript').toBe(5);
    expect(SRC).not.toMatch(/Add-Content -LiteralPath \$HASHES -Value \('# deposit branch/);
    expect(SRC).toMatch(/Write-Log \('deposit branch ' \+ \$BRANCH \+ ' head '/);
    // success-block narrative confirms the invariant it protects
    const success = BLOCKS[SUCCESS_IDX] as Block;
    expect(success.text).toMatch(/byte-identical to the committed copy/);
  });

  it('integrity gates and authorization anchors remain intact (no weakening)', () => {
    for (const anchor of [
      'CHG-2026-10-29-10', // rev-3 approval marker (must be on origin/main)
      '2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478', // immutable docs/evidence locus pin (strict)
      '9d3c09dbdb691c2527a45605dea20826b4ec2ba2f110985ee3f1033783b5225e', // sealed self-hash of folder SHA256SUMS.txt
      '9c9319fa3d7eaa822834c2f500e04dfec2b18d8157724843126a749b2bec91ab', // governing manifest sealed digest
      'a1c94ba6a2b96e08a1dc9e7e1d2c73be92c6c38f09d74aa4f00c5d8e445e0ede', // governing procedure sealed digest
      '$trk.Contains($APPROVAL_MARKER)', // tracker marker gate
      '25486fd832eeff1abb4cb097c0077ed8eafd7b79', // reviewed baseline (logged drift reference)
      'MAIN-MOVED', // drift is logged, never silent
      'Get-GitBlobDigest (\':\' + $k)', // pre-commit staged-blob extraction
      'Get-GitBlobDigest (\'HEAD:\' + $k)', // post-commit committed-blob re-verify
    ]) {
      expect(SRC, `anchor present: ${anchor}`).toContain(anchor);
    }
    for (const gate of [
      '\\$staged\\.Count -ne 19',
      'STAGED BYTE MISMATCH',
      'STAGED BYTE COUNT MISMATCH',
      'COMMITTED BYTE MISMATCH',
      'check-attr text eol',
      'core\\.autocrlf false',
      'core\\.safecrlf false',
      'host MANIFEST\\.json differs from published blob',
      'seal line disagrees with host hash',
      '\\.StartsWith\\(\'evidence/cap03-s2/\'\\)',
      '\\$script:PUSHED = \\$true',
    ]) {
      expect(new RegExp(gate).test(SRC), `gate present: ${gate}`).toBe(true);
    }
    // 19-path byte-expectation map: 15-artifact loop + four explicit keys
    const mapEntries = SRC.match(/\$hostExpected\[('|\()/g) ?? [];
    expect(mapEntries.length).toBe(5);
  });

  it('constraint surface: PowerShell 5.1 guardrails hold (no else/elseif/finally/exit/break, ASCII-only, balanced)', () => {
    expect(SRC).not.toMatch(/^\s*(else|elseif|finally|exit|break)\b/m);
    expect(SRC).not.toMatch(/\}\s*else\s*\{/);
    expect(SRC).toMatch(/^[\t\n\x20-\x7e]*$/);
    const pairs: Array<[string, string]> = [['{', '}'], ['(', ')'], ['[', ']']];
    for (const [a, b] of pairs) {
      const ca = SRC.split('').filter((c) => c === a).length;
      const cb2 = SRC.split('').filter((c) => c === b).length;
      expect(ca, `balance ${a}${b}`).toBe(cb2);
    }
    expect((SRC.match(/Read-Host/g) ?? []).length, 'terminal kept open exactly once').toBe(1);
    expect((SRC.match(/S2-DEP-A host transfer finished/g) ?? []).length).toBe(1);
  });
});
