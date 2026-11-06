/**
 * IID-6 — the small, static building blocks every investment surface uses for its honest states.
 *
 * These are presentation-only. None of them fetches, derives a value, or decides what a page should say: a page
 * passes in copy that is already fixed, and these render it accessibly. Keeping them here means the same sentence
 * ("not available — <reason>") cannot drift between the assessment, disposition, change and coverage surfaces.
 */
import type { ReactNode } from 'react';

import { DIRECTION_COPY, MATERIALITY_COPY, notAvailable, PRIORITY_COPY } from './investmentCopy';

/** A badge whose meaning is in its TEXT and its symbol, never in its colour. `tone` is a styling hint only. */
export function Badge({ tone, children }: { readonly tone: string; readonly children: ReactNode }): JSX.Element {
  return (
    <span className={`badge badge-${tone}`} data-tone={tone}>
      {children}
    </span>
  );
}

/** Materiality, rendered as `▲ MATERIAL`. The symbol and the word both come from the copy table. */
export function MaterialityBadge({ level }: { readonly level: string }): JSX.Element {
  const copy = MATERIALITY_COPY[level] ?? { word: level, symbol: '', tone: 'neutral' };
  return (
    <Badge tone={copy.tone}>
      <span aria-hidden="true">{copy.symbol} </span>
      {copy.word}
    </Badge>
  );
}

/** Direction, rendered as `↓ WORSENED`. Colour is an accent; the arrow and the word carry the meaning. */
export function DirectionBadge({ direction }: { readonly direction: string }): JSX.Element {
  const copy = DIRECTION_COPY[direction] ?? { word: direction, symbol: '', tone: 'neutral' };
  return (
    <Badge tone={copy.tone}>
      <span aria-hidden="true">{copy.symbol} </span>
      {copy.word}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { readonly priority: string }): JSX.Element {
  const copy = PRIORITY_COPY[priority] ?? { word: priority, tone: 'neutral' };
  return <Badge tone={copy.tone}>{copy.word}</Badge>;
}

/**
 * An absent value, rendered exactly as `not available — <reason>`.
 *
 * The reason is required in practice: a caller with no reason passes a category word, and the formatter supplies
 * "not stated" rather than leaving a bare dash. A dash is ambiguous (zero? not applicable? not read?), and this
 * application does not use ambiguous marks for absent numbers.
 */
export function AbsentValue({ reason }: { readonly reason?: string | null }): JSX.Element {
  return (
    <span className="absent-value" data-absent="true">
      {notAvailable(reason ?? null)}
    </span>
  );
}

/** A value that may be absent: the number when present, otherwise `AbsentValue`. */
export function ValueOrAbsent({
  value,
  reason,
  format,
}: {
  readonly value: number | null | undefined;
  readonly reason?: string | null;
  readonly format?: (value: number) => string;
}): JSX.Element {
  if (value === null || value === undefined) return <AbsentValue reason={reason ?? null} />;
  return <>{format === undefined ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : format(value)}</>;
}

/**
 * A degraded state: static, sanitized, and informative about what did NOT happen.
 *
 * `detail` is local fixed copy passed by the caller — never server text. `role="status"` rather than `alert` for
 * "nothing is available" (an expected state); pages use `alert` only for a failed read they could not classify.
 */
export function UnavailableNotice({
  title,
  message,
  detail,
  alert = false,
}: {
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly alert?: boolean;
}): JSX.Element {
  return (
    <section className="investment-unavailable" aria-labelledby={`unavailable-${title.replace(/\s+/g, '-')}`}>
      <h3 id={`unavailable-${title.replace(/\s+/g, '-')}`}>{title}</h3>
      <p role={alert ? 'alert' : 'status'}>{message}</p>
      <p className="muted">
        {detail ??
          'Nothing is substituted for a value that could not be read: no cached value, no client-side recomputation and no fallback store.'}
      </p>
    </section>
  );
}

/** A section with a stable heading id, so `aria-labelledby` wiring cannot drift per page. */
export function SurfaceSection({
  id,
  title,
  description,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <section aria-labelledby={`${id}-heading`} id={id}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {description === undefined ? null : <p className="muted">{description}</p>}
      {children}
    </section>
  );
}

/**
 * The read-only disclosure every surface repeats.
 *
 * It is a component so a new page cannot forget it, and it is `role="note"` so a screen-reader user meets it as a
 * note rather than as content they must read as part of the analysis.
 */
export function ReadOnlyDisclosure(): JSX.Element {
  return (
    <p className="investment-disclosure" role="note">
      Read-only surface · decision support only · no trade execution · no order, quantity or price is published here.
    </p>
  );
}
