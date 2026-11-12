# W10 issuer-to-engine mapping — preliminary inventory

**Status: INCOMPLETE — research and schema inventory only. This is not an execution-qualification contract.** No issuer is qualified by this document. The remaining work includes source/period/unit/provenance validation, a complete field-by-field mapping matrix and a fail-closed implementation with tests. Do not use reference inputs as live issuer data.

## Scope and findings

The registry contains 13 certified `SectorPlugin` engines. Their input interfaces and implementations are not interchangeable with the separate production-market-data benchmark-factor stub. The inventory below records explicitly declared input properties, not every accepted dynamic key: index signatures and the score/decision/calibration implementations may consume additional keys. The frozen implementation and its calibration must be checked before mapping an input or permitting execution.

Important investigation findings (not a complete mapping):

* Banking's `BM-003`, `BM-004`, `BM-005`, `BM-006`, `BM-014` and `BM-015` correspond respectively to canonical `BM_NIM`, `BM_CASA`, `BM_GNPA`, `BM_NNPA`, `BM_CET1` and `BM_CAR`. Whether a specific observation is suitable still requires source, scope, period, validation and units checks. Banking also assigns fixed neutral scores to growth, operating efficiency and valuation, totaling 25% of its composite; any eligibility policy must explicitly account for those limitations.
* Insurance expects raw APE and VNB; the available VNB margin is not a substitute for raw VNB. Capital Markets and Healthcare have material fields without established canonical mappings. Healthcare uses `HC-007` in scoring paths with opposite band directions.
* Hospitality, Energy, Utilities and Consumer have mandatory inputs whose mappings have not been established. Energy's lifting-cost calibration uses USD/boe, while the canonical `EM_LIFTING_COST` is INR; no conversion is justified without a verified basis and exchange rate. Utilities FFO is not automatically equivalent to operating cash flow.
* Industrials can propagate missing scores to `NaN`; Technology and the Telecom, Auto and Materials engines can renormalize or zero missing pillars. A successful engine call alone is not proof of adequate issuer inputs.
* Telecom `TL-005` scoring bands increase with debt/EBITDA even though its leverage alert flags high values; Telecom ARPU and subscriber calibration scales need separate verification. Auto `AU-002` thresholds do not obviously match canonical utilisation percent. Materials `MM-007` calibration direction and scale conflict with canonical cost-position quartile semantics. Do not silently map these fields.
* For financial calculations, preserve existing W07 missing and nil semantics. In particular, Marico `PREFERENCE_CAPITAL` and KEC `CURRENT_INVESTMENTS` remain unresolved, rather than inferred zero. The effect of each missing item depends on the specific calculation: preference capital is an enterprise-to-equity bridge component, while missing current investments can block net debt. Do not use legacy derived net debt in place of the guarded capital-structure computation.

## Declared engine input fields

Extracted from the frozen `metrics/*Metrics.ts` interfaces. `?` means TypeScript-optional, **not** safe to omit for issuer execution. Metric names and types here are the interface spelling; comments are not a substitute for the full semantic/units matrix. Wildcard index signatures are listed separately and must not be mistaken for permission to pass arbitrary fields.

### AutoInput

Source: `iips-platform/src/sector-engines/auto/metrics/AutoMetrics.ts`. Contains an index signature for additional keys.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `AU-001` | yes | `number` | Production volume |
| `AU-002` | yes | `number` | Capacity utilization |
| `AU-003` | yes | `number` | Revenue growth |
| `AU-004` | yes | `number` | EBITDA margin |
| `AU-005` | yes | `number` | Market share |
| `AU-006` | yes | `number` | R&D intensity |
| `AU-007` | yes | `number` | Dealer network |
| `AU-008` | yes | `number` | Debt/EBITDA |
| `governance` | yes | `boolean` | — |
| `supplyShock` | yes | `boolean` | — |
| `recall` | yes | `boolean` | — |

### BankingInput

