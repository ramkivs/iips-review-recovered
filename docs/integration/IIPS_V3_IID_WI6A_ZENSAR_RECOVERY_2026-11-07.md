# WI-6A — Zensar primary-source recovery and nil-disclosure determination

**Date.** 2026-11-07. **Scope.** IRR only, one pass. No IPD writes, no production scope, no persistence change,
no IX policy change, no D-2 semantics changed. PR #502 preserved; nothing merged.

**Outcome.** `INVESTIGATED_UNSUCCESSFUL`. The consolidated section of the Zensar Technologies FY2023-24 filing was
**not retrieved**, so the consolidated question is **unresolved** — not answered "no", and certainly not answered
"nil". **No observation, no nil declaration, no dataset, no assessment, no persisted artifact.** In addition, one
independent fact was settled and it matters: the sentence that started this work is a **standalone** declaration
and can never carry a consolidated nil.

---

## 1. The question, and the two ways it could be answered

WI-6 ended with Zensar as `BLOCKED_NOT_ESTABLISHED`: a secondary aggregator attributes to Zensar's notes the
sentence *"The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March 2023"*, but the
primary filing could not be read. WI-6A was commissioned to break that block and answer one question:

> Do the **consolidated** financial statements of Zensar's FY2023-24 Integrated Annual Report declare borrowings nil?

Only two honest answers exist: *yes, here is the wording and its page* — or *not established*. This pass returns
the second, for two independent reasons, and records which reason is which.

---

## 2. The primary filing was reached — and read as far as it goes

