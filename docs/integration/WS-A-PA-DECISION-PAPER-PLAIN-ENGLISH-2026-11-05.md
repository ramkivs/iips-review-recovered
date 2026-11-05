# Program Authority Decision Paper — Workstream A

**Prepared for:** the Principal Authority (PA) — the owner and sole user of this platform.
**Prepared by:** Arena, IRR integration agent, `2026-11-05`.
**Record:** `WS-A-PA-DECISION-PAPER-PLAIN-ENGLISH-2026-11-05`
**Companion:** `WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05.md` (formal wording, for the record)

> **STATUS: PREPARED PROPOSAL AND RECOMMENDATIONS — NOT AUTHORIZED, NOT EFFECTIVE.**
> This document creates no authority. It is not a PA act, and it does not record one. The PA decision
> record at §11 is carried by Arena as **`PENDING — NOT YET RENDERED`**. No owner identity is
> established, no retention period is set, no Act ID is assigned, no pin is designated, and no option
> described below is already approved.

> ## Read this first — what this document is, and is not
>
> This is a **decision paper**. It explains, in ordinary language, seven decisions that only you can
> make, why each has become necessary, what your choices are, and what Arena recommends.
>
> **Nothing in this document is approved, authorized, or in force.** Reading it changes nothing.
> Signing the decision record at the end is what creates authority — and even then, authority and
> implementation are separate steps.
>
> **You do not need to understand Git, commits, hashes, repositories, or any technical term to make
> these decisions.** Technical wording is provided, but it lives in a separate appendix
> (`WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05.md`) for the record, not for you to
> interpret. Where a technical term is unavoidable in this paper, it is translated on first use and
> collected in the glossary at §2.
>
> **No decision in this paper changes the version of the software in use, widens what Gate 4 or Gate 5
> may examine, weakens the safety catch that prevents permanent writes, or authorizes saving real user
> data.** Each of those is confirmed individually at §9.4.

---

## 1. The short version

### 1.1 What happened

Over recent weeks, work on importing your broker holdings reached a point where it needs **your**
decisions rather than more engineering. Three separate tracks are waiting:

| Track | In plain English | Waiting on |
| :--- | :--- | :--- |
| **Gate 4** — the formal qualification of the system on your own computer | A sealed "official version" must be named before the 11-part qualification examination can be prepared. No version has been named. | **4 decisions from you** |
| **Evidence retrieval** — being able to look up, over the local network, the record of what happened when a holdings file was read | The record-keeping itself already works and is proven. What's missing is permission to expose it through a local web address, plus three details only you can set. | **3 decisions from you** |
| **Identity resolution** — 67 of your 68 holdings could not be matched to the official list of recognised investments | This needs a genuine file from your own broker account. No amount of engineering can substitute for it, and nothing has been guessed or fabricated. | **1 action from you** (not a decision — supplying a file) |

### 1.2 The seven decisions, and Arena's recommendations

| # | Decision | Arena recommends | Needs |
| :--- | :--- | :--- | :--- |
| **1** | Which official version is Gate 4 measured against? | **Name the version already recommended by the existing record** (called G4P-1), and state openly that it is *not* the same version your broker-import feature currently uses | Your authorization |
| **2** | How do we handle the fact that this version contains some material outside Gate 4's permitted boundary? | **Accept it, with the fact recorded openly** (option C-1) | Your authorization |
| **3** | The temporary permission covering the older compatibility copy of the broker-reading code has expired by its own terms. Formalize the current state? | **Yes — ratify what already exists.** Nothing moves, nothing is changed | Your authorization |
| **4** | The label describing where your holdings data came from changed from "real" to "unclassified" as a side effect of an approved upgrade. What now? | **Accept the new label**, and record honestly that older tamper-evident fingerprints can no longer be reproduced | Your authorization |
| **5** | Whose data is this? (the owner and tenant labels for the evidence route) | **Create a new, separate pair of labels** for this purpose — proposed values given, verified unused anywhere | Your **personal** decision |
| **6** | How long is the evidence kept, and when is it deleted? | **Keep indefinitely; delete only on your explicit instruction; never automatically; never over the network** | Your authorization |
| **7** | What formal reference number identifies the evidence-route permission? | **Assign one** in the standard house form (a proposed number is given) | Your authorization (clerical) |

### 1.3 The single most useful thing you can do

**Decisions 5, 6 and 7 are the highest-value set**, and this is a deliberate, evidence-based
recommendation rather than a preference.

Reason: the work unlocked by decisions 1–4 (Gate 4) **cannot actually be completed yet**, because it
depends on your own Windows computer, which is currently unreachable, and on an examination that has
not started. The work unlocked by decisions 5–7 (the evidence route) **can be completed entirely
within existing engineering capability** — no unreachable computer, no external file, no further
authorization. It is the only decision set whose downstream work is fully feasible today.

Decisions 1–4 are still worth making, and are recommended, because they clear a governance blockage
that has been formally flagged as a **stop condition** (see §4.2). But if you only have time for one
thing, do decisions 5–7.

### 1.4 What is explicitly **not** being asked

- Not to approve Gate 4 or Gate 5, or to let any examination start or pass.
- Not to allow anything to be permanently written to your portfolio. The safety catch stays on.
- Not to allow real user data to be saved.
- Not to change which version of the software is installed or used.
- Not to approve any production or live deployment.
- Not to approve adding any investment to the official recognised-investments list.

---

## 2. Words used in this paper

| Term used here | What it actually means |
| :--- | :--- |
| **Official version** *(technical: pin / commit)* | A precise, tamper-evident snapshot of the software at one moment. Once named, it can never silently change. |
| **Sealed inventory** *(technical: H-12 manifest)* | A signed list of exactly which files count for qualification, with each file's fingerprint recorded. |
| **Gate 4** | The formal stage where the system is qualified as working correctly **on your own computer**, via an 11-part examination. |
| **The 11-part examination** *(technical: QE-1…QE-11)* | The qualification tests. **None has been taken. Score is 0 of 11.** |
| **Permitted boundary** *(technical: Limb A scope)* | The narrow slice of work Gate 4 is currently allowed to examine. |
| **Compatibility copy** *(technical: broker-import alias coordinate)* | A second, older copy of the broker-reading code kept so an existing approved screen keeps working. |
| **Data-origin label** *(technical: `sourceClassification`)* | A stamp on the data saying where it came from — "real" or "unclassified". It is baked into the tamper-evident fingerprints. |
| **Tamper-evident fingerprint** *(technical: lineage digest / SHA-256)* | A value computed from the data so that any change, however small, is detectable. |
| **Official recognised-investments list** *(technical: D05 security master)* | The governed list of investments the system is allowed to positively identify. Currently **2,250** entries. |
| **Refuses rather than guesses** *(technical: P04 fail-closed)* | If an investment cannot be positively identified, the system stops and says so. It never guesses. |
| **The safety catch** *(technical: W-1 / Gate E)* | The control that prevents anything being permanently written to your portfolio. **Currently ON.** |
| **Owner and tenant labels** *(technical: owner-context carrier)* | The values that say whose data a record belongs to. |
| **Evidence journal** | The tamper-evident local record of what happened when a holdings file was read. **Already built, merged and proven.** |
| **IRR / IPD** | The two separate code repositories. They have strictly separate write permissions; this work has never written to IPD. |

### 2.1 The six-stage distinction, which this paper never blurs

| Stage | Meaning | Who creates it |
| :--- | :--- | :--- |
| **1. Prepared proposal** | Arena has written down an option and its consequences. **No effect whatsoever.** | Arena |
| **2. Recommended decision** | Arena says which option it believes is best, and why. **Still no effect.** | Arena |
| **3. PA authorization** | You decide. This is the moment authority is created — and only if recorded in the decision record. | **You** |
| **4. Effective authority** | Your authorization has been formally published, independently checked, and read back. Only now may work begin. | You + verification |
| **5. Implementation** | The engineering is done under that authority. | Arena |
| **6. Verified completion** | The result has been independently read back from the authoritative source and matches byte for byte. | Arena + verification |

**Everything in this paper is at stage 1 or 2.** Nothing is at stage 3 or beyond. This paper contains
no claim of approval, no claim of effectiveness, and no claim of completion.

---

## 3. Why these decisions have become necessary now

Three things changed recently, and each is the reason a decision is now unavoidable rather than
merely open.

**First, an approved upgrade moved the system forward — and that triggered a formal stop rule.** On
5 November, the broker-import feature was upgraded to a modern version of the broker-reading code,
under your written instruction. That upgrade was successful and is fully verified. But the governing
rule for Gate 4 says, in its own words, that **any** substantive change in either repository between
the rule being written and the examination being run is a **"stop condition requiring explicit
re-designation."** The rule does not ask whether the change was approved. It simply requires that you
re-name the official version. Measured change since the rule: substantial in **both** repositories.
**So decision 1 is not a preference — it is the re-designation the rule demands.**

**Second, a temporary permission expired by its own terms.** In October, you permitted the system to
keep using an older compatibility copy of the broker-reading code. That permission was explicitly
**temporary** — "for the interim period only, and only while the guards hold." It also recorded that
one particular modernization approach was "technically impossible." The November upgrade **performed
that very approach successfully.** The conditions the temporary permission depended on no longer
describe reality. **Decision 3 formalizes the current state.**

**Third, a side effect was discovered that nobody had recorded.** The upgrade changed the data-origin
label on your holdings from "real" to "unclassified." This label is baked into the tamper-evident
fingerprints, so fingerprints recorded before the upgrade **can no longer be reproduced**. The change
was not authorized as a change of label — it was an unintended consequence of an authorized upgrade.
It was also **not detected by any test**: Arena verified that the term appears **zero times** in the
workstream report, is **absent** from the configuration profile, and is **asserted by no test
anywhere** in the codebase. It passed a full test run of 1,386 tests silently. **Decision 4 deals with
it honestly rather than leaving it undocumented.**

