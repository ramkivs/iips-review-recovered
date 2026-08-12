# IIPS — CSIP Allocation Decision Matrix

**Program:** v1.1 Track 5 — CSIP
**Version:** 1.0-draft
**Status:** REFERENCE ASSET
**Date:** 2026-08-06
**Purpose:** Documents expected allocation behavior for portfolio scenarios — the decision contract for the Capital Allocation Engine.

---

## 1. Allocation decision matrix

| Scenario | Expected action |
|---|---|
| Banking overweight | Reduce Banking |
| Healthcare underweight | Increase Healthcare |
| Diversification poor | Recommend diversification |
| High conviction concentrated | Hold concentration |
| Multiple equivalent opportunities | Preserve diversification |
| Crisis portfolio | Reduce risk / raise quality / increase diversification |
| Income strategy | Favor high-yield/income sectors, reduce growth weight |
| Growth strategy | Favor growth sectors, accept higher risk |
| Conservative strategy | Favor low-risk/quality, minimize concentration |

## 2. Strategy profiles

Conservative · Balanced · Growth · Aggressive · Income · Value — each maps to target sector weights + risk/quality constraints.

## 3. Use

The Architecture Review + implementation use this matrix to verify allocation behavior.

## 4. Status

**REFERENCE ASSET** — feeds allocation fixtures + expected outputs.
