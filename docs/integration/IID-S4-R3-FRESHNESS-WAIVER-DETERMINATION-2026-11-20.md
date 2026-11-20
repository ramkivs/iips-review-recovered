# IID S4-R3 — Freshness Waiver Determination (O3-ADM-2026-Q4)

**Instrument:** Operator governance determination adopting, with corrections, the Governance & O3
Admission Waiver Memorandum of 2026-11-20 (tracking ref `O3-ADM-2026-Q4`; memorandum text reproduced
in Annex A).
**Decision owner / operator:** Ramki (sole decision owner), adopting the memorandum 2026-11-20.
**Assessment baseline:** 2026-11-19 (candidate `sha256:3e42d98dad57de69ae4dba6f88c588da9114e6e829b21a811d35270b2c2de16a`, register §17.39–§17.41).
**Application:** IIPS v3.0 — Local / Single User / Personal Use. Production **OUT OF SCOPE**.
**Repository:** `ramkivs/iips-review-recovered`, branch `arena/fe76d26e-iips-review-recovered`.

> **Nature of this record.** This determination governs ticket and limitation *disposition* only.
> It changes no code, no policy constant, no freshness measurement and no dataset. The engine
> continues to compute and report `STALE` / `STALE_STATEMENTS` exactly as before; the waiver records
> that, for governance purposes, the FY2026 annual anchor is accepted as the latest legally
> publishable annual for the three named issuers until the waiver expires.

---

## 1. Action 1 — O3 successor admission and `S4-R3-Infosys` closure: ratified (already discharged)

The memorandum's first action was **already implemented and published on 2026-11-19**, before this
determination:

| Item | Published record |
|---|---|
| Infosys FY2025/FY2026 ingestion + O3 successor admission | Commit `0f4268fa56e40276d46f78b1254253530b850f19`; `IID-O3-S4-R3-INFOSYS-SUCCESSOR-ADMISSION-2026-11-19.md`; register §17.40 |
| Marico Q1/Q2 FY2027 ingestion + O3 successor admission | Commit `340afb2c6361532a11829f571d81617d4201fe9e`; `IID-O3-S4-R3-Marico-QUARTERLY-SUCCESSOR-ADMISSION-2026-11-19.md`; register §17.41 |
| `S4-R3-Infosys` disposition | **RESOLVED (2026-11-19, §17.40)** on the data-ingestion / O3-admission limb |

This determination **ratifies** those records and adopts the memorandum's wording: `S4-R3-Infosys` is
**CLOSED**, recorded strictly against Infosys Limited's FY2025–FY2026 ingestion and O3 admission,
decoupled from Marico and KEC. No new ingestion was required or performed for this action.

## 2. Action 2 — Conditional 200-day annual freshness waiver: GRANTED (governance level)

**Determination.** A conditional freshness waiver is granted for **Infosys Limited, Marico Limited
and KEC International Limited** on the FY2026 annual anchor (period end 2026-03-31) **through
31 May 2027**, on the root cause the memorandum states and the evidence confirms: under the mandatory
1 April–31 March Indian financial year, no newer annual filing can legally exist for any of the three
issuers until the FY2027 results season (April–May 2027). The 233-day age at the 2026-11-19 baseline
is therefore a structural calendar artefact, not a data-collection defect.

**Exact scope and conditions:**

1. **What is waived:** only the governance consequence of the 200-day annual rule for these three
   issuers' FY2026 anchor — i.e. the open-limitation/ticket block recorded as `L-043` / `S4-R3`.
2. **What is not changed:** `freshness-policy/1.0.0` (200/250-day windows), `mos-policy/1.1.0`, the
   assessment clock basis, accepted period definitions, basis precedence, TTM construction, and every
   engine output. Assessments continue to raise `STALE_STATEMENTS` and report 233-day staleness;
   any consumer of an assessment still sees the measured stale basis. The waiver must not be cited
   as making any issuer's data FRESH.
3. **Conditions:** (a) quarterly ingestion continuity is maintained — Marico and KEC Q3 FY2027
   (due February 2027) to be ingested and O3 successor-admitted on the established pattern;
   (b) FY2027 audited annuals to be ingested promptly in the April–May 2027 results season;
   (c) the waiver **expires automatically on 31 May 2027**; if by then an FY2027 annual has not been
   admitted for an issuer, `L-043` reopens for that issuer without further decision.