Arena is surfacing this rather than quietly fixing it, because fixing it would itself require
authority you have not given — and because the earlier permission states in terms that **no
re-labelling, no re-approval and no re-qualification is authorized**.

---

## 4. Decision 1 — Which official version is Gate 4 measured against?

### 4.1 The issue, in plain English

Gate 4 is the stage where the system is formally qualified as working correctly **on your own
computer**. Before that qualification can even be prepared, someone must name the **exact official
version** it is measured against — a sealed snapshot that cannot afterwards be quietly altered.

**No version has ever been named.** The existing record says so explicitly: *"the Gate 4 pin is
undesignated."*

Naming a version does **not** start the examination, does **not** pass anything, and does **not**
qualify anything. It is the act of choosing the measuring stick.

### 4.2 Why it is necessary now

Two independent reasons, both documented:

1. **The stop rule has been triggered.** The Gate 4 authority says: *"Any non-documentary drift in
   either pinned repository between this act and execution is a **stop condition** requiring explicit
   PA re-designation."* Substantive change has occurred in **both** repositories since that rule was
   written. The rule does not exempt approved change. **Re-designation is mandatory, not optional.**
2. **Everything downstream is frozen.** Four further workstream actions (A-11 through A-15) cannot
   begin until a version is named.

There is also a **trap that this decision must avoid**, and it is worth understanding because it is
the reason the question is more subtle than it looks:

> The Gate 4 rule actually describes **two different versions**, and the existing decision packet
> treats them as one.
>
> - The **content version** — the measuring stick for the sealed inventory and the examination
>   criteria. **This can be named today**, from versions that exist.
> - The **examination version** — defined by the rule as *"the final post-merge Limb A commit"*, with
>   the rule's own limitation: *"The IPD QE pin cannot exist until Limb A is implemented and merged."*
>   **The permitted boundary work is not implemented**, so this version **cannot exist yet**.
>
> **Consequence:** your decision can validly name the *content* version. It **cannot** produce the
> *examination* version, and must not be recorded as having done so. Arena has drafted the wording so
> that this distinction is stated on the face of the decision.

### 4.3 What exactly you are being asked to decide

To name one official version as the **Gate 4 content baseline**, and to confirm that this is a
*content* baseline only — not an examination baseline, not a qualification, and not a start.

One complication must be handled in the same breath. The sealed inventory is not a single snapshot;
it has **three** coordinates:

| Coordinate | Plain English |
| :--- | :--- |
| The main IPD snapshot | The primary body of code being qualified |
| The broker compatibility snapshot | The older copy kept so an existing approved screen works — **the subject of decision 3** |
| The IRR consumer snapshot | The version of the *consuming* code in the other repository |

The existing decision packet has room to name **one** version. **Naming one does not name the other
two.** Arena has therefore drafted the decision wording to require all three, so the record cannot
end up internally inconsistent. This is recorded as finding **I-3** in the technical package.

### 4.4 Your choices

Arena identified four real options. **Option D was not in the original packet** — Arena developed it
because the packet was written before the November upgrade and is now stale. It is clearly labelled as
new, and it is **not** presented as pre-approved.

| Option | What it means | Practical consequences |
| :--- | :--- | :--- |
| **A — Name G4P-1** *(the version the existing record already recommends)* | Use the snapshot recommended in October. | **Smallest** amount of out-of-scope material to accept: **7** changed files. It is merged, its checks passed at that exact snapshot, and it can be read back. **But** it is **61 versions behind** the current state of that repository, and **34 files** different from the version your broker-import feature actually uses. So qualifying it does **not** qualify the code you use daily. |
| **B — Require a boundary-only version** *(option "C-2")* | Insist on a snapshot containing **only** permitted-boundary work. | **Not available.** It requires new implementation work in the other repository, which has **not been authorized**. Choosing this would mean first authorizing that work, then waiting for it. |
| **C — Keep waiting** *(option "C-3")* | Leave the version unnamed until a future snapshot appears. | Nothing is currently scheduled to produce that snapshot. **The whole Gate 4 chain stays frozen indefinitely**, and the stop rule stays unsatisfied. |
| **D — Name the version actually in use** *(new; "G4P-4")* | Use the modern snapshot your broker-import feature consumes today. | **For:** only **5 versions** behind current; it *is* the code you use, so it resolves the coverage gap in option A; two of the four previously-divergent files now match the sealed inventory exactly. **Against:** it carries **34 files** of material outside the permitted boundary — nearly five times option A — so the "accept out-of-scope material" ask becomes much larger; and because it post-dates the sealed inventory's approval, the **entire inventory would have to be re-created from scratch** rather than adjusted. |

### 4.5 Arena's recommendation

**Option A — name G4P-1 — with one mandatory addition.**

The addition: the decision must **state openly** that the Gate 4 content baseline and the version your
broker-import feature uses are **deliberately different things**, and that Gate 4 qualification makes
**no claim whatsoever** to cover the broker-import feature.

**Why:**

- It is the only option that is **available now** (B is unauthorized, C is indefinite).
- It asks you to accept the **least** out-of-scope material — 7 files rather than 34.
- It preserves the existing sealed inventory rather than forcing a complete re-creation, which is what
  option D would require.
- It is the version the existing authoritative record already recommends, so it does not overturn
  prior reasoning.
- Paired with the open statement, it is **honest** about the coverage gap instead of papering over it.

**Risks, stated plainly:**

| Risk | Mitigation |
| :--- | :--- |
| Gate 4 qualification will not cover the broker-import code you actually use | The open statement makes this explicit. Broker-import is a **separate track** with its own verified evidence (1,386 tests passing, build passing, hosted checks passing, byte-for-byte read back). No claim of Gate 4 coverage is made for it. |
| The named version is 61 versions old | It is a **measuring stick**, not the running system. Nothing is rolled back. The running system continues to use the modern version. |
| Someone later assumes naming the version started the examination | The drafted wording says on its face: *"Designation is not Gate 4 execution"*, and cites the rule's own limitation that the examination version cannot exist yet. |

### 4.6 If you defer

The stop rule stays unsatisfied, which is a **formal defect** in the Gate 4 record rather than a
practical outage. Actions A-11 through A-15 stay frozen. Nothing breaks, nothing degrades, and no
existing approval is invalidated — the system you use today is unaffected. Deferral is **safe but
stalling**.

### 4.7 Authority boundary — exactly what this decision does and does not do

| It DOES | It does NOT |
| :--- | :--- |
| Name a measuring stick for Gate 4 content | Start, run, pass or accept any examination |
| Satisfy the mandatory re-designation rule | Change the examination score (stays **0 of 11**) |
| Allow the sealed inventory to be re-created later | Approve the re-created inventory |
| Record that broker-import is a separate track | Authorize any implementation work |
| — | Change which version of the software is installed or used |
| — | Touch Gate 5, the safety catch, or real-user saving |
| — | Authorize any testing on your computer |

---

## 5. Decision 2 — How to handle out-of-scope material in the named version

### 5.1 The issue, in plain English

The version recommended in decision 1 contains some work that falls **outside** the narrow slice Gate
4 is currently permitted to examine. This is not a defect or a mistake — it is simply how the
repository evolved. But it means you must decide, explicitly, whether Gate 4 may measure a version
that contains material beyond its permitted boundary.

The existing record already framed this as a three-way choice, and Arena measured it rather than
taking it on trust: the out-of-scope material in the recommended version is **7 files**, and Arena
identified what they are and why they fall outside the boundary.

### 5.2 Why it is necessary now

Because decision 1 cannot be made coherently without it. The two decisions are **coupled**:

- If you choose **option B** here (insist on boundary-only material), then **options A and D in
  decision 1 both become inadmissible** — neither is boundary-only. You would be choosing to wait.
- If you choose **option A** here, decision 1 becomes actionable immediately.

Making decision 1 without decision 2 would leave the record self-contradictory.

### 5.3 What exactly you are being asked to decide

Whether Gate 4 may measure a version that contains material outside its permitted boundary, **with
that fact recorded openly** — or whether it must wait for a version that contains nothing else.

### 5.4 Your choices

| Option | Plain English | Consequences |
| :--- | :--- | :--- |
| **C-1 — Accept, and record it** *(recommended)* | Allow the version to be used, while stating openly that it contains 7 files of out-of-scope material. | Immediately actionable. Fully transparent. The out-of-scope material is **named in the record**, so nobody later mistakes the qualification's reach. This is the option the existing record itself recommends. |
| **C-2 — Insist on boundary-only** | Refuse any version containing other material. | **Requires new implementation work in the other repository, which is not authorized.** Would freeze Gate 4 until that work is separately authorized, performed, merged and verified. |
| **C-3 — Keep waiting** | Decide nothing until a suitable version exists. | Nothing is scheduled to produce one. Indefinite freeze. |

### 5.5 Arena's recommendation

**C-1 — accept, with the out-of-scope material recorded openly.**

**Why:** C-2 is not available without new authorization you have not given, and C-3 has no trigger.
C-1 is the only choice that is both honest and actionable. The transparency requirement is not
cosmetic: naming the 7 files means the qualification's reach is knowable forever afterwards.

**One essential refinement.** C-1 as originally written offered **two** candidate versions. Arena
measured both, and **one of them fails a mandatory requirement**:

> The requirement is that any named version must have passed its checks **both** at its own reference
> **and** after being merged. One candidate — the alternative snapshot offered under C-1 — was not
> merged in its own right; it was folded into a later merge. Its only recorded check run is a
> **pre-merge** run. **There is no post-merge run at that exact reference.**
>
> Naming it would either fail the requirement literally, or require accepting a check run belonging to
> a *different* reference than the one named — which is precisely the practice the Gate 4 rule warns
> against, because *"a stale pin severs the identity between what is tested and what runs."*

**So: choose C-1, and pair it with G4P-1 from decision 1 — not with the alternative snapshot.** This
is recorded as finding **I-1**.

### 5.6 If you defer

Decision 1 becomes unmakeable in practice, so the whole Gate 4 chain stays frozen. Same safety
profile as deferring decision 1: nothing breaks, nothing progresses.

