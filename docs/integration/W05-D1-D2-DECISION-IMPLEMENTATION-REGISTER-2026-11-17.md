# W05 D1/D2 — decision and implementation register addendum

**Date:** 2026-11-17 (UTC)
**Scope:** W05 statement-source selection (D1), repository visibility/public reproduction (D2), and current publication-surface verification.
**Authority:** Principal’s direct instruction in this work item, read with existing `PA-01` (2026-11-15), the W05 source-rights/exposure assessment (2026-11-17), its authorization reference, and the prior decision/implementation receipt at master tracker §16.290. This addendum records the current decision wording and checks; it creates no broader rights, issuer admission, dataset installation, or W05 acceptance.

## Decisions

| Decision | State | Operative wording and scope |
|---|---|---|
| **D1 — issuer filing source** | **CONFIRMED; implementation rule recorded** | Use issuer financial filings obtained manually from official exchange or issuer sources. Retain downloaded source documents locally for personal investment analysis. No scripted or automated retrieval. For each issuer evidence package record the source and locator, document identity and period, filing/approval date where stated, actual manual retrieval date/channel, byte length, PDF page count and SHA-256. Distinguish document/filing date from retrieval date. |
| **D2 — public reproduction** | **DECIDED: IRR private; implemented and reverified** | The IRR repository is to remain private to prevent public access to third-party filing material. Repository visibility is verified private on GitHub. No source document, page text, derived financial finding, or dataset is authorized for public redistribution. Private visibility does not recall copies made while the repository was public or determine third-party rights. |
| **D3 — retrieval automation** | **MANUAL ONLY; no automation authorized** | This preserves the prior D3 disposition and the current instruction: no scripted or automated retrieval. |

The D1 wording is consistent with the prior D1 selection at §16.290 and clarifies “official exchange or issuer sources” and the package-level metadata to retain. The D2 disposition is the one already recorded at §16.290; the current instruction reaffirms it. The repository was already private when checked in this pass, so no redundant visibility change was attempted.

## Applying D1 to the AGI source package

The dedicated source branch is `w05/agi-ine415a01038-source-filings` at commit `da5e40c0f1b43bac774905eb9db36a9f4ce79045`. It contains `evidence/real-issuer/AGI/INE415A01038/INE415A01038.zip`, SHA-256 `05be52759ca5484fc49de2207ae8f90b7f0f1334bef7f6af20daa6ecd679fc32`. The authenticated Git read-back matched that digest. The ZIP contains exactly five PDFs and no accompanying manifest, original-source URL, retrieval log or rights metadata.

The metadata-only file [`agi-source-package-inventory.tsv`](../../evidence/integration/w05-d1-d2-decision-implementation-2026-11-17/agi-source-package-inventory.tsv) records each PDF's filename, reporting period, page count, byte length and SHA-256. It records source URL and retrieval date/channel as **NOT RECORDED IN ZIP**. The archive member timestamps are package timestamps, not proof of source retrieval. The repository branch/path is a storage locator, not proof that an individual PDF was downloaded from NSE, BSE or the issuer's own site. Therefore this source package does **not** yet meet D1’s originating-source/retrieval-provenance fields. Do not invent or infer them; capture them when the Principal obtains/re-obtains the source manually.

The AGI financial assessment is a **local working paper only**: [`local-work/AGI-Greenpac-financial-assessment-2026-11-17.md`](../../local-work/AGI-Greenpac-financial-assessment-2026-11-17.md). It is untracked and intentionally omitted from the commit and remote repository. This register contains no derived financial findings. The metadata-only inventory and repository visibility facts do not admit AGI or authorize redistribution.

## D2 implementation and remaining repository publication surfaces

At `2026-11-17T17:16:43Z`, GitHub’s authenticated repository API reported `private: true`, `visibility: private`, default branch `main`; the session had `ADMIN` permission. The repository was already private; no setting change, content deletion, branch deletion or asset removal was performed.

The source ZIP remains on its dedicated branch in the now-private repository. Authenticated read-back verified branch commit and ZIP SHA-256. Anonymous requests to the repository web URL, the AGI source-branch tree URL and a GitHub release-asset URL returned HTTP 404. An anonymous request to `raw.githubusercontent.com` could not be tested because the sandbox’s TLS connection failed; no status is claimed for that host.

| Surface checked | Current state observed |
|---|---|
| GitHub Releases | Two releases remain: `cap03-s2-recovery-20261031-212225` (pre-release, four assets) and `program-v1.2.0` (zero assets). They are under the private repository; the tested anonymous recovery-asset URL returned 404. No asset was removed. |
| Actions artifacts | API reported zero artifacts. |
| Forks | API reported zero forks. |
| GitHub Pages | Repository metadata reports `has_pages=false`; Pages endpoint itself returned 403 to this integration, so the metadata is the basis for this statement. |
| Wiki, Discussions, Downloads | Repository metadata reports disabled. |
| Packages | Packages endpoint returned 404; no package was listed. |
| Branches / source ZIP | The AGI branch and ZIP remain present, authenticated and private; no source-file content was copied into this addendum or the new evidence folder. |

The private CAP-03 release with four assets is a remaining **private** publication surface; this pass verified its current anonymous inaccessibility but did not download, remove or classify each asset’s contents. Private visibility prevents current anonymous access to the checked GitHub surfaces. It does not undo the period when the repository was public, recall prior downloads, clear external caches/forks, or establish that no copy exists elsewhere. The prior assessment records that historical limit; no claim of recall is made here.

## Protected statuses and exclusions

- W05: **IN PROGRESS — NOT COMPLETE — NOT ACCEPTED**.
- `L-041`: **OPEN**; `L-042`: **OPEN**.
- Q1–Q7: **OPEN**.
- Existing `O3` admissions remain limited to Infosys, Marico and KEC. AGI is **not admitted**.
- No redistribution authorization is granted; no financial assessment findings are published; no dataset is installed.
- The existing source ZIP branch is not altered. No source PDF, page text, dataset or new issuer material is added to this branch.

## Evidence and validation

- `evidence/integration/w05-d1-d2-decision-implementation-2026-11-17/publication-surface-audit.json` — authenticated visibility, anonymous HTTP observations, releases/artifacts/forks/Pages/wiki/discussions/downloads/packages, and AGI source-branch ZIP identity.
- `evidence/integration/w05-d1-d2-decision-implementation-2026-11-17/agi-source-package-inventory.tsv` — metadata-only five-document inventory, including explicit missing provenance fields.
- `evidence/integration/w05-d1-d2-decision-implementation-2026-11-17/validate.py` — offline digest, decision-wording, identifier and protected-status checks.
- The canonical tracker records this addendum as §16.292, `CV-CORR-257`, `CHG-2026-11-06-20`, verification identifiers `V2156`–`V2160`.

No public access is claimed for the private repository’s checked GitHub surfaces. No attempt was made to remove historical public material, delete Git history, relocate the ZIP, or grant any third party access.