Source: `iips-platform/src/sector-engines/banking/metrics/BankingMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `BM-001` | yes | `number` | ROA |
| `BM-002` | yes | `number` | ROE |
| `BM-003` | yes | `number` | NIM |
| `BM-004` | yes | `number` | CASA |
| `BM-005` | yes | `number` | GNPA |
| `BM-006` | yes | `number` | NNPA |
| `BM-014` | yes | `number` | CET1 |
| `BM-015` | yes | `number` | CAR |
| `governanceFlag` | yes | `string` | — |

### CapitalMarketsInput

Source: `iips-platform/src/sector-engines/capital-markets/metrics/CapitalMarketsMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `CM-001` | yes | `number` | AUM |
| `CM-002` | yes | `number` | AUM Growth |
| `CM-003` | yes | `number` | Expense Ratio/TER |
| `CM-004` | yes | `number` | Cost-to-Income |
| `CM-005` | yes | `number` | Recurring % |
| `CM-006` | yes | `number` | Market Share |
| `CM-007` | yes | `number` | Brokerage Income |
| `CM-008` | yes | `number` | Net Flows |
| `regulatoryFlag` | yes | `string` | — |
| `governanceFlag` | yes | `string` | — |
| `marketCycleFlag` | yes | `string` | — |

### ConsumerInput

Source: `iips-platform/src/sector-engines/consumer/metrics/ConsumerMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `segment` | no | `string` | staples  /  discretionary  /  luxury  /  retailer  /  restaurant  /  dtc |
| `businessModel` | no | `string` | branded  /  retailer  /  restaurant  /  dtc  /  multi-brand |
| `revenueGrowth` | no | `number` | CM-002 % |
| `priceContribution` | no | `number` | CM-006 % (price-led) |
| `brandLoyalty` | no | `number` | CM-007 % |
| `marginResilience` | no | `number` | CM-008 index |
| `dtcShare` | no | `number` | CM-009 % |
| `fcfYield` | no | `number` | CM-010 % |
| `innovationIntensity` | no | `number` | CM-011 % |
| `privateLabelExposure` | no | `number` | CM-012 % |
| `ebitdaMargin` | no | `number` | CM-001 % |
| `debtEbitda` | no | `number` | CM-003 x |
| `peRatio` | no | `number` | CM-004 |
| `roic` | no | `number` | CM-005 % |
| `governance` | yes | `boolean` | — |
| `brandErosion` | yes | `boolean` | — |
| `categoryDisruption` | yes | `boolean` | — |
| `inputCostSqueeze` | yes | `boolean` | — |
| `channelLoss` | yes | `boolean` | — |

### EnergyInput

Source: `iips-platform/src/sector-engines/energy/metrics/EnergyMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `segment` | no | `string` | integrated  /  upstream  /  midstream  /  downstream  /  renewables  /  utility |
| `commodityExposure` | no | `string` | price-taker  /  partial-hedger  /  contracted-revenue  /  regulated-return  /  diversified |
| `productionGrowth` | no | `number` | EM-006 % |
| `liftingCost` | no | `number` | EM-007 |
| `reserveReplacement` | no | `number` | EM-008 ratio |
| `ebitdaMargin` | no | `number` | EM-001 % |
| `revenueGrowth` | no | `number` | EM-002 % |
| `debtEbitda` | no | `number` | EM-003 x |
| `roce` | no | `number` | EM-005 % |
| `transitionMix` | no | `number` | EM-011 % |
| `fcfYield` | no | `number` | EM-012 % |
| `evEbitda` | no | `number` | EM-004 x |
| `governance` | yes | `boolean` | — |
| `strandedAsset` | yes | `boolean` | — |
| `reserveWriteDown` | yes | `boolean` | — |
| `costBlowout` | yes | `boolean` | — |
| `priceCollapse` | yes | `boolean` | — |

### HealthcareInput