### 5.7 Authority boundary

Choosing C-1 **accepts the composition of a measuring stick**. It does **not** authorize any
implementation, does **not** permit the boundary itself to be widened for any other purpose, does
**not** start any examination, and does **not** approve any result. The permitted boundary remains
exactly as narrow as it is today.

---

## 6. Decision 3 — Formalize the current state of the compatibility copy

### 6.1 The issue, in plain English

The system keeps **two** copies of the broker-reading code. One is modern; one is older. The older one
was kept because an existing, already-approved screen depended on it.

In October you granted permission for that arrangement — but you granted it **explicitly as a
temporary measure**. Your decision recorded, in its own words:

- *"permit the split … as an **interim**, guarded configuration"*;
- *"Alias movement | **None.** The alias is **not** re-pinned, **not** modernized, **not** retired by
  this act"*;
- that one modernization approach was *"**technically impossible**"*;
- and that the whole arrangement held *"**for the interim period only, and only while the guards
  hold**."*

On 5 November, under your written instruction, the compatibility copy **was modernized** — and the
approach previously recorded as "technically impossible" was **carried out successfully**.

### 6.2 Why it is necessary now

Because the temporary permission's own conditions no longer describe reality, and Arena measured this
rather than asserting it. Four specific "guards" that the October permission relied on were re-checked:

| Guard | October position | Measured now | Verdict |
| :--- | :--- | :--- | :--- |
| The old copy is essential because it supplies 14 raw source files | Passed | Those 14 files **still exist** at every version checked — but at the modern version they are **no longer reachable** by the consuming system, which now uses the published build output instead | **Superseded** — the reasoning no longer holds |
| Two files existed in two different versions simultaneously, so the build contained two conflicting copies | Passed, and explicitly recorded as a hazard | **Both files now match the sealed inventory exactly.** The conflict is **gone** | **Resolved — a genuine improvement** |
| Two other files diverged | Passed | They now exist in a **third** version, matching **neither** the old copy **nor** the sealed inventory — and **no approved inventory covers them** | **New gap** (finding I-5) |
| The data-origin label stayed "real" | Passed, expressly preserved | It is now **"unclassified"** | **Changed** — this is decision 4 |

So: **one guard resolved favourably, one superseded, one newly gapped, one changed.**

Importantly, the October permission also said that if the guards were relaxed, or the copy moved
**without** authority, a further stop-and-re-designate rule would apply. Arena checked both limbs:

- The copy **was** moved — **with** your authority. So the "without authority" limb is **not** met.
- The guards were **not relaxed** — they were **strengthened** (the old loose checks were replaced by
  stricter ones). So that limb is **not** met either.

**Conclusion: the October permission was not violated.** But its stated temporary scope **has been
used up**. The compatibility coordinate now has **no current governing permission**, which is a gap
that must be closed before decision 1 can be coherent — because decision 1's sealed inventory has
three coordinates, and this is one of them.

### 6.3 What exactly you are being asked to decide

To **ratify the current state** — to declare formally that the compatibility copy now stands at the
modern version, which is simply where the system already is.

**This is a ratification, not a change.** Nothing moves. No version is altered. No code is touched.

### 6.4 Your choices

| Option | Plain English | Consequences |
| :--- | :--- | :--- |
| **A — Ratify the current state** *(recommended)* | Declare that the modern version is the compatibility coordinate. | Records reality. Zero risk. Closes the gap so decision 1 is coherent. Requires **no code change and no version change**. |
| **B — Revert to the old copy** | Undo the November modernization. | **Would break the live broker-import feature.** The old copy's raw source files are no longer reachable through the modern packaging — that is exactly the failure the modernization fixed. Arena does **not** consider this viable and does not recommend it. |
| **C — Leave it ungoverned** | Decide nothing. | The sealed inventory keeps one coordinate with no current authority. Decision 1 cannot be made coherent. The October permission's own stop rule remains formally engaged in substance. |

### 6.5 Arena's recommendation

**Option A — ratify the current state.**

**Why:** it is the only option that is both safe and sufficient. It records what already exists, so it
cannot introduce a defect. Option B is not viable on the evidence. Option C leaves a formal gap that
blocks decision 1.

**Risk: effectively none.** Ratification changes no code, no version and no behaviour. The one thing
it does change is the **governance record** — from "temporary permission whose conditions have lapsed"
to "current, explicit authority."

**Note on how this must be recorded.** The October permission is an **effective decision**. Effective
decisions are **not rewritten or edited.** Arena has therefore recorded the change of circumstances
**additively**, in a new dated document, leaving the October text exactly as it stands. Your
ratification should take the same form: a new decision that supersedes the interim arrangement
prospectively, not an edit to the old one.

### 6.6 If you defer

Decision 1 can still be made, but it would name a sealed inventory whose compatibility coordinate has
no current authority — a known formal defect, recorded as such. Deferral is safe but leaves the
defect open.

### 6.7 Authority boundary

Ratification **changes no version, no code and no behaviour**. It does not authorize implementation,
testing, acceptance or production. It does not authorize any further modernization. It does not
re-approve the existing preview screen. It closes a governance gap and nothing more.

---

## 7. Decision 4 — The data-origin label changed; what now?

### 7.1 The issue, in plain English

Your holdings data carries a label saying where it came from. That label used to read **"real"**. It
now reads **"unclassified"**.

This matters more than it sounds, because the label is **an ingredient in the tamper-evident
fingerprints**. Arena verified this directly in the code: the label is passed into the fingerprint
calculation at **all three places** where fingerprints are computed. So:

> **Any fingerprint recorded before the upgrade can no longer be reproduced.** The data has not
> changed. The label used to compute its fingerprint has.

The change was **not** authorized as a label change. In October you expressly preserved the "real"
label and recorded that *"no re-labelling, no re-acceptance and no re-qualification is authorized or
performed."* The label changed anyway, as an **unintended side effect** of the modernization you
*did* authorize in November.

### 7.2 Why it is necessary now

Two reasons.

**First, it was invisible.** Arena verified that this change was recorded **nowhere**:

| Where Arena looked | Result |
| :--- | :--- |
| The main workstream report | **Zero** occurrences of the term |
| The configuration profile created during the upgrade | **No** label or lineage field at all |
| Every test in the codebase | **No test asserts the value.** The only occurrence anywhere in the front-end code is an unrelated one |

It therefore passed a full validation run of **1,386 tests, zero failures**, silently. An undocumented
change to a fingerprint ingredient is exactly the kind of thing that erodes trust in a tamper-evident
system, so it must be brought into the open.

**Second, the qualification criteria depend on it.** The examination criteria reference the data-origin
label. Until you decide what the label now is, those criteria rest on a value that no longer matches
reality.

### 7.3 What exactly you are being asked to decide

Which label is authoritative **going forward**, and how to record the fact that older fingerprints
cannot be reproduced.

### 7.4 Your choices

| Option | Plain English | Consequences |
| :--- | :--- | :--- |
| **A — Accept "unclassified"** *(recommended)* | Recognize the current label as authoritative, and record honestly that pre-upgrade fingerprints are not reproducible. | Requires **no code change at all**. Aligns the record with reality. Honest about the fingerprint consequence. Does **not** re-approve anything. |
| **B — Restore "real"** | Change the label back. | **Not available without new authority.** The label lives in the **other repository's** source code, which this workstream has no permission to modify. It would also contradict a change that repository already made and merged on its own authority. |
| **C — Re-approve the existing preview screen** | Treat the label change as requiring the screen to be re-accepted. | **Larger than necessary.** The screen's behaviour is unchanged; only a fingerprint ingredient changed. Re-acceptance would reopen work that is already closed, which your standing instructions forbid. |
| **D — Record the divergence and decide nothing** | Note the difference, take no position. | Leaves the examination criteria resting on a stale value. The gap stays open. |

### 7.5 Arena's recommendation

**Option A — accept "unclassified", and record the fingerprint consequence explicitly.**

**Why:**

- It is the **only** option that requires no unauthorized change. Option B needs the other
  repository's source modified; option C reopens closed work.
- "Unclassified" is that repository's **own current authoritative value**. It was already merged and
  already passing its own checks there **before** the November upgrade. The consuming system inherited
  it by using the modern package; it did not choose it.
- It is the **more conservative** label. "Real" is an affirmative claim about data provenance;
  "unclassified" makes no claim. Where a claim is no longer supported by an approved act, the honest
  position is to make no claim.

**The recommendation must be paired with an explicit record** stating:

1. that fingerprints recorded before the upgrade **cannot be reproduced**, and why;
2. that this is **not** a re-approval of the existing preview screen;
3. that this is **not** a re-qualification and **not** a re-acceptance of any result;
4. that no code was changed to bring this about, and none is authorized by this decision.

**Risk:** historical fingerprint evidence becomes non-comparable across the upgrade boundary. That
risk **already exists** — accepting option A does not create it, it merely stops pretending otherwise.
The mitigation is the explicit record above.

**A caution Arena wants on the record.** There is a separate, unrelated finding elsewhere in the
governance history about the recognised-investments list not carrying per-record origin
classifications. It would be tempting to link the two. **They are different things.** This label
describes the provenance of **your imported holdings data**; that other finding describes the origin of
**entries in the recognised-investments list**. Arena draws **no inference** between them, and
recommends the decision record state that no such inference is authorized.

### 7.6 If you defer

The examination criteria continue to rest on a label that no longer matches reality, and the
fingerprint non-reproducibility stays undocumented. Deferral is safe operationally — nothing breaks —
but it leaves an honest-accounting gap open, which is contrary to the spirit of a tamper-evident
system.

### 7.7 Authority boundary

Accepting the label **changes no code and no version**. It does not re-approve any screen, does not
re-qualify anything, does not authorize any test, and does not permit any fingerprint to be
recalculated or "repaired." It records the authoritative label and its consequence.

---

## 8. Decisions 5, 6 and 7 — the evidence-retrieval permission

### 8.1 The shared context, in plain English

