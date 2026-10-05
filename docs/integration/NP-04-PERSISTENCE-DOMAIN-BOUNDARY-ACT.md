# NP-04 — Persistence Domain-Boundary Act

> **Act ID:** `NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT-01`
> **Act type:** Technology-neutral governance boundary — non-executable
> **Program:** IIPS NP-04 Persistence
> **Preparation status:** **ARENA TRANSFER COPY — NOT AUTHORITATIVE**
> **DURABILITY STATUS:** **PENDING AUTHORITATIVE PUBLICATION**
> **Deciding authority:** Ramki / Program Authority
> **Recording/preparation agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by the agent
> **Authoritative publication target:** `ramkivs/iips-review-recovered` @ `refs/heads/main`
> **Preparation baseline:** `904c00c5db35c75b6b00b42827b8dc05d651a944` (tree `602cfbbf6553eefbf86604122c511588558ed68b`)
> **IPD:** OUT OF SCOPE — not accessed or modified
> **Production:** OUT OF SCOPE — not accessed or modified

---

## 1. Purpose

This act records the narrow persistence-domain boundary required to keep the
historical G24 portfolio/tenancy persistence lineage separate from the
historical NP-04 governed artifact/report persistence lineage.

The boundary prevents the two lineages from being merged, substituted, or
represented as one persistence authority. It does not select technology,
implement persistence, or authorize a production or deployment action.

The act is prepared against the reconciled IRR baseline only. It is not
constitutive or durable until it is published to the authoritative IRR
`origin/main` ref and independently verified there.

## 2. Authority and corpus basis

The boundary preparation preserves and does not reopen the following durable
IRR governance records:

- `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`
- `docs/integration/NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md`
- `docs/integration/NP-08-D115-ARCHITECTURE-DECISION-CLOSURE-ACT.md`
- `docs/integration/NP-08-D115-IMPLEMENTATION-AUTHORIZATION-DECISION-RECORD.md`
- `docs/integration/NP-08-D115-IMPLEMENTATION-COMPLETION-RECORD.md`
- `docs/integration/NP-15-BROAD-IPD-PHASE-1-CONVERGENCE-INVESTIGATION-RECORD.md`
- `docs/integration/NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-RECORD.md`
- `docs/integration/NP-15-IPD-SIDE-EVIDENCE-PENDING-IPD-PUBLICATION.md`
- `docs/integration/NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md`

The NP-15 evidence describes two historical, mutually exclusive persistence
lineages and records GAP-04: the domain boundary must be written. Historical
branches, commits, implementation choices, and asserted historical records do
not become current authority merely by being described here.

## 3. G24 portfolio/tenancy domain

The G24 domain comprises:

- user-owned portfolio and holdings persistence;
- portfolio identity and tenancy relationships;
- Owner/Account relationships;
- tenant membership;
- durable user-portfolio semantics; and
- related portfolio/tenancy lineage and idempotency semantics governed by G-2.

### 3.1 Ownership

**Owner:** **IPD — under G-2.**

G-2 establishes that IPD owns the user-portfolio domain and its durable
persistence boundary. The existing IPD portfolio capability is the baseline to
extend rather than replace or duplicate.

IRR does not become the owner of this durable user-portfolio domain.

### 3.2 Repository/ref status

The current authoritative IPD repository/ref is **not designated by the
available IRR corpus**. No historical G24 branch or commit is promoted to
current authority by this act. IPD is not accessed or modified by this act.

## 4. NP-04 governed artifact/report domain

The NP-04 domain comprises governed artifact/report persistence, including:

- report type;
- portfolio/scenario association;
- canonical payload;
- provenance;
- supersession/history semantics; and
- related governed artifact/report lineage.

### 4.1 Ownership and repository/ref status

A current NP-04 owner is **not established by the available authoritative IRR
corpus**.

A current authoritative NP-04 repository/ref is **not established by the
available authoritative IRR corpus**.

This act does not assign an owner, designate a repository/ref, or promote the
historical `np04-governed-persistence-windows` lineage to authority.

## 5. Domain coexistence and separation

G24 and NP-04 may coexist only as separate persistence domains with separate:

- authority;
- namespace;
- lifecycle;
- provenance;
- persistence contracts; and
- independently governed implementation boundaries.

Neither domain may be merged into the other for implementation convenience.
A record, identifier, lifecycle event, provenance chain, or persistence surface
must not be treated as belonging to both domains by inference.

## 6. Historical overlapping surfaces

The historical lineages overlap at:

```text
src/persistence/errors.ts
src/persistence/index.ts
```

These are historical overlapping implementation surfaces requiring separation.
They are not a current shared authority, shared persistence contract, or shared
storage boundary.

