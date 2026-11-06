/**
 * IID-6 — the copy and formatting rules every investment surface shares.
 *
 * THREE RULES LIVE HERE, and they are rules rather than conventions because tests assert them across pages:
 *
 *   1  AN ABSENT VALUE IS NEVER A NUMBER. `notAvailable(reason)` renders `not available — <reason>`, and there is no
 *      fallback path that could produce `0`, `-`, `''` or a bare dash. A missing value that renders as zero is a
 *      fabricated fact, and the difference between "we did not measure it" and "it is zero" is the whole point of
 *      the limitation register.
 *   2  DIRECTION AND MATERIALITY ARE TEXT FIRST. Every badge carries a word and a symbol (`↑ WORSENED`,
 *      `CRITICAL`), so a reader who cannot see colour still gets the meaning, and a screen reader announces it.
 *   3  NOTHING HERE DECIDES ANYTHING. The helpers format server-supplied values; they never derive a materiality, a
 *      direction, a verb or a category, because a UI that re-derives a judgement can disagree with the report it is
 *      displaying.
 */

/** The one way an absent value is rendered. `reason` is a closed server vocabulary word or a local category. */
export function notAvailable(reason: string | null | undefined): string {
  const text = typeof reason === 'string' && reason.trim().length > 0 ? reason.trim() : 'not stated';
  return `not available — ${text}`;
}

export interface Observed<T = number> {
  readonly value: T | null;
  readonly presence?: string;
  readonly reason?: string;
  readonly note?: string;
}

/** Render an observation: its value when present, otherwise `not available — <reason>`. Never a substitute. */
export function observed(
  observation: Observed | null | undefined,
  format: (value: number) => string = (value) => value.toLocaleString('en-IN'),
): string {
  if (observation === null || observation === undefined) return notAvailable('not reported');
  if (observation.value === null || observation.value === undefined) {
    return notAvailable(observation.reason ?? observation.presence);
  }
  return format(observation.value);
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
}

export function formatRatio4(value: number): string {
  return value.toFixed(4);
}

export const MATERIALITY_COPY: Readonly<
  Record<string, { readonly word: string; readonly symbol: string; readonly tone: string }>
> = Object.freeze({
  IMMATERIAL: { word: 'IMMATERIAL', symbol: '·', tone: 'neutral' },
  NOTABLE: { word: 'NOTABLE', symbol: '±', tone: 'info' },
  MATERIAL: { word: 'MATERIAL', symbol: '▲', tone: 'warn' },
  CRITICAL: { word: 'CRITICAL', symbol: '▲▲', tone: 'bad' },
});

export const DIRECTION_COPY: Readonly<
  Record<string, { readonly word: string; readonly symbol: string; readonly tone: string }>
> = Object.freeze({
  IMPROVED: { word: 'IMPROVED', symbol: '↑', tone: 'ok' },
  WORSENED: { word: 'WORSENED', symbol: '↓', tone: 'bad' },
  INDETERMINATE: { word: 'INDETERMINATE', symbol: '?', tone: 'neutral' },
});

export const PRIORITY_COPY: Readonly<Record<string, { readonly word: string; readonly tone: string }>> = Object.freeze({
  NONE: { word: 'no review priority', tone: 'neutral' },
  LOW: { word: 'LOW', tone: 'info' },
  MEDIUM: { word: 'MEDIUM', tone: 'warn' },
  HIGH: { word: 'HIGH', tone: 'bad' },
});

export const CLASSIFICATION_COPY: Readonly<Record<string, string>> = Object.freeze({
  SUBSTANTIVE:
    'SUBSTANTIVE — at least one investment fact changed between these two stored versions. Read the items below; they name what moved.',
  GENERATION_METADATA_ONLY:
    'GENERATION_METADATA_ONLY — the two versions have the same substantive identity. Only generation metadata moved, so nothing here is an investment change.',
  FRESHNESS_TRANSITION:
    'FRESHNESS_TRANSITION — the only substantive movement is the statement-freshness verdict and the fields that depend on it. This is not a change in the underlying business or in the reported figures.',
});

export const ATTRIBUTION_COPY: Readonly<Record<string, string>> = Object.freeze({
  EXACT: 'EXACT — the observed difference is fully attributable to the data, and the additive check passed.',
  UNAVAILABLE:
    'UNAVAILABLE — the split between data and model could not be computed. No effect is estimated; only the observed deltas are shown.',
  NOT_APPLICABLE: 'NOT_APPLICABLE — this report type has no model leg to attribute.',
});

/** The disclosure that rides on every investment surface. Static text; never assembled from server prose. */
export const INVESTMENT_SURFACE_DISCLOSURES: readonly string[] = Object.freeze([
  'Decision support only. This is an investment assessment, not investment advice and not an instruction to transact.',
  'No trade execution: no order, quantity, price or brokerage action exists anywhere in this application.',
  'Non-production: single-user, local, decision-support use. No real issuer has been assessed through this pipeline.',
  'Every value shown is read from a stored artifact or a read model. Nothing on this page is recomputed in the browser.',
]);