When you read a holdings file, the system keeps a **local, tamper-evident record** of what happened:
how many rows were read, which were recognised, which were refused and why. **This record-keeping
already works.** It is built, merged, proven to survive a full restart as a separate process, resistant
to tampering (it fails safely if altered), and it does not duplicate records if you import the same
file twice.

What does **not** exist is permission to **look that record up over the local network** — for example
from a browser page — instead of only from inside the program.

Today, asking for it returns "not found." **That is correct, governed behaviour, not a bug.** The
existing transport permission closed the list of allowed local addresses at exactly **two**, and Arena
verified that this closure is **byte-for-byte unchanged across 456 subsequent versions** — so nothing
has quietly drifted.

A new address requires a formal **addition** to that permission. Arena has drafted the full text of
that addition (25 clauses) and validated that it **does not quietly widen any existing permission**:
every element is either identical to something already allowed, strictly narrower than what it
exposes, or an extra constraint on the permission itself.

**No address has been added. Nothing has been implemented.** The draft is a proposal.

Three details in the draft are deliberately left blank, because only you can supply them. Those are
decisions 5, 6 and 7.

### 8.2 Decision 5 — Whose data is this?

**What it controls.** The **owner label** and **tenant label** that determine whose evidence a request
may see. Without them, a lookup address would be an unscoped read of personal financial evidence —
anyone able to reach the local address could read it.

**Why it matters for personal financial evidence.** This is the single most sensitive of the three
decisions. The record contains a row-by-row inventory of your holdings and the reasons rows were
refused. Getting the scoping wrong would mean personal financial data readable without a scope check.
Arena has therefore treated it as requiring **your personal decision**, not merely a technical
authorization.

**The technical situation Arena established** — this is what makes the decision necessary rather than
optional:

1. The evidence journal's lookup function **requires two label values** to be supplied by whoever
   calls it. Its governing authority states in terms that it is *"a library authority, not an HTTP
   identity or access-control boundary"* — meaning **the caller must supply the scope**, and the
   journal supplies none.
2. The existing two addresses in this family resolve their scope **from the other repository's active
   binding**, through a module whose whole design is that *"IRR does not resolve an owner, does not
   hold one, and cannot supply one."* That module **deliberately has no owner fields at all**, so that
   nothing caller-supplied can be substituted — the guarantee holds *"by construction rather than by
   validation."*
3. Asking the other repository to supply the labels per request would require a **new inter-process
   call**, which the existing transport permission **forbids** (*"no new IPC operation"*), and would
   require modifying the other repository, for which there is **no authority**.

**So there is no existing source for the two label values.** They must be established by your
decision.

**A precedent that constrains the answer.** When a similar question arose for the Reports feature, your
decision established a **separate, distinct** pair of labels for it and recorded that reusing or
aliasing the platform-wide pair was **"explicitly prohibited"**, because *"Reports maintains its own
distinct ownership declaration and partition boundary."* It also gave Reports its **own separate
carrier file**. The established principle is: **each distinct feature family gets its own labels.**

**Your choices:**

| Option | Plain English | Consequences |
| :--- | :--- | :--- |
| **A — Reuse the existing platform-wide labels** | Use the same pair the rest of the platform uses. | **Not recommended.** The Reports decision established that cross-family reuse is prohibited, because each family needs its own partition boundary. Following that principle consistently means not reusing here either. |
| **B — Reuse the Reports labels** | Use the Reports feature's pair. | **Not recommended**, for the same reason — and it would put broker evidence in the Reports partition, which is wrong in substance. |
| **C — Create a new, distinct pair** *(recommended)* | Establish labels specific to broker-import evidence, with their own carrier file, following the Reports pattern exactly. | Consistent with the established principle. Gives the lookup function the two values it requires. Keeps broker evidence in its own partition. **Requires you to render the values.** |
| **D — No labels; rely on the binding alone** | Hope the existing binding mechanism is enough. | **Technically insufficient.** The lookup function requires two concrete values, and the binding mechanism deliberately provides none. This option cannot be implemented as described. |

**Arena's recommendation: option C**, with the following values **proposed for you to render**.

> **These are proposals. They are not established, not approved, and have no effect. You may substitute
> any values you prefer.** Arena developed them because the existing documents define no adequate
> alternative, and verified them rather than inventing them blindly:

| Item | Proposed value | Verification Arena performed |
| :--- | :--- | :--- |
| Tenant label | `irr-broker-evidence-personal` | **0 collisions** — absent from the IRR working tree, absent from **all IRR history**, and absent from the other repository's current state |
| Owner label | `owner-irr-broker-evidence-personal` | **0 collisions**, same three checks |
| Carrier setting name | `IIPS_BROKER_EVIDENCE_OWNER_PATH` | **0 collisions**, same three checks |

This exactly satisfies the uniqueness test the Reports decision required: *"0 collisions across
repository history, F-3 records, and IPD corpus."*

The naming follows the Reports convention precisely (`irr-reports-personal` /
`owner-irr-reports-personal` / `IIPS_REPORTS_OWNER_PATH`), so the record stays internally consistent.

Arena also recommends the new permission copy the **full fifteen-property set** the Reports decision
established, which includes: labels are **partition keys, not identities or credentials**; they confer
**no roles and no privileges**; exactly **one** tenant, with **no guessing, no ambient fallback and no
client-selected tenant**; a **fixed one-to-one** mapping with no translation layer; **operator-only**
provisioning; **you** govern revocation, and removing the carrier disables the feature immediately,
failing safely; and any failure returns the same "unavailable" response with **no data read or
changed**.

**Whose decision is this?** **Your personal decision**, rendered as a PA authorization. It is not a
technical implementation matter — the engineering cannot choose your owner identity, and Arena will
not.

### 8.3 Decision 6 — How long is evidence kept, and when is it deleted?

**What it controls.** How long the parsed evidence records are retained, and the rule by which they are
deleted.

**Why it matters.** Two opposing risks, and the decision is about balancing them:

- **Keeping too much:** personal financial evidence accumulates on your disk without limit. The
  existing design has **no deletion mechanism at all** — Arena verified this: compaction was
  explicitly **not built** in the current version. So today the journal grows forever.
- **Deleting too eagerly:** the evidence is the **only row-level record** of why 67 of your 68 holdings
  could not be identified. If it is deleted, the justification for a future fix disappears with it.

**Mitigating facts Arena verified**, which shape the recommendation:

| Fact | Why it matters |
| :--- | :--- |
| Storage is **only** in your own local data folder | Never a code repository, never a network store, never a third party. The exposure that usually justifies automatic deletion is **absent**. |
| The **original file bytes are never kept** | Only the parsed summary is retained — a much smaller footprint than the source file. |
| The record is **tamper-evident** and fails safely | Altering it is detected; it cannot be silently corrupted. |
| **Foreign scope is already invisible** | Arena verified a test asserting that listing another owner's records returns **nothing**. |
| The **first** retained record is authoritative, and re-importing the same file returns it unchanged | This is a real guarantee — and **automatic deletion would break it**, because deleting the first record would change what a repeat import returns. |

**Your choices:**

| Option | Plain English | Consequences |
| :--- | :--- | :--- |
| **A — Keep forever, delete nothing** | The current de facto behaviour, made explicit. | Simple, but leaves unbounded growth unaddressed, which is the specific concern the gap record raised. |
| **B — Delete automatically after a fixed period** | e.g. delete anything older than 90 days. | **Not recommended.** Destroys the audit trail needed to verify any future identity fix. Also interacts badly with the "first record is authoritative" guarantee. |
| **C — Keep only the most recent N records** | e.g. keep the last 100 imports. | Bounds growth, but **still deletes automatically**, so it still breaks the first-record guarantee and still destroys audit history. |
| **D — Keep indefinitely; delete only on your explicit instruction** *(recommended)* | Nothing is ever deleted automatically. You may delete when you choose. Plus a documented review point if the journal grows beyond a stated size. | Preserves the audit trail completely. Preserves the first-record guarantee. Bounds growth by **review** rather than by silent deletion. No third-party exposure exists to justify automatic deletion. |

**Arena's recommendation: option D**, with these specific terms:

1. **Retention: indefinite**, within the local data folder only.
2. **Deletion: explicit-only** — never automatic, never time-based, never count-based.
3. **Deletion must never be reachable over the network.** The proposed address is **read-only**; no
   delete operation is admitted anywhere in this family.
4. **A documented review point** when the journal exceeds a stated size — Arena proposes **50 MB** as
   the review trigger, again as a **proposal for you to set**, not an established value. A review is
   *you looking at it and deciding*, not automatic deletion.
5. **The original file bytes remain never retained**, as today. Changing that would need a separate
   decision, not an accommodation.

**Whose decision is this?** **A PA authorization** (it is policy about your own data), followed by
technical implementation. It is not purely technical, because the trade-off between audit value and
disk growth is a judgement about your priorities, not an engineering question.

### 8.4 Decision 7 — The formal reference number

**What it controls.** The identifier by which the new permission is cited as **effective authority**.

**Why it matters.** In this governance system, a permission without a reference number is not
effective. Arena's draft currently says `PENDING ASSIGNMENT` in every place a number would go. Until
you assign one, the draft remains a proposal — and Arena **must not** assign one itself, because
reference numbers are how authority is traced, and self-assignment would make the record unauditable.

**This is the simplest of the seven decisions.** It is clerical. It involves no personal data, no
technical trade-off and no risk.

**Your choices:**

| Option | Consequences |
| :--- | :--- |
| **Assign a number in the standard house form** *(recommended)* | The permission can become effective once published and verified. Arena proposes the form `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`, derived from the existing conventions Arena surveyed (for example `IIPS-V3-CAP02-G4-AMEND-01-H12-MEMBERSHIP-2026-10-23`). **This is a proposal for you to assign, not an assigned number.** |
| **Use a different form you prefer** | Equally valid. Any consistent form works, provided it is unique and traceable. |
| **Defer** | The permission stays a proposal indefinitely. Decisions 5 and 6 would have been made to no immediate effect. |

