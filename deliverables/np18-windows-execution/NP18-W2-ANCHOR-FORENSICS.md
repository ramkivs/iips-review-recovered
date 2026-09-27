# NP-18 — W2 ANCHOR FORENSIC CORRECTION

**Baseline:** `1a602d849cc47331d4f61cc366ed0a343f80e287` · branch `phase13-next`
**Governing R-2 authority:** `abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a`
**Status:** READ-ONLY forensics. No repository mutation. No commit. No push to `phase13-next`.

---

## 1. ROOT CAUSE — CONFIRMED

**The anchors' CONTENT was correct. The MATCHING was not line-ending agnostic.**

The Windows working tree was **CRLF**; every anchor was constructed with **LF**.
`Read-Utf8` returned raw bytes unnormalised, so the anchor gate compared LF anchors against
CRLF text → `count = 0` → `anchor ABSENT`.

### Causal chain (each link evidenced)

| # | Step | Evidence |
|---|---|---|
| 1 | Repo contains **no `.gitattributes`** | `find . -name .gitattributes` → none |
| 2 | `core.autocrlf` **unset** in repo config | `git config --get core.autocrlf` → empty |
| 3 | Nothing overrides the per-user setting | ⇒ Git for Windows default `true` applies |
| 4 | ⇒ working tree is **CRLF** | `git ls-files --eol` on a CRLF tree → `i/lf w/crlf` |
| 5 | Blob gate used `git hash-object`, which **applies the clean filter** | CRLF file → hash **= blob** ⇒ **gate PASSED** |
| 6 | Anchor gate used raw-byte ordinal search | LF anchor vs CRLF text ⇒ **count 0 ⇒ FAILED** |

**Step 5 is the key paradox.** The operator's report of *"baseline blob MATCH"* was correct —
that gate genuinely passed. Real git, real repo:

```text
blob in HEAD (LF)              : 0c2aa38e0600e0d2df09c2f84664d8a14f899879
working tree has CRLF          : YES
git hash-object (filtered)     : 0c2aa38e0600e0d2df09c2f84664d8a14f899879   <- MATCHES the blob
git hash-object --no-filters   : 4e7cdf2bf3ef1f35e422c01a4eac9936d1646faa   <- what the bytes really are
```

Two gates, two different notions of "the file", disagreeing.

### Why every observed symptom follows

| Observed | Explained by |
|---|---|
| all 6 NEW files created OK | new files are written fresh — no matching involved |
| failed at the **first** existing-file mutation (App.tsx) | anchor 1 is multi-line; first anchor reached |
| `anchor ABSENT` (not "duplicated") | `count = 0`, exactly as the CRLF mismatch predicts |
| exit code 1 | `Fail()` → `exit 1` |
| blob gate passed | `git hash-object` normalises; the raw-byte gate does not |

### Why the Linux dry-run could not catch it

On Linux the working tree is LF, so the asymmetry is **invisible** — anchors and text agree
by accident. The test environment could not represent the failing condition, so it validated
the wrong regime. That is the precise limitation of the earlier "16/16" claim: it was true
**of the LF regime only**, and was reported without that qualifier. That was the error.

---

## 2. App.tsx FORENSICS

**Identity**

```text
path        : frontend/src/app/App.tsx
size        : 4,864 bytes
blob (git)  : 15e638ed5b6f9448fcbb4b787783acd252fe0094
sha256      : 1b340ddf410c7bf7535fff1e6193101871b433aa09100e3578d610bd82d29513
```

**Line endings (as committed)**

```text
CRLF pairs : 0      bare LF : 75     bare CR : 0
BOM        : no     trailing LF : yes
```

The **committed** blob is LF-only. A Windows `autocrlf=true` checkout of that same blob is
CRLF. Both are "the baseline" by different definitions — which is exactly the trap.

**A. Import section (verbatim)**

```tsx
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { NotYetAuthorized } from '../components/shell/ShellStates';
import { LoadingState } from '../components/state/StateComponents';
```

**B. Route section containing /intelligence (verbatim)**

```tsx
        <Route path="/intelligence" element={<Lazy><IntelligenceHub /></Lazy>} />
        <Route path="/intelligence/decision-matrix" element={<Lazy><DecisionMatrix /></Lazy>} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
```

**C. Surrounding context needed**

