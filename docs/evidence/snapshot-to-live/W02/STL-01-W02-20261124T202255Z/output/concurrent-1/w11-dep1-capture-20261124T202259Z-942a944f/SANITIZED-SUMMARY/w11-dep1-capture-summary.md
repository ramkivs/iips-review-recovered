# W11 acceptance dependency 1 - owner-bound portfolio capture: sanitized summary

> Sanitized summary only. This is NOT the complete capture evidence and must not be described as such. The exact capture (portfolio contents) is a separate LOCAL-ONLY file that stays on the capturing host.

- Outcome: **CONSISTENT_CAPTURE** (ALL_GATING_CHECKS_PASSED), exit code 0
- Evidence eligibility: HOST_CAPTURE_SUBJECT_TO_REVIEW
- Capture id: 942a944f-8e14-4b77-af2e-13d641daa5c1
- Detail: One attempt produced four reads that agree on portfolio, revision, provenanceDigest, history entry, holdings count, holdings and identity.

## Sanitized summary (JSON)

```json
{
  "schema": "iips.w11-dep1.owner-bound-portfolio-capture.summary/v1",
  "artifactClass": "SANITIZED_SUMMARY",
  "notice": "Sanitized summary only. This is NOT the complete capture evidence and must not be described as such. The exact capture (portfolio contents) is a separate LOCAL-ONLY file that stays on the capturing host.",
  "captureId": "942a944f-8e14-4b77-af2e-13d641daa5c1",
  "outcome": "CONSISTENT_CAPTURE",
  "reasonCode": "ALL_GATING_CHECKS_PASSED",
  "message": "One attempt produced four reads that agree on portfolio, revision, provenanceDigest, history entry, holdings count, holdings and identity.",
  "exitCode": 0,
  "evidenceEligibility": "HOST_CAPTURE_SUBJECT_TO_REVIEW",
  "peerAuthenticity": "NOT_ATTESTED: the consumer cannot prove which process served the endpoint. That the peer was the operator-run IPD service is a host fact the operator attests separately.",
  "consumerObservation": {
    "firstReadStartedAtUtc": "2026-11-24T20:22:59.025Z",
    "finalReadCompletedAtUtc": "2026-11-24T20:22:59.039Z",
    "note": "Read from the CONSUMER host clock in UTC. These are observation timestamps. They are NOT IPD persistence timestamps and say nothing about when the data was written."
  },
  "attempts": {
    "maxAttempts": 3,
    "made": 1,
    "policy": "Only a failed consistency check is repeated, as a whole new sequence. A failed attempt is discarded entirely; reads from different attempts are never combined.",
    "perAttempt": [
      {
        "attempt": 1,
        "startedAtUtc": "2026-11-24T20:22:59.025Z",
        "completedAtUtc": "2026-11-24T20:22:59.039Z",
        "outcome": "CONSISTENT_CAPTURE",
        "reasonCode": "ALL_GATING_CHECKS_PASSED",
        "failedOperation": null,
        "failedCheckIds": [],
        "requestSequence": [
          "portfolio.list",
          "portfolio.get",
          "portfolio.revisions",
          "portfolio.get"
        ]
      }
    ]
  },
  "requestSequence": [
    "portfolio.list",
    "portfolio.get",
    "portfolio.revisions",
    "portfolio.get"
  ],
  "selection": {
    "method": "OPERATOR_SELECTED_AND_LISTED",
    "listedPortfolioCount": 2,
    "operatorSuppliedPortfolioId": true,
    "rule": "Identified from the actual portfolio.list response. No default portfolio id is assumed."
  },
  "portfolio": {
    "revision": 4,
    "holdingsCountReported": 65,
    "holdingsArrayLength": 65,
    "isSaved": true,
    "weightSumPercentage": 99.99999999999999,
    "provenanceDigestPresent": true,
    "provenanceDigestLength": 64,
    "detailWireShape": "LocalPortfolioDetail",
    "contributionsCount": 0,
    "importEvidenceCount": 4,
    "historyEntryCount": 4,
    "matchingHistoryEntry": {
      "revision": 4,
      "operation": "MERGE",
      "holdingsCount": 65
    },
    "ipdReportedStoredInstants": {
      "lastUpdated": "2026-11-22T15:19:56.714Z",
      "matchingRevisionCommittedAt": "2026-11-22T15:19:56.714Z",
      "note": "Reported by IPD from its stored rows and carried verbatim. These are distinct from the consumer observation timestamps and are not observation times."
    }
  },
  "identity": {
    "holdings": 65,
    "securityIdentityObjectPresent": 65,
    "securityIdentityNull": 0,
    "securityIdentityAbsent": 0,
    "securityIdentityMalformed": 0,
    "identityStatus": {
      "RESOLVED": 65
    },
    "resolutionDisposition": {
      "CANONICAL_P04": 65
    },
    "basis": "Counted from the actual securityIdentity object on each wire holding. Nothing is derived from a symbol, a company name or an exchange. Null or absent means explicitly unresolved upstream."
  },
  "consistency": {
    "scope": "Read consistency across four sequential IPC reads within the observation window. It is not atomicity and not a cross-service transaction, and it does not prove that no write occurred and reverted between reads.",
    "consistent": true,
    "checks": [
      {
        "id": "GETS_NAME_THE_IDENTIFIED_PORTFOLIO",
        "passed": true,
        "detail": "both portfolio.get results must carry the portfolio id identified from portfolio.list"
      },
      {
        "id": "GETS_SAME_REVISION",
        "passed": true,
        "detail": "first get revision 4; second get revision 4"
      },
      {
        "id": "GETS_SAME_PROVENANCE_DIGEST",
        "passed": true,
        "detail": "provenanceDigest compared by exact string equality across both gets"
      },
      {
        "id": "HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION",
        "passed": true,
        "detail": "history entries: 4; entries for revision 4: 1"
      },
      {
        "id": "HISTORY_ENTRY_SAME_PROVENANCE_DIGEST",
        "passed": true,
        "detail": "history entry provenanceDigest compared by exact string equality with both gets"
      },
      {
        "id": "HISTORY_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH",
        "passed": true,
        "detail": "history holdingsCount 65; holdings array lengths 65 and 65"
      },
      {
        "id": "DETAIL_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH",
        "passed": true,
        "detail": "detail holdingsCount 65 and 65; holdings array lengths 65 and 65"
      },
      {
        "id": "HOLDINGS_IDENTICAL_ACROSS_GETS",
        "passed": true,
        "detail": "every holding of the first get must equal a holding of the second get, field for field"
      },
      {
        "id": "HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS",
        "passed": true,
        "detail": "symbol, companyId, identityStatus, resolutionDisposition, lineageDigest and the securityIdentity object, verbatim"
      },
      {
        "id": "DETAIL_IDENTICAL_ACROSS_GETS",
        "passed": true,
        "detail": "the two wire details must be identical in every field (holdings compared order-insensitively)"
      }
    ],
    "observations": [
      {
        "id": "LIST_SUMMARY_AGREES_WITH_DETAIL",
        "value": true,
        "detail": "revision, provenanceDigest and holdingsCount of the listed summary against the first get"
      },
      {
        "id": "HOLDINGS_ORDER_IDENTICAL_ACROSS_GETS",
        "value": true,
        "detail": "whether both gets returned the holdings in the same order"
      },
      {
        "id": "PROVENANCE_DIGEST_NON_EMPTY",
        "value": true,
        "detail": "an empty stored provenanceDigest is a valid stored fact, but then the digest comparisons above compare empty strings and discriminate nothing"
      },
      {
        "id": "CAPTURED_REVISION_IS_LATEST_IN_HISTORY",
        "value": true,
        "detail": "highest revision in history 4; captured revision 4"
      }
    ]
  },
  "caveats": [],
  "configuration": {
    "valid": true,
    "problems": [],
    "endpoint": {
      "kind": "windows-named-pipe",
      "source": "absolute-path"
    }
  },
  "protocol": {
    "clientProtocolVersion": 1,
    "responseProtocolVersionsObserved": [
      1
    ],
    "negotiation": "NONE (wire contract v1 fixes the version; the existing client refuses any other)",
    "perCallTimeoutMs": 5000,
    "responseCapBytes": 262144,
    "consumerPath": "IpcUserPortfolioPort over callIpc (existing IRR IPC consumer); no new framing"
  },
  "build": {
    "ipdBuildOnWire": "NOT_AVAILABLE: wire contract v1 responses carry the protocol version only; the service attests no build",
    "ipdHostObserved": {
      "checkoutCommit": null,
      "checkoutSource": null,
      "entrypointLastWriteUtc": null,
      "ipcProcessCount": null,
      "caveat": "Observed on the host by the PowerShell entry point (git HEAD of the IPD checkout, file time of its compiled IPC entrypoint, visible process count). It is NOT reported by the running service and does not prove which commit the running process was built from."
    },
    "irr": {
      "commit": null,
      "workingTreeDirty": null
    },
    "consumerRuntime": {
      "node": "v24.14.0",
      "platform": "win32",
      "arch": "x64"
    }
  },
  "ownerContext": {
    "source": "IPD_A2_BINDING",
    "irrLocalPreconditionAffirmed": true,
    "bindingIdentifiedByResponse": false,
    "note": "IPD resolves its owner binding server-side on every request and discloses nothing about it. No owner, tenant or binding identifier is sent or received, and the response does not identify the binding. The IRR-local precondition records that an operator provisioned a binding; it is not proof of one."
  },
  "exactCapture": {
    "location": "LOCAL_ONLY_NOT_PUBLISHED",
    "written": true,
    "fileName": "exact-owner-bound-portfolio-capture.json",
    "sha256": "7ffde6ebfc29e786c116849afc78650eb6005964f2738fc4425aa79e3e8c7e9a",
    "bytes": 252931,
    "note": "The SHA-256 binds this summary to the local exact capture file without disclosing its contents."
  },
  "readOnly": {
    "operationsSent": "portfolio.list, portfolio.get, portfolio.revisions only",
    "statement": "No write operation was sent. The utility did not start, stop, configure or migrate IPD and opened no database."
  },
  "limitations": [
    "Windows named-pipe behaviour and ACLs are host facts; the existing IRR client verifies only the POSIX path in CI.",
    "The capture proves read consistency over the observation window, not atomicity.",
    "The service build is not attested on the wire; host-observed build facts are labelled as such.",
    "The response does not identify the IPD owner binding."
  ]
}
```
