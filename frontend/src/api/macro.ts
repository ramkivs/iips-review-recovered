/**
 * Program v3.0 — NP-08 / D08 MACRO: typed `/api/macro` client (IRR side).
 *
 * Presentation/integration only. This client carries a governed D08 Macro
 * request to the IRR `/api/macro` route and returns what that route returned.
 * It never derives an indicator, never defaults a NIC-2 code, and never
 * substitutes a value.
 *
 * GOVERNANCE — carried, not expanded:
 *   - D08 boundary: NAS / CPI / IIP only.
 *   - MoSPI is designated for the governed NAS/CPI/IIP Macro scope; `source`
 *     remains a technical identifier echoed from the transport.
 *   - That designation does not establish entitlement, commercial use,
 *     redistribution, caching, or retention permission.
 *   - M-3 is NOT established. `provenance` carries CANDIDATE implementation
 *     dimensions only.
 *
 * NO-AUTH (D3 Option A): this client sends no credential and represents
 * nothing as authenticated. No `authFetch` wrapper is introduced, because the
 * authorized posture is unauthenticated and adding an auth layer would be an
 * unauthenticated→authenticated change outside the authorized scope.
 */
import type {
  CpiRecord,
  GovernedIipSelection,
  IipRecord,
  MacroCandidateProvenance,
  NasRecord,
} from '../../server/macro/mospi-source.js';

/** D08 Macro dataset boundary — mirrored, never extended here. */
export type MacroDataset = 'NAS' | 'CPI' | 'IIP';

export const MACRO_DATASETS: readonly MacroDataset[] = ['NAS', 'CPI', 'IIP'];

export const MACRO_ROUTE = {
  NAS: '/api/macro/nas',
  CPI: '/api/macro/cpi',
  IIP: '/api/macro/iip',
} as const;

/** Governed NAS indicators. Meaning is explicit, never positional. */
export const NAS_INDICATOR = {
  GVA: 'GVA',
  GDP: 'GDP',
} as const;

export type NasIndicatorSymbol = keyof typeof NAS_INDICATOR;

export interface MacroPagination {
  readonly pagesFetched: number;
  readonly expectedPages: number;
  readonly expectedRecords: number;
  readonly actualRecords: number;
  readonly duplicatesSuppressed: number;
}

export interface MacroResponse<T> {
  readonly dataset: MacroDataset;
  readonly source: string;
  readonly records: readonly T[];
  readonly pagination: MacroPagination;
  readonly provenance: MacroCandidateProvenance;
}

/**
 * IIP response. When no `subcategoryCode` is supplied the transport returns the
 * governed selection only, so `pagination`/`provenance` are optional here.
 */
export interface MacroIipResponse {
  readonly dataset: MacroDataset;
  readonly source: string;
  readonly selection: GovernedIipSelection;
  readonly records: readonly IipRecord[];
  readonly pagination?: MacroPagination;
  readonly provenance?: MacroCandidateProvenance;
}

export interface NasRequest {
  /** Governed indicator — must be explicit. */
  readonly indicator: NasIndicatorSymbol | number;
  readonly baseYear?: string;
  readonly series?: string;
  readonly frequencyCode?: string;
}

export interface IipRequest {
  readonly baseYear?: string;
  readonly frequency?: string;
  /** Omit to receive the runtime-resolved governed selection only. */
  readonly subcategoryCode?: string;
}

export interface CpiRequest {
  readonly baseYear?: string;
  readonly series?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`macro transport returned ${res.status}`);
  }
  return (await res.json()) as T;
}

function withQuery(route: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs === '' ? route : `${route}?${qs}`;
}

/** Request NAS observations for an explicitly governed indicator. */
export function fetchMacroNas(request: NasRequest, baseUrl = ''): Promise<MacroResponse<NasRecord>> {
  return getJson<MacroResponse<NasRecord>>(
    `${baseUrl}${withQuery(MACRO_ROUTE.NAS, {
      indicator: typeof request.indicator === 'number' ? undefined : request.indicator,
      indicatorCode: typeof request.indicator === 'number' ? String(request.indicator) : undefined,
      baseYear: request.baseYear,
      series: request.series,
      frequencyCode: request.frequencyCode,
    })}`,
  );
}

/** Request IIP observations, or the governed selection when no code is given. */
export function fetchMacroIip(request: IipRequest, baseUrl = ''): Promise<MacroIipResponse> {
  return getJson<MacroIipResponse>(
    `${baseUrl}${withQuery(MACRO_ROUTE.IIP, {
      baseYear: request.baseYear,
      frequency: request.frequency,
      subcategoryCode: request.subcategoryCode,
    })}`,
  );
}

/** Request CPI observations (CPI has its own base-year enumeration). */
export function fetchMacroCpi(request: CpiRequest, baseUrl = ''): Promise<MacroResponse<CpiRecord>> {
  return getJson<MacroResponse<CpiRecord>>(
    `${baseUrl}${withQuery(MACRO_ROUTE.CPI, {
      baseYear: request.baseYear,
      series: request.series,
    })}`,
  );
}
