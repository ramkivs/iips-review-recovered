# Withdrawn D-2 evidence — why these files must not be used

These three files were part of the first revision of the D-2 bundle (commit `e869e81`, PR #487). They are kept only
so the correction stays inspectable; **they are not evidence and must not be cited.**

| File | What it was | Why it is withdrawn |
| --- | --- | --- |
| `periods-nil-declared-UNSUPPORTED.csv` | the Work Item 1 facts with four columns declaring `NIL: no such line is presented in the consolidated balance sheet` | the wording is an **operator inference from an omitted line**, not a statement in the filing. The FY24 consolidated balance sheet (page 1) presents no borrowings row, and the notes contain no borrowings note; nothing in the document says the item is nil |
| `reassessment-summary-UNSUPPORTED.json` | gross debt `PRESENT` ₹8,359 cr, net debt −₹19,342 cr, `DCF_FCFF` ₹990.75, intrinsic mid ₹1,088.97, moat `NARROW`, confidence 0.6736 | every one of those figures depends on the unsupported declaration above. It is arithmetic about an assumption, not about the company |
| `cli-dry-run-UNSUPPORTED.txt` | dry-run artifact, `payloadDigest 71b0d1f9c981…` | same dependency; and it is the only place a digest appears that does not match the merged Work Item 1 artifact |

## What replaced them

- `../input/periods.csv` is now a **byte-identical copy** of the Work Item 1 input
  (`sha256:e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c`), with no nil declaration at all.
- `../runs/outcome-on-filing-evidence.json` is the measurement on that input: the three borrowings components and
  `preferenceCapital` are `MISSING` / `NOT_REPORTED`, gross and net debt stay blocked, `intrinsic` stays `null`,
  confidence stays 0.4939, and the dataset version is the untouched `sha256:ca29c835…`. The composed artifact's
  payload digest is `cc91f239197a…` — identical to the merged Work Item 1 artifact.
- `../runs/bare-nil-attempt.json` records the attempt to obtain those declarations without quoting the filing: the
  ingestion refuses all 12 cells with `NIL_WITHOUT_QUOTED_WORDING` and the CLI writes nothing.

## The rule this produced

A declared nil must quote the source's own wording (`NilDisclosureContext.statement`, required; INV-7 checks it, and
`NIL_WITHOUT_QUOTED_WORDING` refuses the operator path). An omitted line has no wording to quote, so it is
`NOT_REPORTED` — never a nil, and never a zero.