Source: `iips-platform/src/sector-engines/healthcare/metrics/HealthcareMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `HC-001` | yes | `number` | Bed Occupancy |
| `HC-002` | yes | `number` | ARPOB |
| `HC-003` | yes | `number` | ALOS |
| `HC-004` | yes | `number` | EBITDA Margin |
| `HC-005` | yes | `number` | Revenue Growth |
| `HC-006` | yes | `number` | Debt/Equity |
| `HC-007` | yes | `number` | Working Capital / Receivables (proxy for payer mix) |
| `HC-008` | yes | `number` | Test Volume Growth |
| `HC-009` | yes | `number` | R&D Intensity |
| `HC-010` | yes | `number` | Pipeline/Approvals |
| `HC-011` | yes | `number` | Book-to-Bill |
| `HC-012` | yes | `number` | Recurring Revenue % |
| `qualityFlag` | yes | `string` | — |
| `regulatoryFlag` | yes | `string` | — |
| `pipelineFlag` | yes | `string` | — |

### HospitalityInput

Source: `iips-platform/src/sector-engines/hospitality/metrics/HospitalityMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `businessModel` | no | `string` | owned  /  leased  /  managed  /  franchised  /  asset-light |
| `occupancy` | no | `number` | HM-005 % |
| `adr` | no | `number` | HM-006 |
| `revpar` | no | `number` | HM-007 |
| `revparGrowth` | no | `number` | HM-009 % |
| `gopMargin` | no | `number` | HM-008 % |
| `ebitdaMargin` | no | `number` | HM-001 % |
| `feeMix` | no | `number` | HM-010 % |
| `demandQualityMix` | no | `number` | HM-011 % |
| `debtEbitda` | no | `number` | HM-003 x |
| `roic` | no | `number` | HM-012 % |
| `demandShock` | yes | `boolean` | — |
| `occupancyCollapse` | yes | `boolean` | — |
| `brandDeterioration` | yes | `boolean` | — |
| `governance` | yes | `boolean` | — |

### IndustrialsInput

Source: `iips-platform/src/sector-engines/industrials/metrics/IndustrialsMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `subsegment` | no | `string` | capital-goods  /  aero-defense  /  transportation  /  eandc  /  electrical-equipment  /  diversified |
| `archetype` | no | `string` | oem  /  aftermarket  /  epc  /  distributor  /  diversified |
| `ebitdaMargin` | no | `number` | IM-001 % |
| `revenueGrowth` | no | `number` | IM-002 % |
| `debtEbitda` | no | `number` | IM-003 x |
| `evEbitda` | no | `number` | IM-004 (mid-cycle) |
| `roce` | no | `number` | IM-005 % |
| `backlog` | no | `number` | IM-006 (÷ revenue) |
| `bookToBill` | no | `number` | IM-007 |
| `aftermarketShare` | no | `number` | IM-008 % |
| `fcfYield` | no | `number` | IM-009 % |
| `orderGrowth` | no | `number` | IM-010 % |
| `operatingMargin` | no | `number` | IM-011 % |
| `projectRiskExposure` | no | `number` | IM-012 % |
| `governance` | yes | `boolean` | — |
| `orderCancellation` | yes | `boolean` | — |
| `epcCostOverrun` | yes | `boolean` | — |
| `defenseProgramFail` | yes | `boolean` | — |
| `marginCompression` | yes | `boolean` | — |

### InsuranceInput

Source: `iips-platform/src/sector-engines/insurance/metrics/InsuranceMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `IM-001` | yes | `number` | Combined Ratio |
| `IM-002` | yes | `number` | Solvency Ratio |
| `IM-003` | yes | `number` | APE |
| `IM-004` | yes | `number` | VNB |
| `IM-005` | yes | `number` | Persistency |
| `IM-006` | yes | `number` | Embedded Value |
| `IM-007` | yes | `number` | Expense Ratio |
| `IM-008` | yes | `number` | Investment Yield |
| `governanceFlag` | yes | `string` | — |
| `catastropheFlag` | yes | `string` | — |

### MaterialsInput

Source: `iips-platform/src/sector-engines/materials/metrics/MaterialsMetrics.ts`. Contains an index signature for additional keys.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `MM-001` | yes | `number` | Commodity price trend |
| `MM-002` | yes | `number` | Production volume |
| `MM-003` | yes | `number` | EBITDA margin |
| `MM-004` | yes | `number` | ROCE |
| `MM-005` | yes | `number` | Debt/EBITDA |
| `MM-006` | yes | `number` | Reserve life |
| `MM-007` | yes | `number` | Cost position |
| `MM-008` | yes | `number` | Valuation |
| `subsegment` | yes | `string` | G1 |
| `archetype` | yes | `string` | G2 |
| `governance` | yes | `boolean` | — |
| `commodityShock` | yes | `boolean` | — |
| `operationalDisruption` | yes | `boolean` | — |