**Whose decision is this?** **A PA authorization**, clerical in nature. No technical implementation and
no personal-data judgement is involved.

### 8.5 The proposed permission, in plain English

This is what the addition would say, in ordinary language. **It is a proposal with no effect.** The
formal technical wording is at Appendix §A-2.

> **What is being permitted**
>
> One new local address is added to the broker-import family, for **reading** the evidence record of a
> **single named import**. It is read-only. It is not a list, and it cannot be used to discover or
> enumerate what imports exist.
>
> **How a request is handled, in order**
>
> 1. Confirm the request comes from **this machine only**. Anything cross-origin is refused.
> 2. Confirm the operator has affirmatively established the local binding precondition. If not, the
>    request is refused **before anything is constructed or read**.
> 3. Validate the portfolio reference **before any input or output**.
> 4. Perform **one** scoped lookup of the evidence journal. Nothing else.
>
> **What is never revealed**
>
> No error message may disclose a stack trace, a provider detail, an owner, a tenant, a file path, a
> row value, or an identifier. Refusals give a fixed reason only. A record belonging to someone else,
> or that does not exist, or that has been deleted, all produce the **same** "not found" — so nothing
> can be learned by probing.
>
> **What is returned**
>
> Only the evidence fields already retained: the parsed row inventory, the fingerprints, the
> row-by-row identity findings, and the refusal details. **No canonical company identifier** — the
> system does not expose one and will not start. **No original file bytes** — they are never retained.
>
> **What is unchanged**
>
> No new network listener. No new inter-process call. The existing local server and the existing
> development proxy serve it. The other local addresses in this family stay exactly as they are, and
> every path not explicitly named still returns "not found." The safety catch on portfolio writes is
> untouched. Nothing is written anywhere by this address.
>
> **What this permission explicitly does not allow**
>
> Any write. Any claim that data was saved. Any change to the safety catch. Any Gate 4 or Gate 5
> movement. Any lifting of any fence. Any real-user saving. Any production use. Any change to the
> other repository. Any enumeration of records. Any retention or retrieval of original file bytes. Any
> transmission to any third party. Any change to the software version in use. Any addition to the
> recognised-investments list.
>
> **When it takes effect**
>
> Only when: you assign the reference number and fill in the three blank sets; it is published to the
> authoritative repository; its checks pass both before and after merging; and it has been
> independently read back. Publication details are recorded afterwards in the tracker, never embedded
> in the permission itself.

---

## 9. Dependencies, sequencing, and what changes nothing

### 9.1 Which decisions are independent

```
GATE 4 TRACK                              EVIDENCE TRACK                    IDENTITY TRACK
─────────────                             ──────────────                    ──────────────
  Decision 3  (ratify compatibility copy)   Decision 5  (owner/tenant labels)   Your action:
      │                                         │                             supply a genuine
      ▼                                         ▼                             Dhan "Detailed
  Decision 2  (accept out-of-scope material)  Decision 6  (retention & purge)    Holdings" export
      │                                         │                                  │
      ▼                                         ▼                                  ▼
  Decision 1  (name the official version)     Decision 7  (reference number)     New Wave-2
      │                                         │                             authorization needed
      ▼                                         ▼                                  │
  Sealed inventory can be re-created          The address can be built              ▼
  (action A-11)                               (action A-9)                     Re-run the assessment
                                                                                   (action A-7)
```

| Relationship | Detail |
| :--- | :--- |
| **Fully independent tracks** | The three tracks above share **no dependencies**. Deferring one does not affect the others. |
| **Within the Gate 4 track: 3 → 2 → 1** | Decision **3** should be taken **with or before** decision 1, because decision 1's sealed inventory has three coordinates and the compatibility copy is one of them. Decision **2** must accompany decision **1** — choosing "boundary-only" in decision 2 would make decision 1's recommended option inadmissible. **In practice: take all four Gate 4 decisions in one sitting.** |
| **Decision 4 is independent in sequence** | It can be taken at any point. But the examination criteria reference the label, so it should be settled **before** those criteria are relied on. |
| **Within the evidence track: 5 + 6 + 7 together** | All three are blanks in **one** document. Filling two of three leaves it unadoptable. **Take them together.** |
| **The identity track needs no decision from you** | It needs a **file** from you. No PA authorization can substitute for it, and no engineering can produce it. |

### 9.2 Numbered sequence, if you prefer to take them one at a time

1. **Decision 3** — ratify the compatibility copy. (Closes a gap; zero risk.)
2. **Decision 2** — accept out-of-scope material, paired with G4P-1.
3. **Decision 1** — name the official version, with all three coordinates.
4. **Decision 4** — accept the current data-origin label, with the fingerprint caveat recorded.
5. **Decisions 5, 6, 7** — the evidence permission, as one bundle.
6. **Your action** — supply the genuine Dhan Detailed Holdings export whenever convenient. This
   unblocks the identity track and is not gated on anything above.

### 9.3 What can proceed immediately, and what cannot

**Can proceed now, under your existing global approval — no new authority needed:**

| Work | Status |
| :--- | :--- |
| Investigation, measurement and evidence gathering | Ongoing; already exercised extensively in producing these packages |
| Documentation, decision papers, technical appendices | Ongoing; this paper is an example |
| Committing, publishing and independently verifying published work in IRR | Ongoing; every artifact in this pass was read back byte for byte |
| Targeted testing of code actually changed | Permitted; Arena has deliberately **avoided** re-running already-passing tests where measuring the absence of change was stronger and cheaper |
| Preparing implementation plans and validation plans | Done for both the evidence route and the identity deposition |

**Cannot proceed without new, specific authority:**

| Work | Blocked by |
| :--- | :--- |
| Building the evidence lookup address | Decisions 5 + 6 + 7, published and verified |
| Re-creating the sealed inventory | Decisions 1 + 2 + 3 |
| Any part of the 11-part examination | The inventory, **and** your computer being reachable, **and** separate operator authority |
| Adding investments to the recognised-investments list | Your genuine export, then a **new** Wave-2 authorization, then work in the other repository |
| Any change to the software version in use | Separate authorization with separate evidence |
| Any Gate 4 or Gate 5 acceptance | Their own effective authorities |
| Any real-user saving | Its own effective authority — **not granted by anything in this paper** |
| Any work in the other repository (IPD) | Arena has **no write permission there** and has never attempted it |

### 9.4 Does any decision change these five things? **No.**

Arena confirms each individually, because these are the protections that matter most:

| Protection | Changed by any decision in this paper? | Evidence |
| :--- | :--- | :--- |
| **The software version in use** *(the repository pin)* | **NO.** All three version references were read back from the authoritative source at the current merged state and are **unchanged**. Decision 3 **ratifies** the version already in use; it does not move it. Decision 1 names a **measuring stick**, not the running system — nothing is rolled back or advanced. | Verified at the current merged state |
| **Gate 4's permitted scope** | **NO.** Decision 2 accepts that a *measuring stick* contains out-of-scope material. It does **not** widen the permitted boundary for any other purpose. The boundary stays exactly as narrow as it is today. | Decision 1 §4.7; decision 2 §5.7 |
| **Gate 5's scope** | **NO.** Gate 5 remains **not initiated and not admitted**. Nothing in this paper touches it. | Confirmed unchanged |
| **The safety catch on portfolio writes** *(W-1)* | **NO.** It remains **ON**. Arena verified the current state: write operations and context discovery are still refused **even when** the binding precondition is asserted. The evidence address is **read-only** and admits **no** delete operation. | Verified in the current code and tests |
| **Real-user save authorization** | **NO. Not granted, not implied, not advanced.** No decision here authorizes saving real user data. Nothing is written by any proposed address. | Explicitly excluded in every package |

**One currency correction you should be aware of, which Arena did not make and does not reopen.** An
earlier statement in the workstream records said that **twelve** local addresses were all blocked.
That is no longer accurate: authorized work by a separate session on 1 November admitted **six
read-only** addresses for portfolio reads. The remaining **six — all writes and context discovery —
are still blocked**, and Arena verified they are refused **even with** the binding asserted.

Arena records this because a permission that recited the old "twelve blocked" baseline would recite
something superseded. **The write protection is intact.** This is another session's authorized,
completed work; it is preserved untouched and not questioned. It actually **helps** decision 5–7: it
establishes an existing, working precedent for exactly the kind of read-only, owner-scoped,
fail-closed, reads-nothing-from-the-request address being proposed.

---

## 10. Executive recommendation

### 10.1 Recommended choices

| # | Decision | Recommendation | Confidence | Principal risk |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Gate 4 official version | **Name G4P-1**, with an open statement that it is *not* the broker-import version and that Gate 4 claims **no coverage** of that feature | **High** — it is the only available option that minimizes out-of-scope material and preserves the existing sealed inventory | Qualification will not cover the code you use daily. Mitigated by the open statement; broker-import has its own separate verified evidence. |
| **2** | Out-of-scope material | **Accept and record it (C-1)** — paired with **G4P-1**, expressly **not** with the alternative snapshot | **High** — the alternative is unavailable and the third is indefinite | The alternative snapshot fails a mandatory check requirement at its own reference. Avoided by the pairing. |
| **3** | Compatibility copy | **Ratify the current state** | **Very high** — records reality; no code, version or behaviour changes | Effectively none. The alternative (reverting) would break the live feature. |
| **4** | Data-origin label | **Accept "unclassified"**, with the fingerprint non-reproducibility recorded explicitly, and no re-approval or re-qualification | **High** — the only option requiring no unauthorized change | Historical fingerprints become non-comparable across the upgrade. That risk already exists; accepting does not create it. |
| **5** | Owner and tenant labels | **Create a new distinct pair** — proposed values verified collision-free across both repositories and all IRR history | **High** on the approach; the **values are yours to set** | If the labels were ever wrong, evidence could be scoped incorrectly. Mitigated by the fifteen-property set (partition keys only, no privileges, no guessing, one tenant, operator-provisioned, you govern revocation, fails safe). |
| **6** | Retention and deletion | **Keep indefinitely; delete only on your explicit instruction; never automatically; never over the network;** plus a review point at a stated size | **High** — automatic deletion would destroy the only audit trail of why 67 rows were refused, and would break an existing guarantee | Unbounded growth. Mitigated by the review trigger, by the small footprint (parsed summary only, never original bytes), and by strict local-only storage. |
| **7** | Reference number | **Assign one** in the house form; proposed form given | **Very high** — clerical, no risk | None. Deferral would waste decisions 5 and 6. |