```tsx
const DecisionMatrix = lazy(() => import('../features/decision-matrix/DecisionMatrix').then((m) => ({ default: m.DecisionMatrix })));
const IntelligenceHub = lazy(() => import('../features/intelligence/IntelligenceHub').then((m) => ({ default: m.IntelligenceHub })));
const EvidenceExplorer = lazy(() => import('../features/evidence/EvidenceExplorer').then((m) => ({ default: m.EvidenceExplorer })));
```

The three new routes must be inserted **between** `/intelligence/decision-matrix` and the
`/intelligence/*` catch-all, or the catch-all swallows them.

**F. The anchors W2 SHOULD use** — unchanged. They were, and remain, correct. What changes is
that the read text must be normalised before matching. See §5.

**G. Why the anchor was reported incorrect** — it was **not** the anchor. `"import ROUTES"`
is the **label** W2 printed (`$rel :: import ROUTES`); the anchor text was the two-line
`AppShell`/`NotYetAuthorized` pair, present **exactly once** in the baseline. The anchor was
right; the comparator was wrong.

---

## 3. ALL 16 ANCHORS AUDITED

`LF` = baseline bytes as committed. `CRLF` = same content with CRLF (autocrlf=true working
tree). `CRLF+norm` = CRLF file after `Normalize-Lf` on read (**the fix**).

| # | File | Purpose | LF | CRLF | CRLF+norm |
|---|---|---|---|---|---|
| 1 | App.tsx | `ROUTES` import before `NotYetAuthorized` | 1 | **0** | 1 |
| 2 | App.tsx | append 3 lazy view imports | 1 | **1** | 1 |
| 3 | App.tsx | insert 3 routes before catch-all | 1 | **0** | 1 |
| 4 | navigation.ts | docblock milestone note | 1 | **0** | 1 |
| 5 | navigation.ts | Intelligence group+children → implemented | 1 | **0** | 1 |
| 6 | IntelligenceHub.tsx | docblock futures → implemented | 1 | **0** | 1 |
| 7 | IntelligenceHub.tsx | Future block → Intelligence Views links | 1 | **0** | 1 |
| 8 | navigation.test.ts | top-level status assertion | 1 | **0** | 1 |
| 9 | navigation.test.ts | future-children assertion | 1 | **0** | 1 |
| 10 | Sidebar.test.tsx | partial-badge assertions | 1 | **0** | 1 |
| 11 | Sidebar.test.tsx | Future-badge assertion | 1 | **0** | 1 |
| 12 | Sidebar.test.tsx | non-navigable text → links | 1 | **0** | 1 |
| 13 | IntelligenceHub.test.tsx | add `CrossSectorData` import | 1 | **1** | 1 |
| 14 | IntelligenceHub.test.tsx | extend `urlAwareMock` | 1 | **0** | 1 |
| 15 | IntelligenceHub.test.tsx | honest-markers test | 1 | **0** | 1 |
| 16 | IntelligenceHub.test.tsx | placeholder-route test | 1 | **0** | 1 |