### TechnologyInput

Source: `iips-platform/src/sector-engines/technology/metrics/TechnologyMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `subsegment` | yes | `string` | — |
| `subsegments` | yes | `string[]` | — |
| `subsegmentDominant` | yes | `string` | — |
| `archetype` | no | `string` | — |
| `hybridDominant` | yes | `string` | — |
| `ebitdaMargin` | yes | `number` | TM-001 % |
| `revenueGrowth` | yes | `number` | TM-002 % |
| `debtEbitda` | yes | `number` | TM-003 x |
| `evRevenue` | yes | `number` | TM-004 (EV/Revenue or EV/EBITDA per subsegment) |
| `fcfYield` | yes | `number` | TM-005 % |
| `recurringRevenuePct` | yes | `number` | TM-006 % |
| `nrr` | yes | `number` | TM-007 % |
| `grossMargin` | yes | `number` | TM-008 % |
| `rdIntensity` | yes | `number` | TM-009 % (3-band) |
| `customerConcentration` | yes | `number` | TM-010 % |
| `capexIntensity` | yes | `number` | TM-011 % |
| `usageGrowth` | yes | `number` | TM-012 % |
| `governance` | yes | `boolean` | — |
| `disruption` | yes | `boolean` | — |
| `churnCollapse` | yes | `boolean` | — |
| `customerLoss` | yes | `boolean` | — |
| `capexOverrun` | yes | `boolean` | — |
| `marginCompression` | yes | `boolean` | — |

### TelecomInput

Source: `iips-platform/src/sector-engines/telecom/metrics/TelecomMetrics.ts`. Contains an index signature for additional keys.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `TL-001` | yes | `number` | ARPU-like |
| `TL-002` | yes | `number` | Subscribers |
| `TL-003` | yes | `number` | Revenue growth |
| `TL-004` | yes | `number` | EBITDA margin |
| `TL-005` | yes | `number` | Debt/EBITDA |
| `TL-006` | yes | `number` | FCF yield |
| `TL-007` | yes | `number` | Network quality |
| `TL-008` | yes | `number` | Capex intensity |
| `governance` | yes | `boolean` | — |
| `regulatoryShock` | yes | `boolean` | — |
| `networkOutage` | yes | `boolean` | — |

### UtilitiesInput

Source: `iips-platform/src/sector-engines/utilities/metrics/UtilitiesMetrics.ts`.

| Field | Optional in interface | Type | Source comment |
|---|---|---|---|
| `segment` | no | `string` | regulated-electric  /  gas-distribution  /  water-utilities  /  ipp-merchant  /  multi-utility |
| `regulatoryPosture` | no | `string` | constructive  /  neutral  /  adversarial |
| `rateBaseGrowth` | no | `number` | UM-006 % |
| `allowedRoe` | no | `number` | UM-007 % |
| `ffoDebt` | no | `number` | UM-008 % |
| `omEfficiency` | no | `number` | UM-009 % |
| `demandGrowth` | no | `number` | UM-010 % |
| `saidi` | no | `number` | UM-011 minutes |
| `transitionCapexIntensity` | no | `number` | UM-012 % |
| `ebitdaMargin` | no | `number` | UM-001 % |
| `revenueGrowth` | no | `number` | UM-002 % |
| `debtEbitda` | no | `number` | UM-003 x |
| `peRatio` | no | `number` | UM-004 |
| `roe` | no | `number` | UM-005 % |
| `governance` | yes | `boolean` | — |
| `adverseRateCase` | yes | `boolean` | — |
| `regulatoryLag` | yes | `boolean` | — |
| `capexOverrun` | yes | `boolean` | — |
| `strandedAsset` | yes | `boolean` | — |