4. **Infosys condition note (corrected basis):** Infosys has **no admitted quarterly series** (see
   §4), so for Infosys the waiver rests solely on the latest-legally-publishable-annual ground in
   this section, not on quarterly continuity. Condition (a) applies to Marico and KEC; for Infosys,
   conditions (b)–(c) apply and any future Infosys quarter ingested takes the same successor pattern.

**Effect on dispositions (recorded in register §17.42):**

- `S4-R3`: **CLOSED BY CONDITIONAL GOVERNANCE WAIVER (2026-11-20)** — closed by the explicit owner
  policy decision the earlier records reserved ("or an owner policy decision"), **not** by
  satisfaction of the freshness limb, which remains unmet as measured. Conditional until 31 May 2027.
- `L-043`: **CLOSED BY CONDITIONAL WAIVER** on the same terms; auto-reopens per condition (c).
- `S4-R3-Infosys`: **CLOSED** (§1; already RESOLVED at §17.40).

## 3. TTM fallback alternative: NOT authorised

The memorandum's alternative — Q2 FY2027 TTM fallback valuation — is **declined on the evidence**
and is not authorised as an engine or policy change:

- TTM construction requires **four DISCRETE quarters** (`periods.ts buildTtm`). Holdings: Marico 2,
  KEC 2, Infosys 0. No TTM basis exists for any of the three issuers; constructing one from two
  quarters would fabricate the missing half-year.
- Basis precedence selects **ANNUAL whenever an annual period exists** (`freshness.ts`), so a TTM
  basis would not displace FY2026 in any case.
- The waiver in §2 is therefore the sole operative instrument. If a future quarter completes a
  four-quarter DISCRETE window for an issuer, TTM availability will be measured and recorded then;
  nothing is pre-authorised.

## 4. Claim-by-claim reconciliation of the memorandum against repository evidence

The memorandum is adopted **as corrected by this table**. Where the memorandum and the committed
evidence differ, the committed evidence governs:

| Memorandum claim | Repository position (governing) |
|---|---|
| Infosys Q1 FY2027 & Q2 FY2027 quarters "available for TTM continuity" (Q2 filed 23 Oct 2026) | **Not supported.** Infosys has **zero** admitted quarterly periods; no Infosys quarterly filing, transcription or admission exists in the repository. No reliance is placed on these quarters anywhere in this determination. |
| Marico and KEC "Fully TTM-ready" | **Incorrect.** Each holds **2** DISCRETE quarters; TTM requires 4 (§3). |
| Usage rights "Confirmed unrestricted for internal quantitative analysis, security master maintenance, and valuation modeling" | **Corrected.** O3 terms govern: **local personal use only, single user, no redistribution** of source bundles/datasets/derived contents, no claim of independent legal verification of source licensing. Nothing in this determination widens usage rights. |
| Records "verified against each issuer's official Investor Relations archive"; audit/review opinions "verified" | **Corrected.** The FY2025/FY2026 Infosys and Q1/Q2 Marico figures are **operator-supplied/operator-declared** payloads; the records state independent PDF/XBRL-to-transcription verification **NOT_CLAIMED** (Infosys auditor Deloitte Haskins & Sells LLP, Marico reviewer B S R & Co. LLP, as operator-declared). |
| KEC ISIN `INE389H01022`, NSE `KEC`, BSE `532714` | ISIN and NSE symbol **match** the admitted roster. The admitted KEC roster carries the **NSE listing only**; BSE `532714` is not part of the admitted security-master record relied on here. |
| Marico/KEC FY2026 filed 2026-05-05 / 2026-05-16; quarters filed 2026-08-04 / 2026-11-02; ages 233 / 50 days; 200-day cutoff 2026-05-03 | **Confirmed** against the admitted inputs and the 2026-11-19 measurement (register §17.39–§17.41). |
| Infosys pre-remediation 963-day FY2024 lag; ticket open | **Confirmed** (historical, §17.39); discharged 2026-11-19 (§17.40). |

## 5. Boundaries

