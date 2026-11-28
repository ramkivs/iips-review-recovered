# W10 fixture — captured identities-route item (Infosys)

`identities-route-item-infy.json` reproduces the actual item shape captured from
`GET /api/investment/coverage?asOf=` during host execution `STL-07-W10-20261126T105422Z`
(values reported from the inspected captured coverage response):

- `raw['securityIdentity.securityId']` = `ISIN:INE009A01021:EQ` (LITERAL dotted property name —
  the response has NO nested `raw.securityIdentity` object, NO `raw.isin`, NO `raw.exchange`)
- `raw['securityIdentity.isin']` = `INE009A01021`
- `raw.symbol` = `INFY`
- `binding.listingId` = `IN:NSE:INFY:EQ:EQUITY` (canonical listing ID per
  `iips-platform/src/investment/contracts/ids.ts` `parseListingId`:
  `IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>`)

Used by `STL-SCRIPTS-W10.Tests.ps1` (W10-10) to verify the W10 extraction logic against the
real captured shape, including the literal dotted property names.