### 10.2 Any decision that should be deferred for insufficient evidence?

**Yes — one, and it is not among the seven.**

Arena recommends you **do not** decide, now, whether to add the 67 unidentified holdings to the
recognised-investments list. **The evidence to decide it does not exist yet.**

The reason is specific and worth understanding, because an earlier statement in the records needs
qualifying:

- Earlier records state that **none** of the 67 exist in the recognised list, having been checked
  "wider than the master."
- Arena verified this is **correct for what was actually checked** — the checks covered company name
  and symbol lookups.
- But the list is indexed **four ways**, and the fourth — the **ISIN**, the unique security identifier
  — **could not be checked at all**. The file that was read simply **does not contain an ISIN column**.
- So the ISIN check is **untested, not tested-and-absent**.

**This does not change the conclusion.** A separate, independent audit in the other repository already
established that the failures are **genuine absences** — every one of the 2,250 recognised entries
resolves perfectly, and unrecognized ones resolve not at all, with **zero** systematic failure among
entries that are present. And the list contains only **52 real Indian companies** (the 50 largest plus
two specifically added), the other **2,198 being synthetic test entries**. A real 68-holding portfolio
drawn from the wider market is therefore **expected** to be almost entirely absent.

But Arena will not record a claim of row-level ISIN evidence that does not exist. **The evidence class
matters, and stating it accurately is the whole point of a governed system.**

**Practical consequence, stated so it is not mistaken for progress:** supplying the correct file will
most likely **not** materially increase the number of matched holdings. Its value is different — it is
the **only lawful source of the ISINs** that any future addition to the list would require. Without it,
any addition would mean inventing identifiers, which is prohibited in three separate places: your
standing instruction, the other repository's schema rules (*"under NO circumstances is a company
identifier fabricated"*), and that repository's own audit recommendation (*"do not add ad-hoc
ungoverned aliases, and do not fabricate raw symbols"*).

### 10.3 The minimum set needed to unblock the next feasible work

**Decisions 5, 6 and 7 — the evidence permission.**

This is Arena's considered recommendation, and the reasoning is about **feasibility**, not importance:

| Track | Unblocked by | Can the downstream work actually be completed? |
| :--- | :--- | :--- |
| **Evidence** (A-9) | Decisions **5 + 6 + 7** | **YES — entirely within existing capability.** No unreachable computer, no external file, no other repository, no operator availability. Once the permission is effective, published and verified, the address can be built, tested against the current fence baseline, and verified. |
| **Gate 4** (A-11…A-15) | Decisions **1 + 2 + 3** (+4) | **NOT YET.** Even after designation, the next step needs your **own Windows computer**, which is currently **unreachable**, plus separate operator authority, plus an examination that has not started (0 of 11). Designation is necessary but not sufficient. |
| **Identity** (A-7) | **Your file**, then a new Wave-2 authorization, then work in the other repository | **NOT YET**, and the first gate is not a decision at all — it is a file only you can supply. |

**So: if you make only one bundle of decisions, make 5, 6 and 7.** They are the only ones that convert
directly into completable work.

Arena nonetheless recommends making **all seven** in one sitting, because decisions 1–4 are cheap to
make, close a formally flagged stop condition, and cost nothing to have settled — even though the work
they unlock cannot yet finish.

### 10.4 What Arena will do after you decide

Nothing in this paper is self-executing. On your decisions being recorded:

1. Arena publishes them as a formal decision record in the authoritative repository, additively,
   without editing any earlier decision.
2. Arena verifies publication independently — checks pass before and after merging, and every changed
   file is read back from the authoritative source and compared byte for byte.
3. **Only then** does implementation begin, and only for what the authority actually covers.
4. Arena reports completion separately, with evidence. **Prepared is not authorized, authorized is not
   effective, effective is not implemented, and implemented is not verified** until read back.

---

## 11. PA DECISION RECORD

> **This section is for you to complete.** It is written in ordinary language. Everything above it is
> explanation; everything below is decision.
>
> **Until you complete and return this, nothing here has any effect.** Arena will not treat silence,
> partial completion, or acknowledgement as authorization.
>
> Mark each line **APPROVED**, **APPROVED AS AMENDED** (and say how), or **DEFERRED**.

---

### Decision 1 — Name the official version for Gate 4

**In plain English:** *"I name the version already recommended by the existing record (G4P-1) as the
official version that Gate 4's content is measured against. I note that this is a measuring stick only:
it does not start the examination, does not pass anything, and is deliberately not the same version my
broker-import feature uses. Gate 4 makes no claim to cover that feature."*

- [ ] **APPROVED** as worded
- [ ] **APPROVED AS AMENDED** — amendment: ______________________________________________
- [ ] **DEFERRED**

---

### Decision 2 — Accept that this version contains some out-of-scope material

**In plain English:** *"I accept that the named version contains 7 files of material outside Gate 4's
permitted boundary, and I direct that those files be named openly in the record so the reach of the
qualification is knowable. I do not widen the permitted boundary for any other purpose."*

- [ ] **APPROVED** as worded
- [ ] **APPROVED AS AMENDED** — amendment: ______________________________________________
- [ ] **DEFERRED**

---

### Decision 3 — Formalize the current state of the compatibility copy

**In plain English:** *"I ratify the current state: the broker-compatibility copy now stands at the
modern version, which is where the system already is. The October temporary permission has served its
purpose and is superseded going forward. Nothing is moved, changed or rolled back by this. The October
decision itself is left exactly as written."*

- [ ] **APPROVED** as worded
- [ ] **APPROVED AS AMENDED** — amendment: ______________________________________________
- [ ] **DEFERRED**

---

### Decision 4 — Accept the current data-origin label

**In plain English:** *"I accept 'unclassified' as the authoritative data-origin label going forward. I
record that fingerprints computed before the November upgrade cannot be reproduced, because the label
is an ingredient in them. This is not a re-approval of the existing preview screen, not a
re-qualification, and not a re-acceptance of any result. No code is changed by this decision. I also
record that no inference is authorized between this label and the separate finding about origin
classifications in the recognised-investments list."*

- [ ] **APPROVED** as worded
- [ ] **APPROVED AS AMENDED** — amendment: ______________________________________________
- [ ] **DEFERRED**

---

### Decision 5 — Owner and tenant labels for the evidence route  *(your personal decision)*

**In plain English:** *"I establish a new, separate pair of labels for broker-import evidence, with its
own carrier file, following the same pattern the Reports feature uses. The labels are partition keys
only: they are not identities, not credentials, and confer no privileges. There is exactly one tenant,
no guessing, no fallback, and no client-selected value. I govern revocation, and removing the carrier
disables the feature immediately and safely."*

**Proposed values — Arena developed and verified these; they are NOT established. Substitute freely.**

| Item | Proposed | **Your value** (leave as proposed, or replace) |
| :--- | :--- | :--- |
| Tenant label | `irr-broker-evidence-personal` | ~~as proposed~~ → **`irr-personal-073dd1c8`** *(see amendment below)* |
| Owner label | `owner-irr-broker-evidence-personal` | ~~as proposed~~ → **`owner-4dc756b3`** *(see amendment below)* |
| Carrier setting name | `IIPS_BROKER_EVIDENCE_OWNER_PATH` | **`IIPS_BROKER_EVIDENCE_OWNER_PATH`** — **as proposed, adopted unchanged** |

- [ ] **APPROVED** with the proposed values
- [x] **APPROVED AS AMENDED** with the values I have written above — **RENDERED BY THE PA, `2026-11-05`**
- [ ] **DEFERRED**

> **RENDERED `2026-11-05` — DECISION 5, APPROVED AS AMENDED.** The PA's decision, in the PA's own words:
> *"Adopt `SAIRAM` as the permanent personal owner identity."* Requirements: use **one stable,
> application-generated canonical owner ID**; use **`SAIRAM`** as its **human-readable identity label**;
> bind personal holdings and associated evidence to this owner; **resolve ownership through the trusted
> application context**; **do not introduce multi-tenant or enterprise identity infrastructure**; and **do
> not interpret the name as granting another person independent access or ownership authority.**
> Application context: **personal, single-user application; no production deployment or multi-tenant
> concept; the personal application principal remains owned by Ramki; no second-user access or
> shared-account authorization is implied.**
>
> **The amendment replaces Arena's two proposed human-readable labels with a different structure**, and
> that structure turns out to be **required** rather than merely preferred: the existing rule for these
> labels (`IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md` §4.1) demands that they be *"Opaque: no personal,
> username, email, or company identity"*. **`SAIRAM` is a personal name and would fail that rule if used
> as the label key.** So `SAIRAM` is adopted as the **identity label** and **excluded from both partition
> keys**, which are instead **generated** by a documented, reproducible rule:
> **`owner-4dc756b3`** and **`irr-personal-073dd1c8`**. Both were verified collision-free (0 in the IRR
> tree, 0 across all IRR history, 0 in the other repository). The carrier setting name is **adopted as
> Arena proposed it**. `SAIRAM` confers **no access on any person** and is never used to look anything up.
> Full detail: `IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md` §3.
>
> **Arena's superseded proposal is preserved above and is not deleted.**

---

### Decision 6 — How long evidence is kept, and when it is deleted

**In plain English:** *"Parsed evidence is kept indefinitely, in my own local data folder only. Nothing
is ever deleted automatically — not by time, not by count. Deletion happens only on my explicit
instruction. No deletion is ever reachable over the network; the address is read-only. The original
file bytes are never retained, as today. A documented review point applies if the journal grows beyond
a size I set."*