This act does not select either historical implementation and does not
legitimize either one for current use.

The following historical technology references remain evidence only:

- `better-sqlite3`;
- Node `node:sqlite` / `DatabaseSync`.

No selection is made between them.

## 7. IRR/IPD boundary

The existing G-2 boundary is preserved exactly:

- IPD owns the G-2 durable user-portfolio domain;
- IRR may consume the IPD-owned capability only through a separately governed,
  additive, minimal, contractually defined boundary;
- IRR must not create a duplicate user-portfolio persistence domain;
- this NP-04 artifact/report boundary does not transfer G-2 ownership to IRR;
- IPD remains untouched.

The NP-04 artifact/report domain must not become a D115 durable binding source
by implication or implementation convenience.

## 8. D115 relationship

The existing D115 contract is preserved without amendment.

D115 consumes the authoritative durable relationship when established:

```text
Principal
  → Owner/Account
  → Tenant
  → Company Binding
  → canonical CompanyId
```

The D115 relationship is governed by the G-2 durable application/user-portfolio
boundary and is consumed by IRR through its separately governed additive
runtime contract.

Accordingly:

- D115 does not own the durable user-portfolio persistence domain;
- NP-04 is not an unapproved D115 binding store;
- a D115 runtime context is not a durable permission grant;
- no D115 semantic change is made; and
- no D115 persistence implementation is authorized by this act.

## 9. D08 relationship

The following current authoritative IRR act was reviewed:

```text
docs/integration/NP-08-D08-MACRO-DATASET-BOUNDARY-ACT.md
```

D08 constitutes a D08 Macro dataset boundary only. It does not create a
provider designation, entitlement, persistence owner, persistence technology,
implementation authority, or production authority.

D08 has no contradiction, ownership overlap, namespace conflict, or persistence
dependency affecting this NP-04 boundary. D08 remains unchanged.

## 10. Technology neutrality

```text
TECHNOLOGY = NOT SELECTED
```

This act does not select or authorize a:

- database;
- ORM;
- schema;
- migration;
- storage vendor;
- storage adapter;
- cache;
- queue;
- protocol;
- serialization format; or
- deployment topology.

## 11. Implementation authority

```text
IMPLEMENTATION AUTHORITY = NOT GRANTED BY THIS ACT
```

This act is a governance boundary only. It does not authorize persistence
implementation, schema work, migrations, adapters, APIs, UI, runtime changes,
Company Identity Authority creation, qualification, acceptance, certification,
release, or deployment.

## 12. Production boundary

```text
PRODUCTION = OUT OF SCOPE / NOT AUTHORIZED
```

No production database, deployment, migration, release, qualification,
acceptance, certification, or operational activity is authorized.

## 13. Historical and namespace preservation

Nothing in this act:

- retroactively legitimizes `better-sqlite3`;
- retroactively legitimizes Node `node:sqlite` / `DatabaseSync`;
- promotes a historical Arena branch or commit to authority;
- promotes a historical IPD artifact to current authority;
- merges G24 and NP-04 namespaces;
- changes CompanyId, Principal, Owner/Account, Tenant, PIT, NP-12, provider,
  report, portfolio, or engine identity semantics; or
- rewrites a historical governance record.

## 14. Effectiveness and durability

This document is an Arena transfer copy prepared for later Windows publication.
It has no constitutive effect merely because it exists in the Arena workspace,
as an untracked file, or in a local checkout.

It becomes effective only after all of the following occur on the authoritative
IRR ref:

1. publication to `ramkivs/iips-review-recovered` `refs/heads/main`;
2. independent verification that the publication commit is reachable from
   authoritative `main`;
3. verification of this artifact's remote tree entry and Git blob identity;
4. re-reading the artifact from authoritative remote state;
5. verification that no unintended path changed; and
6. verification of local/remote convergence and a clean worktree/index.

Until then:

```text
DURABILITY STATUS = PENDING AUTHORITATIVE PUBLICATION
```

## 15. Program Authority decision provenance

**Deciding authority:** Ramki / Program Authority.

**Authorized scope:** constitution, preparation, transfer, later commit, push,
and independent remote verification of one additive, technology-neutral
NP-04 Persistence Domain-Boundary Act on IRR `origin/main`.

**Explicit exclusions:** persistence implementation, technology selection,
IPD mutation, production activity, G-2 modification, D115 semantic or
persistence implementation changes, D91/PIT/IU-7/IU-8 modification, NP-12
modification, and retroactive legitimization of historical persistence
implementations.

**Preparation state:**

```text
DURABILITY STATUS = PENDING AUTHORITATIVE PUBLICATION
```

**End of prepared NP-04 Persistence Domain-Boundary Act.**
