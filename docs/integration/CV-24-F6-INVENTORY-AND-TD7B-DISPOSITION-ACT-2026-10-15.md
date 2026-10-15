# CV-24 — F6 Inventory and TD-7b Disposition Act

**Artifact ID:** `CV-24-F6-INVENTORY-AND-TD7B-DISPOSITION-ACT-01`
**Date:** `2026-10-15` (Asia/Kolkata)
**Authority:** Ramki / Program Authority (supplied via the CV-53 + CV-24 execution mandate)
**Recording agent:** Arena Agent Mode — recording and publication only; no independent authority rendered
**Repository / ref:** `ramkivs/iips-review-recovered` @ `refs/heads/main`
**Status:** DECIDED AND RECORDED; DURABLE PUBLICATION PENDING until merged and verified on `main`

## 1. Decisions

1. **`F6_INVENTORY_AUTHORIZED = YES`**, limited to the non-production persistence-recovery scope defined in §2.
2. **`TD-7b` (production data-directory profile): OUT OF SCOPE for non-production**, deferred. It is not implemented and not universally resolved by this act.

## 2. F6 inventory scope (authorized)

- Inventory, inspection, and reconciliation of existing data **only** in support of the Class-C journal persistence-recovery proof (`CV-38`).
- Non-production scope only; no production data, no production profile, no cross-tenant or cross-owner access.
- No migration, reassignment, deletion, partition rewrite, or exposure of existing data beyond what the proof requires.
- `F6_INVENTORY_AUTHORIZED` remains scoped; it does not become a general data-inventory authority.

## 3. TD-7b disposition

- TD-7b (production data-directory profile) remains **DEFERRED** and out of scope for non-production.
- No production data-directory profile is implemented or authorized by this act.
- TD-7a (local `IIPS_DATA_DIR`) remains the implemented, authorized profile.

## 4. CV-38 publication authorization

- The three proof files (`frontend/server/persistence/persistence-restart-proof.test.ts`, `restart-proof-recoverer.ts`, `restart-proof-writer.ts`) are authorized for publication as a focused docs-and-test PR, subject to verification of contents and compatibility with the authoritative baseline.
- Verification already performed: 2/2 proof tests pass on current `main` (2.99 s); no new dependency; `persistence-service` on `main`; `vite-node` resolves in the install.
- Publication does not close CV-38 until the PR is merged and the remote state is independently verified.

## 5. Evidence

- Tracker §16.4 CV-24 row; §16.16.6; §18 row 39.
- Proof source: `arena/a2df3b85-iips-review-recovered` @ `5eba01b6e818a261230725761b7797b68782e883`.
- Test result: 2/2 passed.

## 6. Remaining limitations

- TD-7b remains deferred; production profile unresolved.
- F6 inventory authority is scoped to persistence-recovery proof only.
- CV-38 remains OPEN until PR merge and remote verification.
