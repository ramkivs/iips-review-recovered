# IPD prompt — IPD-S1: pointer correction of determination §12.2 (act row S1 governs)

**Target repository:** `ramkivs/iips-production-market-data` (IPD). **Not executed from IRR.**
**Trigger:** PA ruling A-GAP1 = act §6 row S1 governs (recorded in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §1).
**Reason:** determination §12.2 states that 12/12 designated blobs resolve as designated. Act §2.1 does not reproduce that claim for items 10 and 12 at IPD `1ba0740a`. The ruling makes act §6 row S1 the governing text.

## Action

Add a dated pointer under determination §12.2 stating that act §6 row S1 governs S1, and that the 12/12 statement does not reproduce for items 10 and 12. **Do not rewrite §12.2 in place.** Do not alter the designated values in act §2.1 in this prompt (those are handled by IPD-P-A-Q5).

## Prerequisites

- IPD authority for a documentation pointer is held separately. Confirm before writing.
- The A-Q5 IPD act is executed, or this pointer explicitly defers to it.

## Expected evidence

- IPD commit and tree hashes; exact-head CI; remote read-back of the pointer text.
- The pointer text quoted verbatim in the return message.
