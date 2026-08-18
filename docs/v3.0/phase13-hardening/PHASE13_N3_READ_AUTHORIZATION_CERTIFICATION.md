# PROGRAM v3.0 - PHASE 13-HARDENING - N+3 READ AUTHORIZATION CERTIFICATION

## 1. Certification scope

N+3 certifies the governed READ authorization boundary implemented by commit `87f8b59dfb55d2b91155e7628777b3280352fd31`.

Scope is limited to:

- server-side authorization of governed READ surfaces;
- reuse of the existing Keycloak authentication and governed RBAC boundary;
- Bearer-token propagation by governed READ API clients;
- action-aware READ authorization;
- preservation of the existing administration authorization boundary;
- automated authorization/client propagation coverage;
- live Keycloak acceptance of authenticated and negative authorization paths.

No `iips-platform/` implementation change is included in this increment.

## 2. Certified implementation commit

Commit: `87f8b59dfb55d2b91155e7628777b3280352fd31`

Message: `feat: enforce governed read authorization`

Branch: `phase13-next`

Remote: `recovered/phase13-next`

## 3. Changed-file boundary

The certified implementation commit contains exactly 11 files:

M frontend/server/admin-transport.ts
M frontend/server/executive-transport.ts
A frontend/server/read-guard.test.ts
M frontend/src/api/company.ts
M frontend/src/api/crossSector.ts
M frontend/src/api/decisionMatrix.ts
M frontend/src/api/evidence.ts
M frontend/src/api/executive.ts
M frontend/src/api/portfolio.ts
A frontend/src/api/readClients.test.ts
M frontend/src/api/replay.ts

Commit statistics:

11 files changed
303 insertions
78 deletions

No `iips-platform/` path is present in the certified implementation commit.

## 4. Automated focused acceptance

N+2 governed-read tests were executed after implementation.

server/read-guard.test.ts: 7 passed
src/api/readClients.test.ts: 7 passed

Test Files: 2 passed
Tests: 14 passed

Result: PASS.

The tests establish:

- viewer READ authorization;
- analyst READ authorization;
- admin READ authorization;
- missing-token rejection;
- expired-token rejection;
- action-aware denial of execute for viewer;
- preservation of the admin-only executor boundary;
- Bearer propagation by all seven governed READ clients.

## 5. Regression acceptance

The N+3 certification evidence captured in this increment is the focused governed-read authorization suite documented in Section 4.

A full-suite regression result is not asserted by this certification record because a full-suite result was not captured in the N+3 acceptance evidence.

Result: NOT USED AS AN N+3 CERTIFICATION GATE.
## 6. Typecheck acceptance

Client typecheck: PASS.

Server typecheck:

npm run typecheck:server
tsc --noEmit -p tsconfig.server.json

Result: PASS.

## 7. Production build acceptance

A production-build result was not captured as part of the N+3 acceptance evidence.

No production-build claim is therefore used as an N+3 certification gate.
## 8. Static integrity

The following checks passed:

git show --check HEAD
git diff --check

No whitespace or patch-integrity errors were reported.

## 9. LIVE Keycloak viewer identity

The live viewer token was inspected without printing the token value.

Observed claims:

preferred_username=viewer-a
tenant=tenant-A
realm_roles=offline_access,default-roles-iips,uma_authorization,iips-viewer

Issuer:

http://localhost:8080/realms/iips

Audience included:

iips-spa
account

The token was accepted by the live frontend transport.

## 10. LIVE governed READ acceptance

Using the live authenticated viewer token:

/api/executive -> HTTP 200
/api/portfolio -> HTTP 200
/api/decision-matrix -> HTTP 200
/api/cross-sector -> HTTP 200
/api/company/Banking -> HTTP 200
/api/evidence/Banking -> HTTP 200
/api/replay/Banking -> HTTP 200

Result: PASS.

The `/api/company/Banking` route resolved to the certified `Banking-H1` company payload.

## 11. LIVE missing-credential rejection

Without an Authorization credential:

/api/executive -> HTTP 401 missing-credential
/api/portfolio -> HTTP 401 missing-credential
/api/company/Banking -> HTTP 401 missing-credential
/api/evidence/Banking -> HTTP 401 missing-credential
/api/replay/Banking -> HTTP 401 missing-credential

Result: PASS.

## 12. LIVE malformed-token rejection

With:

Authorization: Bearer definitely-not-a-jwt

the governed READ surfaces returned:

HTTP 401 malformed-token

for all five tested endpoints.

Result: PASS.

## 13. LIVE administration boundary

The live admin token identified:

preferred_username=admin-a
tenant=tenant-A
realm_roles=iips-admin,offline_access,default-roles-iips,uma_authorization

Admin access:

/api/admin/overview -> HTTP 200

The same endpoint using the live viewer token:

/api/admin/overview -> HTTP 403 forbidden

Result: PASS.

The existing administration boundary remains admin-only.

## 14. Authorization boundary invariants

The N+3 implementation preserves the following invariants:

- authorization remains server-side;
- READ access requires authenticated credentials;
- governed READ access is role-aware;
- execute authorization is not implicitly granted by READ authorization;
- the existing admin executor does not gain READ authorization;
- the UI does not become an authorization authority;
- no tenant identity is fabricated by the READ transport;
- no platform engine authority is introduced.

## 15. Platform boundary

The certified commit contains no `iips-platform/` path.

No platform implementation was modified as part of N+3.

Platform behavior is therefore treated as an external/pre-existing dependency for this certification.

## 16. Data and transport integrity

The READ transport returns governed payloads from the existing certified computation paths.

No fabricated metrics, synthetic authorization claims, or alternate data authority were introduced by the N+3 certification increment.

The transport remains read-only.

## 17. Worktree reconciliation

At certification time, the frontend source worktree contained no modified or untracked application files.

The only untracked items were pre-existing parent-level delivery artifacts:

iips-milestone-n.patch
iips-milestone-n1a-auth-returnto.patch
iips-milestone-n2-read-auth.patch
phase13-hardening-delivery.bundle
v3.0-phase12-certified-snapshot.tar.gz
v3.0-phase12-certified.bundle

These artifacts are outside the frontend application source tree and are not part of commit `87f8b59`.

## 18. Remote reconciliation

Local certified HEAD:

87f8b59dfb55d2b91155e7628777b3280352fd31

Remote `recovered/phase13-next`:

87f8b59dfb55d2b91155e7628777b3280352fd31

Result:

LOCAL == REMOTE

The certified implementation is therefore reproducibly anchored to the same remote commit.

## 19. Known non-blocking observations

The full test run reported existing React Router future-flag warnings and existing React `act(...)` warnings.

These did not cause test failures.

They are recorded as non-blocking observations and are outside the N+3 governed-read authorization scope.

No unrelated cleanup was introduced to eliminate them.

## 20. Certification status

### ACCEPTED

N+3 governed READ authorization is accepted against:

87f8b59dfb55d2b91155e7628777b3280352fd31

Acceptance basis:

Focused authorization tests: 14/14 PASS
Client typecheck: PASS
Server typecheck: PASS
Static diff checks: PASS
Live authenticated READs: PASS
Live missing-token rejection: PASS
Live malformed-token rejection: PASS
Live admin boundary: PASS
Platform paths modified: NONE
Local HEAD == remote HEAD: YES

No application implementation change is required as a result of this certification.

The next governance action is documentation-only commit and remote reconciliation.