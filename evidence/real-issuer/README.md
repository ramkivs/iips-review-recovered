# `evidence/real-issuer/` — real-issuer validation evidence index

**Status:** IIPS v3.0 Work Item 1 — Real-Issuer Validation and Investment Coverage Expansion (IRR, local, single-user,
non-production). One representative real Indian listed non-financial issuer has been taken through the existing
IID-0 → IID-3 path. **This is not production acceptance, not sector expansion and not a coverage claim.** No
limitation in `L-001` … `L-029` was closed; see register §13.

| Bundle | Issuer | Sector | Disposition | Evidence |
|---|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06/` | Infosys Limited (`IN:CIN:L85110KA1981PLC013115`) | Technology (already measured) | **VALIDATED WITH QUALIFICATIONS** | `README.md` (full report), `digests.json`, `runs/`, `dataset{,-v1}/`, `artifact/` |

The disposition word matters:

- **VALIDATED** — identity resolution, ingestion of the filed disclosures, canonical mapping, the unchanged
  derivation set, assessment, composition, persistence, versioning and a separate-process chain read all executed on
  real audited numbers, with zero ingestion errors and payload digests independently recomputable from committed files.
- **WITH QUALIFICATIONS** — the engine declined to value, grade or rate the company, and the reasons are recorded
  rather than papered over: two nil-by-disclosure borrowings lines block the enterprise-to-equity bridge (defect
  D-2), no market price was ingested, and no Ind AS XBRL instance was reachable to exercise the tag-map path. The
  bundle states each of these with its consequence; it does not claim a verdict it did not produce.

**Evidence hygiene.** Every figure traces to a printed page of the issuer's own filing, transcribed into
`REL-1-…/ingest-input/periods.csv`, which is committed so a reader can check the numbers against the source instead
of trusting prose. `digests.json` pins the bytes. Where the product stopped, the bundle says *why* and separates a
data gap (no price, no XBRL instance) from a product defect (D-2, D-3) from a correct refusal (staleness, dilution
proxy, single-method intrinsic).

**No investment conclusion is stated anywhere in this directory.**