The NSE archive URL **does** serve the document to this environment's plain reader. It was read end-to-end for its
front matter, and **two independent copies of the same document agree word for word**: the NSE original and the
RPG Group mirror (RPG is Zensar's parent group; the group itself publishes the report on its investor pages).

What the front matter establishes, from the filing itself:

| Field | Value | Where |
| --- | --- | --- |
| Legal name | Zensar Technologies Limited | cover, transmittal letter |
| Scrip ID / Symbol | `ZENSARTECH` / `ZENSARTECH` | transmittal letter, 15 July 2024 |
| Scrip code / Series | `504067` / `EQ` | transmittal letter |
| Subject | "Notice of 61st Annual General Meeting and Integrated Annual Report for FY 2023-24" | transmittal letter |
| Signatory | Rajiv Mundhra, Authorized Signatory | transmittal letter |
| **Standalone statements** | **printed pp.176-247** | contents spread and Index |
| **Consolidated statements** | **printed pp.248-321** | contents spread and Index |
| Glossary / SASB / SDG index | p.322 / p.327 / p.328 | Index |

`CIN` and `ISIN` do not occur in the readable window. They are recorded as `NOT_VERIFIED_FROM_FILING` rather than
filled in from a company-registry aggregator — the identity block is allowed to be incomplete; it is not allowed to
be borrowed.

**Retrieval stopped there.** Every reader available here renders roughly the first 100 KB of a PDF's text — about
55 printed pages of this one — and stops. The proxy that paginates whole documents is refused by the NSE archive
with `HTTP 403` (Akamai reference `#18.1668dc17.1794028603.32167b5a`). That is a **proxy** refusal, not an origin
block: WI-6's access note is corrected accordingly, and the same log shows the same cap on the mirror, which proves
it is a reader limit and not a server one. The other eleven routes — storage mirror (403), BSE annual-report path
(404), BSE announcement API (Referer-gated), Wayback (no snapshot), three public CORS proxies (blocked), the
FY2024-25 fallback copy (empty) — are itemised with exact statuses in
`evidence/real-issuer/WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07/source/access-log.txt`.

**Absence of text beyond a retrieval cap is never evidence of absence.** Pages 248-321 were never rendered; this
record therefore says nothing whatever about what they contain, including that they contain nothing.

---

## 3. The scope finding — settled on the document's own pagination

The sentence the owner located sits in the **Notes to the Standalone Financial Statements at printed pp.246-247**.

The filing's own pagination is decisive:

```
Standalone Financial Statements   begin at printed page 176
Consolidated Financial Statements begin at printed page 248
The sentence sits at printed pages 246-247  ->  BEFORE the boundary
```

So `statement_scope = STANDALONE`. Its subject is *Zensar Technologies Limited*, the legal entity. It says nothing
about subsidiaries, joint ventures, or the Group, and D-2 does not permit transferring a standalone declaration to
consolidated data.

Two consequences follow, and they are independent of the missing pages:

1. **The sentence can never be the consolidated evidence** — not because it is wrong, but because it is scoped to a
   different subject. This is the WI-5 failure mode one level up: there a sentence scoped to *equity* shares was
   refused as a preference-capital nil; here a sentence scoped to the *parent entity* is refused as a group nil.
2. **If the consolidated notes repeat the sentence, that repetition must be read and quoted in its own right.** An
   identical sentence appearing in two places is two pieces of evidence, not one piece of evidence carrying twice.

The sentence itself is recorded as `OWNER-REPORTED` and **not read by this run** — a transcription supplied in
conversation is a locator, not evidence.

### The caution that makes the transfer dangerous rather than merely irregular

Zensar's consolidation working papers show a subsidiary carrying borrowings in its own right: the special-purpose
financial statements of *Zensar Technologies Inc.*, prepared "for the purpose of consolidation by its Holding
Company (Zensar Technologies Limited)", show a current-borrowings line reading 110 / 140. That reproduction comes
from a market-data aggregator, undated against the audited set, and is **not evidence of anything**. It is recorded
for exactly one reason: to demonstrate that importing a parent-only "no borrowings" sentence into group figures is
an assumption with consequences, not a formality. No number from it appears in any dataset, and it is not used to
assert a consolidated borrowing balance.

---

## 4. Three-period check — `NOT_PERFORMED`, and why that is the correct entry

| Period | Consolidated statements | Read? | Nil wording |
| --- | --- | --- | --- |
| FY2023-24 (base) | printed pp.248-321 | no | none admissible |
| FY2022-23 | locator not identified | no | none |
| FY2021-22 | locator not identified | no | none |

The three-period requirement is a *confirmation* requirement: it exists to stop a single year's wording from
standing in for a trend. It cannot substitute for the base period. A table of three blank consolidated columns
would be three unread periods dressed as a finding, so the check is recorded as `NOT_PERFORMED` and every period as
`NOT_RETRIEVED`. No period is described as nil, zero, debt-free or silent — in `periods.json` or anywhere else.

---

## 5. What was not created, and what was not changed

* **No observation** was written, added to a candidate register as accepted, or left as a stub.
* **No nil declaration.** No `NIL: <wording>` record exists for Zensar in any form.
* **No dataset ingested**; **no assessment generated**; **no payload persisted**. The D-2 governed pipeline was not
  run — there was no admissible input to run it on.
* **No D-2 semantics changed.** Nothing in the nil grammar, the required CSV columns, the conflict resolution or the
  evidence classes was touched to make this pass look better.
* **Historical artifacts untouched**: the WI-3 (30 files), WI-5 (24 files) and WI-6 (8 files) bundles all still
  verify against their own `digests.json` from a clean clone; Infosys and eClerx are unchanged.

---

## 6. The limitation this pass adds

**`L-037` (new, `OPEN`) — deep-page retrieval of large Indian issuer annual reports is capped by every available
reader.** The direct reader renders about the first 100 KB of text and stops; the one reader that paginates whole
documents is refused by the NSE archive. The operational rule that follows is narrow and absolute: *absence of
wording beyond the cap is not evidence of absence*, and no negative finding about unrendered pages may be inferred
from it. This is the mirror image of the WI-6 lesson — there, an unreadable filing could not carry a nil; here, an
unreadable filing must not be reported as carrying none.

`L-036` remains **`PARTIALLY RESOLVED`** and `L-035` remains **`OPEN`**. Neither was touched, and neither was closed
to tidy up after a negative pass.

---

## 7. Verification

| Check | Result |
| --- | --- |
| `npx tsx --test tests/investment/wi6aZensarRecovery.test.ts` | 8/8 subtests pass, 0 fail (`runs/02-guard-test.txt`) |
| `npx tsx --test tests/investment/wi6SecondIssuerSearch.test.ts` | 8/8 pass — WI-6 record unchanged |
| `npx tsx --test tests/investment/wi5PreferenceCapitalEvidence.test.ts` | pass — WI-5 record unchanged |
| `npx tsc --noEmit` | clean (`runs/03-typecheck.txt`) |
| bundle digests | 7/7 verify; `digests.json` never records itself, and the bundle's own run logs (`runs/02`, `runs/03`, `runs/04`) are excluded by name (`runs/04-clean-clone.txt`) |
| clean clone | `/tmp/wi6av` reproduces the bundle, WI-6 8/8, WI-3 30/30, WI-5 24/24 |
| CI | **none exists in this repository** — `gh pr checks` reports "no checks reported"; no success is claimed |

---

## 8. What would finish this work item

One thing, and it is small: **a copy of Zensar's FY2023-24 Integrated Annual Report whose pages 248-321 can actually
be rendered.** Then read, in order, the consolidated balance sheet, the consolidated statement of changes in equity,
every borrowings / loans / lease / financial-liabilities note, the auditor's report, and the liquidity-risk note; and
look for an affirmative sentence about *consolidated* borrowings covering both 31 March 2024 and 31 March 2023.

* If such wording exists: quote it verbatim with printed page and note number, establish FY2022-23 and FY2021-22 on
  the same basis, and only then run the existing D-2 pipeline — unchanged — through ingest, generate, persist and
  separate-process readback.
* If it does not: Zensar stays `INVESTIGATED_UNSUCCESSFUL`, and no artifact is created for it.

Nothing in this record pre-commits that outcome. The objective — a second issuer beside Infosys with a genuine
consolidated nil-by-disclosure — remains **unmet**, and sector expansion remains deferred.
