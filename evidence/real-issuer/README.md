# `evidence/real-issuer/` — real-issuer validation evidence index

**Status:** IIPS v3.0 Work Item 1 — Real-Issuer Validation and Investment Coverage Expansion (IRR, local, single-user,
non-production). One representative real Indian listed non-financial issuer has been taken through the existing
IID-0 → IID-3 path. **This is not production acceptance, not sector expansion and not a coverage claim.** No
limitation in `L-001` … `L-029` was closed; see register §13.

| Bundle | Issuer | Sector | Disposition | Evidence |
|---|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06/` | Infosys Limited (`IN:CIN:L85110KA1981PLC013115`) | Technology (already measured) | **VALIDATED WITH QUALIFICATIONS** | `README.md` (full report), `digests.json`, `runs/`, `dataset{,-v1}/`, `artifact/` |
| `D2-NIL-BY-DISCLOSURE-2026-11-06/` | Infosys (same input, unchanged) | Technology | defect **D-2 corrected** — representation only | `README.md`, `withdrawn/` (the unsupported nil declaration, kept inspectable) |
| `D2-POST-MERGE-REGRESSION-2026-11-06/` | Infosys (same input, unchanged) | Technology | regression after the D-2 merge (`b3987ef`) | `README.md`, `runs/` |
| `D3-RISK-REASON-SEMANTICS-2026-11-06/` | Infosys (same input, unchanged) | Technology | defect **D-3 corrected** — reporting only | `README.md`, `runs/` |
| `WI2-PRICE-OBSERVATION-2026-11-06/` | Infosys (same input **plus one BSE close**) | Technology | Work Item 2 — **price accepted, valuation still withheld** | `README.md`, `source/`, `dataset/`, `artifact/`, `runs/`, `digests.json` |

The disposition word matters:

- **VALIDATED** — identity resolution, ingestion of the filed disclosures, canonical mapping, the unchanged
  derivation set, assessment, composition, persistence, versioning and a separate-process chain read all executed on
  real audited numbers, with zero ingestion errors and payload digests independently recomputable from committed files.
- **WITH QUALIFICATIONS** — the engine declined to value, grade or rate the company, and the reasons are recorded
  rather than papered over: the FY24 consolidated statements present no borrowings line at all, so gross and net debt
  are `NOT_REPORTED` and the enterprise-to-equity bridge is blocked; no market price was ingested **in this
  bundle** (Work Item 2, `WI2-PRICE-OBSERVATION-2026-11-06/`, later added one BSE end-of-day close — the price is
  now accepted and the margin of safety is still withheld, on the intrinsic rather than on the price); and no Ind
  AS XBRL instance was reachable to exercise the tag-map path. The bundle states each of these with its consequence; it does
  not claim a verdict it did not produce. The nil-by-disclosure reading this paragraph originally carried was
  withdrawn when the filing was re-read (`D2-NIL-BY-DISCLOSURE-…/withdrawn/WHY-WITHDRAWN.md`): the statements declare
  no such nil, so the components are `NOT_REPORTED`.

**Two product defects recorded in this directory have since been corrected**, in work items of their own:
D-2 (`D2-NIL-BY-DISCLOSURE-…`) gave a declared nil its own representation, and D-3
(`D3-RISK-REASON-SEMANTICS-…`) stopped the risk aggregate from describing evaluated-and-passed dimensions as
unavailable. Neither correction changed what this issuer's evidence says: the debt position is still blocked, and its
risk evaluation is still partial. No limitation in `L-001` … `L-029` was closed by either.

**Evidence hygiene.** Every figure traces to a printed page of the issuer's own filing, transcribed into
`REL-1-…/ingest-input/periods.csv`, which is committed so a reader can check the numbers against the source instead
of trusting prose. `digests.json` pins the bytes. Where the product stopped, the bundle says *why* and separates a
data gap (no price, no XBRL instance) from a product defect (D-2, D-3) from a correct refusal (staleness, dilution
proxy, single-method intrinsic).

**Work Item 2 adds one bundle and changes none of the above.** `WI2-PRICE-OBSERVATION-2026-11-06/` takes the same
roster and the same three filed periods, adds one BSE end-of-day close (ISIN `INE009A01021`, 2026-11-06,
₹1,180.65), and records the payload that results: the price is `PRESENT` and the margin-of-safety refusal moves
from `NO_PRICE_OBSERVATION` to `INTRINSIC_WITHHELD`, because the borrower's debt position is still unreported.
It closes no register entry and re-statuses none; the limitations it exposes are `L-030` … `L-033` (register §16).
The Work Item 1 / D-2 / D-3 bundles are byte-identical to their state on `main` @ `41c4498`.

**No investment conclusion is stated anywhere in this directory.**
