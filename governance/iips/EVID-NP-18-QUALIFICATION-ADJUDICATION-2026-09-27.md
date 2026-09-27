# NP-18 Qualification Adjudication

Date: 2026-09-27
Implementation baseline: 6f2a75b7a6bb9395b82a958a565280b2983f843a
Evidence durability commit: 8d9babc3aadca40baa6ef0a9ae83659b1665aeab
Branch: phase13-next

## Qualification Scope

NP-18 qualification applies only to the authorized bounded Intelligence exposure:
Opportunities, Risks, Rankings, and the Intelligence landing/navigation surface.

The implementation is composition-only over the existing certified CrossSectorData / PipelineResult path.

No new intelligence acquisition source, provider, DTO, endpoint, persistence mechanism, or independent intelligence dataset was introduced.

## NP-18 Evidence

- Typecheck: PASS.
- Targeted NP-18 tests: 33/33 PASS.
- Production build: PASS.
- Intelligence landing runtime: PASS.
- Opportunities runtime: PASS.
- Risks runtime: PASS.
- Rankings runtime: PASS.
- Keycloak issuer discovery: PASS.
- Frontend localhost:5173: PASS.
- Backend localhost:8787: PASS.
- Certified SNAPSHOT provenance preserved.
- Opportunities and Rankings use the same certified RankedOpportunity[] slice.
- Risks exposes aggregate avgRisk and existing flags only.
- No independent intelligence calculation introduced.

## Full-Suite Reconciliation

Current full-suite result:

- Test files: 55 passed / 4 failed / 59 total.
- Tests: 687 passed / 7 failed / 15 skipped / 709 total.
- The seven failed tests and two failed suites are in live/admin/IdP-dependent certification paths.
- Recorded causes include unavailable admin/live-read executors and missing IIPS_TEST_PASSWORD.
- The failures do not identify an NP-18 implementation defect.

The full repository suite is therefore NOT represented as green.

## Adjudication

The full-suite failures are classified as ENVIRONMENT-DEPENDENT and outside the bounded NP-18 implementation qualification path.

NP-18-specific targeted, build, typecheck, and runtime evidence is sufficient for non-production qualification of the authorized three-surface Intelligence exposure.

## Current Disposition

Implementation: COMPLETE
Logical UI verification: PASS
Evidence durability: PASS
Qualification: QUALIFIED — NON-PRODUCTION / BOUNDED SCOPE
Full-suite repository status: ENVIRONMENT-DEPENDENT EXCEPTIONS RECORDED
Certification: NOT GRANTED
Release: NOT GRANTED
Production activation: NOT AUTHORIZED
NP-18 governance state: OPEN / COMMISSIONING