| Item | Proposed | **Your value** |
| :--- | :--- | :--- |
| Retention period | Indefinite | **INDEFINITE — until explicit deletion by the application owner** |
| Deletion | Explicit-only, never automatic | **Explicit owner-controlled deletion ONLY** — no automatic expiry or deletion; **no automatic purge or destructive compaction** |
| Review trigger size | 50 MB | **50 MB retained as a WARNING / REVIEW threshold ONLY — never an automatic deletion trigger** |

- [ ] **APPROVED** with the proposed values
- [x] **APPROVED AS AMENDED** with the values I have written above — **RENDERED BY THE PA, `2026-11-05`**
- [ ] **DEFERRED**

> **RENDERED `2026-11-05` — DECISION 6, APPROVED AS AMENDED.** The PA's decision, in the PA's own words:
> *"Adopt indefinite retention until explicit deletion by the application owner."* Requirements: **no
> automatic expiry or deletion**; **no automatic purge or destructive compaction**; **explicit
> owner-controlled deletion only**; **preserve evidence integrity, import history and associated audit
> metadata**; **provide storage-usage visibility and appropriate backup/recovery safeguards**; and the
> **50 MB threshold, if retained, is a warning/review threshold only, never an automatic deletion
> trigger.**
>
> **The amendment adopts Arena's proposal in substance and adds two obligations it did not contain:**
> **storage-usage visibility (O-1)** and **backup/recovery safeguards (O-2)**. Neither may be delivered by
> adding a new web address — the permission admits exactly one read-only address and no more — so both are
> discharged through the responses that already exist, server-side logging, and written owner procedures.
> **Both are obligations on the eventual implementation and are NOT discharged yet.**
>
> **One genuine item remains for the PA (§14.3(1) below):** deletion is authorized **in principle**, but
> this permission keeps the web address **read-only** and admits **no delete operation anywhere**. As
> rendered, owner-controlled deletion is exercised **outside** the web surface — an explicit owner action
> on the local data folder, documented in the runbook. **If the PA wants deletion available inside the
> product's own screen or address, that needs a further decision.** Arena has not assumed it.
>
> **The technical reason automatic deletion remains prohibited** is unchanged and is now reinforced: the
> **first** retention is authoritative and a repeat import returns it unchanged, so automatic deletion
> would silently break an existing guarantee and destroy the only row-level record of the 67 unmatched
> holdings. Full detail: the act's §4.

---

### Decision 7 — The formal reference number

**In plain English:** *"I assign the following reference number to the evidence-route permission, so
that it can become effective authority once published and verified."*

| Item | Proposed form | **Your assignment** |
| :--- | :--- | :--- |
| Reference number | `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` | **ASSIGNED as proposed** — `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` |

- [x] **APPROVED** with the proposed form — **RENDERED BY THE PA, `2026-11-05`**
- [ ] **APPROVED AS AMENDED** with the number I have assigned above
- [ ] **DEFERRED**

> **RENDERED `2026-11-05` — DECISION 7, APPROVED.** The PA's direction, in the PA's own words: *"Assign the
> formal authorization Act ID using the existing governance register and numbering convention. Check for
> collisions before assignment. Do not invent or reuse an existing ID."*
>
> The PA thereby **delegated this clerical assignment**, subject to three constraints, all of which were
> verified **before** assignment:
>
> 1. **Existing convention** — the form was derived from the register's own amendment identifiers
>    (`…CAP02-G4-AMEND-01-H12-MEMBERSHIP-2026-10-23`,
>    `…CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01`, `…CAP02-G3-AMEND-02-U2`,
>    `IIPS-V3-G3-AMEND-01-2026-10-22-01`). `AMEND-01` is correct rather than `02`, because the existing
>    §7 addition to the same permission carried **no separate reference number**.
> 2. **Collision check performed** — **0** occurrences in the other repository, and the **only**
>    occurrences in this repository are in Arena's own proposal documents, in every case explicitly worded
>    as a *proposal*. **No instrument has ever been issued under it.**
> 3. **Neither invented nor reused** — it is **derived from the surveyed convention and verified
>    unassigned**.
>
> **The number is therefore ASSIGNED, and is not self-assigned:** the authority to assign comes from the
> PA's direction, and the value comes from the convention. Full detail: the act's §5.

---

### Confirmation — what these decisions do NOT do

By completing this record, you confirm your understanding that **no decision above**:

- [ ] starts, runs, passes or accepts any part of the 11-part Gate 4 examination (score stays **0 of 11**)
- [ ] initiates, admits or advances Gate 5 in any way
- [ ] weakens, relaxes or lifts the safety catch on portfolio writes
- [ ] authorizes saving real user data, in any form, in any circumstance
- [ ] changes which version of the software is installed or used
- [ ] authorizes any production or live deployment
- [ ] authorizes adding any investment to the recognised-investments list
- [ ] authorizes any modification to the other repository (IPD)
- [ ] authorizes any testing on your own computer
- [ ] makes any proposal in this paper effective before it is published and independently verified

