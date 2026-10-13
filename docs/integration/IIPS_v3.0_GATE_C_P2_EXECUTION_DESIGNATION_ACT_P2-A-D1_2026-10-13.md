# GC-D5 — Program Authority Act: Adoption of Designation Set P2-A-D1

**Status:** ADOPTED — effective for the P-2 operator establishment sequence after durable publication and independent verification on authoritative IRR `main`.

**Decision date:** 2026-10-13.

**Authority source:** The Program Authority's explicit selection of Designation Set `P2-A-D1` in the operating session on 2026-10-13. This records the actual decision; it does not assert a separate signature, signed instrument, approval ID, or unprovided authorization.

## 1. Decision

The Program Authority adopts Designation Set `P2-A-D1` exactly as published in the P-2 execution designation worksheet. No substitutions are made.

## 2. Adopted designations

| # | Designation | Adopted value |
|---|---|---|
| 1 | `ISSUER` | `http://127.0.0.1:8421/non-production/p2-anchor` |
| 2 | `JWKS_URI` | `http://127.0.0.1:8421/non-production/p2-anchor/jwks.json` |
| 3 | JWKS trust statement | Exact wording in the adopted worksheet §4.3; incorporated without paraphrase or substitution |
| 4 | Key size | 2048-bit RSA |
| 5 | Custody | `$HOME/.iips-gate-c-p2/anchor/keys/`, resolved to an absolute path during establishment |
| 6 | Readers | The designated operator OS account running the anchor; directory permissions `0700`, key-file permissions `0600` |
| 7 | Generation/destruction | OpenSSL 3.x `genpkey` or the specified program primitive; the adopted overwrite-then-unlink procedure and stated storage limits apply |
| 8 | Rotation | At most 90 days, plus the adopted on-demand triggers |
| 9 | `SUBJECT` | `p2-principal-0001` |
| 10 | `IPD_PORTFOLIO_DB_PATH` | `$HOME/.iips-gate-c-p2/runtime/portfolio.sqlite`, resolved to an absolute path during establishment |

The worksheet's exact §4.3 trust-statement wording remains authoritative. This act does not replace it with a paraphrase.

## 3. Effect and execution boundary

Upon durable publication and independent verification of this act on authoritative IRR `main`, the P-2 operator establishment sequence specified in the existing P-2 request §§7.2–7.3 may begin using the adopted designations.

The act does not claim that any establishment operation has already occurred. Key generation, JWKS publication, scoped-runtime startup, configuration, and verification must be evidenced by actual execution.

## 4. Preserved boundaries

- Non-production, single-user, self-asserted delegation only; not enterprise or production authentication.
- The existing User Portfolios HTTP `503` fence remains unchanged until separately authorized admission requirements are satisfied.
- Option 2F continues to refuse unresolved or ambiguous writes before serialization and persistence-port invocation.
- No forwarded-Principal trust, caller-controlled identity resolution, or authentication/tenant/portfolio-authorization bypass is authorized.
- P-4 requires its own separate sequential act before provisioning or creation of a mapping, tenant, membership, or audit row.
- P-6 implementation authority and P-8 qualification remain separate prerequisites.
- S6 successful-write identity policy/full F-7 and S7 consumer/route/UI admission remain separately gated.
- No IPD source change, protected-ref change, lineage merge, or repin is authorized by this act.
- Private keys, tokens, credentials, and other secret material must not be placed in Git, governance records, or ordinary logs.

## 5. Verification and status

The act becomes effective for P-2 execution only after the decision has been durably recorded, published through the established workflow, and independently verified on remote `main`.

The publication record must identify the actual merge commit and verify the adopted values. Subsequent execution evidence must distinguish successful operations from unexecuted steps and failures.

P-4, P-6, and P-8 are not automatically approved by this act.
