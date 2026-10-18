# PKG-01 test scope review — composed route boundary

This short review accompanies `evidence/integration/one-pass-2026-10-18/PKG-01-PKG-09-EXECUTION-RECORD.md`.

## Row 6

The previous `engine-transport.test.ts` was not sufficient for the matrix's composed-route claim: it creates a minimal test HTTP server and delegates to `EngineApiAdapter`. The new `server/live/engine-execution-live-certification.test.ts` imports the actual `server` exported from `executive-transport.ts`, therefore exercises the composed production route table (in a local, non-production Vitest process) rather than reproducing the route in a harness. It verifies GET registry, valid POST response/provenance, deterministic identical request, path/body mismatch 400, uncertified engine 404, and unsupported version 422. This is not a browser or production acceptance.

## Row 18

The existing `server/live/ai-advisory-live-certification.test.ts` already crosses the same real composed server boundary and checks the route-specific contract: anonymous DTO, same DTO with invalid Authorization, and unknown result 404. All three passed in the one-pass test run. No additional implementation or duplicate probe was warranted. The D89-style principle applies: route-contract test evidence does not itself claim broader product qualification/admission.