> **Note, `2026-11-05`.** These boxes are **left unticked deliberately.** The PA rendered decisions 5, 6
> and 7 but did **not** mark this confirmation list, and **Arena will not tick a box on the PA's behalf** —
> that would be inferring a decision. What Arena has done instead is **verify each item independently** in
> the instrument of record: `IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md`
> §9 confirms that **none** of the ten items above is done or authorized by decisions 5, 6 or 7 — Gate 4
> stays **0 of 11**, Gate 5 stays **not initiated**, the write safety catch stays **on**, real-user saving
> stays **unauthorized**, the software version in use is **unchanged by this act**, production deployment
> stays **prohibited** (and the PA's own context confirms there is none), no investment is added to the
> recognised-investments list, the other repository is **unmodified with zero writes**, no testing on the
> PA's computer is authorized, and **the permission is not effective before publication and independent
> verification** — its §10 records those steps as **PENDING**.

---

### Signature

| | |
| :--- | :--- |
| **Decision maker** | Program Authority (Ramki) — single owner, sole user |
| **Date** | **`2026-11-05`** — for decisions **5, 6 and 7** only |
| **Decisions approved** | **5 — APPROVED AS AMENDED** · **6 — APPROVED AS AMENDED** · **7 — APPROVED** |
| **Decisions deferred** | **None** of 5, 6, 7. **Decisions 1, 2, 3 and 4 remain `PENDING — NOT RENDERED`.** |
| **Recorded by Arena as** | **`PARTIALLY RENDERED — DECISIONS 5, 6, 7 RENDERED 2026-11-05; DECISIONS 1–4 PENDING`** |
| **Instrument of record** | `IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md` — Act ID `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` |
| **Effectiveness** | **NOT YET EFFECTIVE** — the instrument's §10 conditions (publication, green checks, independent read-back) are **PENDING**; see §14.2 |

> **Arena recorded decisions 1–4 as `PENDING` and they remain `PENDING`.** Decisions 5, 6 and 7 were
> returned by the PA on `2026-11-05` and are recorded above and in the instrument of record. **Arena has
> not inferred, assumed, extrapolated or acted on any decision not explicitly given** — in particular,
> decisions 1, 2, 3 and 4 are **not** treated as approved, and the confirmation list above is **not**
> treated as marked.

---

## 12. Sources for every material recommendation

All sources are in the authoritative IRR repository unless marked IPD (read-only; **never written**).
Full technical detail, exact coordinates and measurement methods are in the appendix
(`WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05.md`).

| Recommendation | Source document | Section |
| :--- | :--- | :--- |
| Gate 4 stop rule; two different versions; examination cannot exist yet | IPD `evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md` | **§3.2** (four-part commit rule) and its **Limitation** |
| PA-09 question, option set, unfilled wording, what adoption unlocks | `docs/integration/IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md` | **PA-09**; also PA-01, PA-06, PA-08a/b/c, PA-10a/b/c, PA-19/PA-20 |
| C-1 / C-2 / C-3; the six obligations; the sequencing defect | `docs/integration/IIPS_v3.0_CAP03_P1_PA_FORMAL_DECISION_RECORD_2026-10-28.md` | **§4.5**, **§4.6**, **§3.1** |
| Temporary permission, its guards, and the "technically impossible" finding | `docs/integration/IIPS_v3.0_CAP03_DQ6B_PA_DECISION_PATH_A_EFFECTIVE_2026-10-25.md` | **§2** (quoted decision), **§3.1(1)**, **§3.1(5)** |
| Sealed inventory's three coordinates; guard findings V690–V695 | `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`; `…G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md` | `pinned_bases`, `split_baseline`; act §1.1–1.2 |
| Identity-split finding (F3) | `docs/integration/IIPS_v3.0_CAP03_IPD_S1_PUBLICATION_AND_DEPENDENCY_HANDOFF_2026-10-28.md` | **F3** |
| "Do not infer G4P-1" | `docs/integration/IIPS_v3.0_CAP03_G14_INDEPENDENT_ADVANCEMENT_RECONCILIATION_2026-11-01.md` | — |
| Closed address list; additive-amendment form; handler order; network invariant | `docs/integration/IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_EFFECTIVE_2026-10-23.md` | **§1**, **§2.2**, **§2.4**, **§3**, **§7**, **§7.1** |
| The authority gap; minimum required authority; blocker | `docs/integration/WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md` | **§1.1–1.3**, **§2**, **§3**, **§4.1–4.3**, **§5** |
| Journal is a library, not an access-control boundary | `frontend/server/persistence/persistence-service.ts` | PF-1 doc comment; **TD-3** (compaction not built), **TD-7a** (locality) |
| Reports precedent: distinct pair, aliasing prohibited, own carrier, fifteen properties | `docs/integration/IIPS_v3.0_REPORTS_NP06_R1_OWNERSHIP_DECLARATION_PA_DECISION_ACT_2026-10-25.md` | **§1** (U-1, U-2/U-3), **§2** (the fifteen dispositions), **§3** |
| Existing platform-wide labels and their governing act | `frontend/server/owner-context-carrier.ts` | Constants block; act `IIPS-V3-OWNER-CONTEXT-F1-F2-VALUE-ACT-01` §4 |
| IRR cannot resolve, hold or supply an owner; no owner fields by construction | `frontend/server/user-portfolio/ownerContextFromBinding.ts` | Header: **THE PROVENANCE RULE**, **WHAT IS DELIBERATELY ABSENT**, **FAIL CLOSED**, **NOT AUTHENTICATION** |
| Existing addresses already resolve scope from the binding | `frontend/server/broker-import/brokerImportHttp.ts` | Header items 3–4; `ownerContextFromBinding(...)` gate |
| Foreign scope already invisible; first record authoritative; tamper fails safe | `frontend/server/broker-import/brokerImportEvidenceStore.ts`; `brokerImportEvidenceRecoverer.ts` | `list(tenantId, ownerUserId)`; `foreignScopeInvisible` |
| Recognised-list composition; genuine absence; Detailed ISIN path works; audit recommendation 3 | IPD `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` | Executive Summary & Definitive Finding; **TASK A**; **TASK D**; **TASK E** Key Insight; Failure Classification Matrix; **Recommended Next Diagnostic & Operational Action** items 1 and 3 |
| Detailed format has ISIN and Exchange; summary format omits both; no fabrication permitted | IPD `evidence/bi04/dhan-web-ui-summary-v1-schema.md` | **§2.1**, **§2.2**, **§4** (Fail-Closed Constraints, Prohibitions), **§6** |
| Current master revision, checksum, record count, operator, prior act | IPD `evidence/operator_drop/d05_security_master_manifest.json` | `batchId`, `fileChecksumSha256`, `recordCount`, `operatorId` |
| Data-origin label feeds the fingerprint at all three sites | IPD `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` | The three fingerprint call sites |
| Full measured findings I-1…I-8; all candidate coordinates; obligation roll-up | `docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md` | **§3**, **§4**, **§5**, **§6**, **§7**, **§8**, **§11** |
| Drafted permission text; prerequisites P-1…P-10; non-expansion validation | `docs/integration/WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md` | **§2**, **§3**, **§4**, **§5** |
| External dependency; prerequisites PR-1…PR-8; validation V-1…V-10 | `docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md` | **§1**…**§6** |
| Nine-pillar milestone definition and roll-up | `docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md` | **§2.1**, **§3** |
| Action register A-1…A-18; currency corrections C-A, C-B, C-C | `docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md`; tracker **§16.251** | R2 **§9**, **§14**; §16.251.7 |

---

## 13. Statement of limits

This paper:

1. **Does not approve, authorize, enact or make effective anything.** It is a prepared proposal with
   recommendations, at stages 1 and 2 of the six-stage distinction at §2.1.
2. **Does not assign any reference number.** The proposed form at decision 7 is a proposal; the field
   in every drafted document still reads `PENDING ASSIGNMENT`.
3. **Does not establish any owner or tenant label.** The proposed values at decision 5 are
   collision-verified proposals, clearly labelled, with no effect. Arena will not invent an owner
   identity for a personal-financial-evidence read path.
4. **Does not set any retention period.** The proposed terms at decision 6 are recommendations; the
   drafted document still reads `TBD-PA`.
5. **Does not designate any version, name any official baseline, or re-create any sealed inventory.**
6. **Does not add, expose, register or mount any local address.** No listener was created; no
   inter-process call was added. Arena verified the address matcher is byte-for-byte unchanged across
   456 versions.
7. **Does not fabricate, reconstruct, guess or deposit any identity, ISIN, symbol, alias or mapping.**
   The recognised-investments list is **unchanged**; its revision, checksum and record count were
   verified unchanged.
8. **Does not change any software version in use**, does not modify the other repository, does not
   reopen completed work, and does not touch another session's merged work.
9. **Does not weaken, relax or bypass** the safety catch, the quarantine, Gate 4, Gate 5, or the
   write fence. Does not initiate production work or any real-user save.
10. **Does not mark the workstream or the milestone complete.** Both remain **NOT COMPLETE**, with
    three independent outstanding dependencies.

---

## 14. Dated additive note — the PA rendered decisions 5, 6 and 7 (`2026-11-05`)

> **Additive. §§1–13 above are preserved and are NOT rewritten**, including every recommendation, every
> consequence table and §13's statement of limits. §11's decision record is the one part updated, because
> updating it is what the PA directed and what a decision record is for; the superseded proposed values
> are **struck through rather than deleted**, so the earlier state remains legible.

### 14.1 What the PA decided

| Decision | Marking | Effect |
| :--- | :--- | :--- |
| **5** — owner identity | **APPROVED AS AMENDED** | `SAIRAM` adopted as the **permanent personal owner identity label**; **one stable, application-generated canonical owner ID** as the key; ownership resolved **through the trusted application context**; **no multi-tenant or enterprise identity infrastructure**; the name grants **no other person** access or ownership authority |
| **6** — evidence retention | **APPROVED AS AMENDED** | **Indefinite** retention until **explicit deletion by the application owner**; **no** automatic expiry, deletion, purge or destructive compaction; integrity, import history and audit metadata preserved; **storage-usage visibility** and **backup/recovery safeguards** required; **50 MB is a warning/review threshold only** |
| **7** — reference number | **APPROVED** | Act ID to be **assigned from the existing convention**, collision-checked first, **neither invented nor reused** |
| **1, 2, 3, 4** | **NOT RENDERED — STILL PENDING** | The four Gate 4 decisions remain open. **Arena has not treated them as approved.** |

**Application context given by the PA, binding on every clause:** personal, single-user application; no
production deployment or multi-tenant concept; the personal application principal remains owned by Ramki;
no second-user access or shared-account authorization is implied.

### 14.2 What was produced, and what it does not claim

**Instrument of record:**
`docs/integration/IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md`,
Act ID **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`**. It reconciles the three
decisions against the published A-8 proposal and existing U1 / DEC-06 authority, fills all three
placeholder sets, removes the multi-tenant and production assumptions clause by clause, and preserves every
existing boundary.

| | |
| :--- | :--- |
| **Status** | **RENDERED — EFFECTIVENESS CONDITIONAL — PUBLICATION VERIFICATION PENDING — NOT YET EFFECTIVE** |
| **Why not effective yet** | The permission's own clause 25 makes effectiveness **conjunctive**: the PA's adopting act *(discharged)* **plus** publication to the authoritative branch **plus** green checks at the exact revision **and** after the merge **plus** independent remote read-back. The last three are **ordinary publication steps, pending**. A receipt cannot be part of the change it verifies, so they are discharged by a **follow-up** record. |
| **Implementation** | **NOT AUTHORIZED and NOT PERFORMED.** No address, handler, carrier file, test or configuration was created. The retrieval route is **not implemented.** |
| **Blocker `WS-A-EV-ROUTE-1`** | **Remains OPEN** until effectiveness is recorded. |

### 14.3 Three genuine remaining items — reported precisely, none of them reopening 5, 6 or 7

**(1) The deletion surface — a PA decision is needed if deletion is to exist inside the product.**
Decision 6 requires explicit owner-controlled deletion; the permission keeps the web address **read-only**
and admits **no delete operation anywhere**. Both are preserved: deletion is authorized **in principle**
and is exercisable **outside** the web surface — an explicit owner action on the local data folder, written
into the runbook. **Making deletion available on a screen or address would need a further decision.** Arena
has **not** assumed one and has **not** admitted one.

**(2) Decision 6 widened the eventual work.** Storage-usage visibility and backup/recovery safeguards are
**new obligations** the original proposal did not contain, and they **cannot** be met by adding a new
address, because the permission forbids any enumeration or collection endpoint. They must be met through
the responses that already exist, server-side logging and written procedures. **This is a technical
constraint, not a PA decision** — but the PA should know that completing the retrieval work now includes
both obligations plus the consent-wording reconciliation.

**(3) "Bind personal holdings" reaches further than this permission does.** Decision 5 asks that personal
holdings *and* associated evidence be bound to this owner. The instrument gives effect to that **for the
broker-import evidence journal**, which is what A-8 concerns. **Durable holdings are a different, fenced
domain** — the safety catch is on, writes are refused, and nothing is saved. **Extending the new owner ID
to durable holdings is not authorized by this instrument** and would need its own decision. **Reported, not
assumed.**

### 14.4 One change of fact the PA should know before signing decisions 1–4

**A separate, independently authorized change landed while this work was in progress.** The
broker-compatibility version in use advanced from **`7bcae35`** to **`07e86a4f`** (the other repository's
PR #128, merged into this repository by PR #446 at `2026-11-05T13:35:06Z`).

**Consequence for Decision 3:** its *substance* is unchanged — ratify the compatibility copy at whatever
coordinate is live and authorized, moving nothing — but **the coordinate named in §6 and in the appendix is
now `07e86a4f`, not `7bcae35`.** **It must be re-checked immediately before the PA signs.** Decision 1 is
likewise unaffected in substance, but its required statement that the Gate 4 version is *not* the
broker-import version now refers to `07e86a4f`.

**Arena has not rewritten §6, §5 or the appendix to reflect this**, because they record a state that was
true when written. The correction is recorded **here** and in the instrument's §11(4).

### 14.5 Boundaries confirmed unchanged by this rendering

The software version in use is **unchanged by this instrument**; Gate 4's permitted scope is **not
widened**; Gate 5 is **not initiated**; the write safety catch is **still on** — writes and context
discovery are still refused even with the binding asserted; and **real-user saving is not authorized, not
implied and not advanced**. The other repository received **zero writes**. The permission document that
this instrument amends was **not modified at all** — its fingerprint is asserted unchanged, for a concrete
reason: that fingerprint is a published anchor inside three existing records, and appending to the file
would have invalidated them. **The amendment is therefore a separate document that governs how the
existing permission applies, leaving the original byte-for-byte intact.**

**Workstream A and milestone WS-A-DM remain NOT COMPLETE.**