**All 16: exactly 1 occurrence in the literal baseline.**
**14 fail under CRLF; 2 survive.**
**The 2 survivors are exactly the 2 single-line anchors (#2, #13), which contain no embedded newline.**

That correlation is the proof: the failure is a function of embedded `\n`, not of anchor
content. Any anchor crossing a line boundary mismatches on a CRLF tree.

---

## 4. CORRECTION TABLE

| File | Intended mutation | Previous anchor | Actual anchor | Count | Correct strategy |
|---|---|---|---|---|---|
| App.tsx | ROUTES import | 2-line pair | **identical** | LF 1 / CRLF 0 | normalise read text |
| App.tsx | 3 lazy imports | 1 line | **identical** | LF 1 / CRLF 1 | normalise read text |
| App.tsx | 3 routes | 2-line pair | **identical** | LF 1 / CRLF 0 | normalise read text |
| navigation.ts | docblock | 2-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| navigation.ts | group status | 10-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| IntelligenceHub.tsx | docblock | 4-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| IntelligenceHub.tsx | views block | 5-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| navigation.test.ts | status | 5-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| navigation.test.ts | future children | 7-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Sidebar.test.tsx | badge | 3-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Sidebar.test.tsx | future badge | 5-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Sidebar.test.tsx | future text | 9-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Hub.test.tsx | import | 1 line | **identical** | LF 1 / CRLF 1 | normalise read text |
| Hub.test.tsx | mock | 10-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Hub.test.tsx | surfaces test | 9-line | **identical** | LF 1 / CRLF 0 | normalise read text |
| Hub.test.tsx | route test | 11-line | **identical** | LF 1 / CRLF 0 | normalise read text |

**No anchor text changes.** One comparator change fixes all 16.

---

## 5. THE FIX (revision 3)

```powershell
# BEFORE — returns raw CRLF text on a Windows checkout
function Read-Utf8([string]$abs) {
    if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) { Fail ('file not found: ' + $abs) }
    return [System.IO.File]::ReadAllText($abs, [System.Text.Encoding]::UTF8)
}

# AFTER — every read is normalised to LF, so anchors match in BOTH regimes
function Read-Utf8([string]$abs) {
    if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) { Fail ('file not found: ' + $abs) }
    $raw = [System.IO.File]::ReadAllText($abs, [System.Text.Encoding]::UTF8)
    return (Normalize-Lf $raw)
}
```

plus, in the comparator, a second line of defence plus a self-diagnosing failure:

```powershell
function Replace-Once([string]$text, [string]$anchor, [string]$replacement, [string]$label) {
    $t = Normalize-Lf $text                       # normalise the haystack as well
    $a = Normalize-Lf (Expand-Tokens $anchor)
    $r = Normalize-Lf (Expand-Tokens $replacement)
    if ($a.Contains("`r")) { Fail ('anchor itself contains CR (' + $label + ') - script defect') }
    $count = ([regex]::Matches($t, [regex]::Escape($a))).Count
    if ($count -eq 0) { Fail ('anchor ABSENT (' + $label + ') - ' + (Get-AnchorDiagnostic $t $a)) }
    if ($count -gt 1) { Fail ('anchor DUPLICATED ' + $count + ' times (' + $label + ')') }
    ...
}
```

`Get-AnchorDiagnostic` prints the file's actual CRLF/LF census and whether the anchor's first
line is present at all, so a residual cause can never hide behind a bare `anchor ABSENT`.

A new **`Assert-LineEndings`** gate runs before any mutation: it prints a census of the six
targets, and **refuses** a BOM or MIXED line endings.

Writing was never at risk: `Write-Utf8Lf` already normalises and emits LF-only, so the
**committed** result was always LF-only in both regimes.

---

## 6. REGIME-INDEPENDENCE PROOF (executed)

A real `git clone` with `core.autocrlf=true`, run twice — once pristine LF, once with the six
targets converted to CRLF:

```text
baseline : 1a602d849cc47331d4f61cc366ed0a343f80e287
autocrlf : true

[LF]   emitted 12 files -> 6 new, 6 modified   anchors 16/16
[CRLF] emitted 12 files -> 6 new, 6 modified   anchors 16/16

12/12 file hashes IDENTICAL between regimes · 0 CRLF in every output
REGIME-INDEPENDENT OUTPUT : YES
```

Then the emitted tree was tested for real:

```text
typecheck frontend / server : CLEAN / CLEAN
targeted NP-18 tests        : 6 files, 71 passed
FULL SUITE                  : 54 passed | 5 skipped · 677 passed | 32 skipped | 0 failed
BUILD                       : PASS (emits IntelligenceOpportunities / IntelligenceRisks / IntelligenceRankings)
changed paths               : exactly 12 (6 modified + 6 new)
```

---

## 7. WHAT IS NOT PROVEN

**No PowerShell host exists in the derivation environment.** `pwsh` is absent;
`release-assets.githubusercontent.com`, `objects.githubusercontent.com`, and
`packages.microsoft.com` are all blocked; `apt` is unavailable. Therefore:

- The matching rule (`[regex]::Matches([regex]::Escape(a)).Count` and ordinal `IndexOf`) is
  literal substring search and was executed here at byte level under **both** regimes.
- The git normalisation behaviour was executed with **real git**.
- **The corrected script has NOT been executed as Windows PowerShell.** That gap closes only
  on the next Windows run — which is why the script now carries `Assert-LineEndings` and the
  self-diagnosing anchor failure instead of failing silently.

Claiming otherwise would repeat the exact defect that caused this failure: reporting a result
from an environment that could not represent the condition being tested.

---

## 8. FINAL CONDITION

```text
FILES     = 0     (no repository file created, modified or deleted by this forensics task)
COMMITS   = 0
PUSHES    = 0
ACTS      = 0
phase13-next = 1a602d849cc47331d4f61cc366ed0a343f80e287  (UNMOVED)
NP-18 = OPEN / COMMISSIONING · durable NO · qualified NO · released NO
```