No engine, policy, schema, tag-map or calendar change; no dataset rebuild or installation; no host
or production change; no IPD file touched; no pull request merged. Capability delivery, data supply,
candidate verification, installation/live verification and acceptance remain distinct: this
determination records a **governance disposition** and nothing more. Prior records (§17.39–§17.41,
both 2026-11-19 O3 successor records, the 2026-11-19 freshness evidence) are preserved unmodified;
their "S4-R3 remains OPEN" statements are historical as of their dates and are superseded as
disposition only by §2 of this determination and register §17.42.

---

## Annex A — Memorandum as received (2026-11-20, `O3-ADM-2026-Q4`)

> **TO:** Data Governance & Valuation Committee (O3 Admission Review)
> **FROM:** Financial Data Engineering & Security Master Operations
> **DATE:** 20 November 2026 (Assessment Baseline: 19 November 2026)
> **SUBJECT:** O3 Successor Admission & Structural 200-Day Annual Freshness Waiver — Infosys Limited, Marico Limited, and KEC International Limited
> **TRACKING REFS:** `S4-R3-Infosys` | `O3-ADM-2026-Q4`
>
> **1. Executive Summary & Action Requested.** (1) Formally admit audited consolidated annual filings
> for Infosys Limited (FY2025, ended 31 March 2025; FY2026, ended 31 March 2026) and reviewed
> quarterly filings for Marico Limited (Q1 FY2027 and Q2 FY2027) under SEBI (LODR) Regulation 33
> statutory permissions, closing open remediation ticket S4-R3-Infosys independently.
> (2) Grant a standing calendar-alignment waiver (or authorize Q2 FY2027 Trailing Twelve Months
> [TTM] fallback valuation) for Infosys Limited, Marico Limited, and KEC International Limited.
> Under Indian statutory reporting cycles, no newer annual filing can exist for any of the three
> issuers until April/May 2027.
>
> **2. Root-Cause Analysis.** All three issuers operate on a mandatory 1 April–31 March financial
> year (Companies Act, 2013 s.2(41)); FY2026 closed 31 March 2026 and FY2027 closes 31 March 2027
> (audited results within 60 days, April–May 2027). Assessment date 19 November 2026; 200-day cutoff
> threshold: annual period-end on or after 3 May 2026; actual elapsed: 233 days. A strict mechanical
> application flags 100% of Indian March-year-end issuers STALE for ~6.5 months every year
> (18 October–late April/May) even when the dataset holds the latest legally published annual.
>
> **3. Issuer matrix.** Infosys (INE009A01021; INFY/500209): pre-state FY2024 963 days, 0 quarters,
> ticket open; admitted FY2025 (filed 17 Apr 2025) & FY2026 (filed 23 Apr 2026), Deloitte Haskins &
> Sells LLP unmodified; FY2026 age 233 days (latest possible); memo asserts Q1/Q2 FY2027 quarters
> available. Marico (INE196A01026; MARICO/531642): FY2026 admitted 233 days, 0 quarters pre-state;
> Q1 FY2027 (filed 4 Aug 2026) & Q2 FY2027 (filed 2 Nov 2026) admitted, B S R & Co. LLP unmodified,
> H1 FY2027 reconciled; complete through Q2 FY2027 (50 days); memo asserts fully TTM-ready. KEC
> (INE389H01022; KEC/532714): FY2026 + Q2 FY2027 already verified, zero gaps; memo asserts fully
> TTM-ready. Dispositions requested: close S4-R3-Infosys; apply waiver / authorize TTM until
> April–May 2027.
>
> **4. Permissions & attestation.** Records sourced from SEBI (LODR) Reg. 33 filings on BSE/NSE
> portals, per the memo verified against issuer IR archives; memo asserts unrestricted internal
> usage rights and unmodified audit/limited-review opinions throughout; S4-R3-Infosys isolation
> from Marico/KEC asserted. *(Adopted as corrected by §4 of this determination.)*
>
> **5. Recommended Policy Determination.** (1) Approve O3 successor admission for Infosys
> (FY2025, FY2026) and Marico (Q1 FY2027, Q2 FY2027); mark S4-R3-Infosys = CLOSED.
> (2) Grant conditional freshness waiver through 31 May 2027 for Infosys, Marico and KEC
> International on the FY2026 annual anchor, contingent upon maintaining uninterrupted quarterly
> ingestion (Q2 FY2027 active; Q3 FY2027 due February 2027) and utilizing Q2 FY2027 TTM multiples
> where an active valuation basis is required. *(TTM utilisation not authorised — §3 of this
> determination.)*
