# SAIRAM durable holdings — investigation publication receipt

Date: 2026-11-06. **Investigation and decision preparation PUBLISHED; proposed PA decisions NOT RENDERED;
implementation/identity migration/holdings writes NOT AUTHORIZED by this receipt. W-1 UNCHANGED.**

## Publication coordinates

| Item | Verified coordinate |
|---|---|
| Starting IRR main | `2a55110806599084355b299fb3e0a559471f0c48` |
| User-named IPD main | `ramkivs/ipo-screening-engine` `d661b5ee99a782566fedcb9aa2b139e756948d27` |
| Read-only G-2-cited portfolio main | `ramkivs/iips-production-market-data` `07e86a4f2c105651f3097a96cb519f8611945e30` |
| Findings/proposal PR | [#468](https://github.com/ramkivs/iips-review-recovered/pull/468) |
| Exact accepted head | `635a8e838dc4d6547c64afb65a48f4748bde6666` |
| Main immediately before merge | `95b95cfe04bbb7f6be200bacce38efc804ace278` |
| Findings/proposal merge | `d37ac14e3e09009223de92f436c3dafbde27568f` |
| Head static CI | [42099000839](https://github.com/ramkivs/iips-review-recovered/actions/runs/42099000839), SUCCESS |
| Merged-main static CI | [42099203142](https://github.com/ramkivs/iips-review-recovered/actions/runs/42099203142), SUCCESS |

## Independent verification and concurrent-work reconciliation

GitHub API recursive trees and decoded blob reads match all **10 changed findings/proposal paths**
byte-for-byte at exact head and merged main. The head preserves all prior blobs except two append-only
tracker/R2 overlays. The merged result preserves all blobs of its **actual first parent** except those
same two append-only overlays. JSON records exact counts, SHA-256 values and comparison commits.

The first attempted merged proof against the original start correctly failed: concurrent IID PRs
#464/#467 had changed unrelated files on main. The task did not make those changes. We identified
`95b95cfe` as the actual first parent, preserved the concurrent work and compared against it, rather
than falsely declaring the original entire source tree unchanged or reverting anyone else's work.
Separately, all original broker-import/evidence, user-portfolio/W-1, PF-1 and user-portfolio transport
files remain byte-identical to the original `2a551108` baseline. Full source/evidence scope and the
concurrent changes are recorded under `evidence/integration/sairam-holdings-readiness-2026-11-06/`.

Local Python static validation, immutable API blob/SHA-256 checks and whitespace pass. Applicable CI
also runs the existing seven classifier regressions, full CAP-03 validation, release audit and
whitespace. No product source changed in this task; no retention/deletion runtime tests or the prior
1,512-test regression were repeated. H01–H12 holdings acceptance is a **future test plan, not executed**.

## Findings and proposal status

- Architecture/readiness report and exact decision package are the two `SAIRAM-DURABLE-HOLDINGS-*`
  documents dated 2026-11-06, tracker §16.260, R2 §23.
- Repository identity conflict is evidenced, **not silently resolved**. The named Python IPO engine
  and the cited IPD portfolio repository have different GitHub IDs and purposes. Both were inspected;
  no IPD repository was mutated and no IPD PR was opened in an undesignated owner repository.
- Recommend the simplest personal local IPD SQLite/OS-IPC reuse, not a new technology or IRR store.
  Distinguish historical G24 driver/HTTP details from current node:sqlite/local-binding implementation.
- Canonical target `owner-4dc756b3` and display-only SAIRAM do not override the current IPD binding
  constants or the evidence act's explicit exclusion of holdings identity extension. D02 requires a
  separate governed owner extension/inventory/migration disposition; no automatic transfer.
- Four-revision cap, create duplication after unknown outcome, adapter success/non-empty contribution
  projection gaps and separate trade/cash-ledger scope are explicitly identified. Existing database
  transactions are not accounting transactions. W-1 is hard-false in the inspected current source.
- D01–D06 are proposed choices/required acts, not new PA decisions or Act IDs. Existing G-2 direction,
  W-1, qualification/result acceptance/admission, PIT/reference separation and frozen instruments stand.

**No holdings writes enabled, owner data accessed, database opened/provisioned/migrated/restored,
IPD source changed, production activity performed or WS-A-DM completion declared.**
The receipt's own final CI/merge and independent remote readback are recorded in its publishing PR,
not self-invented inside this file. Publication closes only the authorized investigation task.
