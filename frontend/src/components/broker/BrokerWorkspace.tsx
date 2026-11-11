/**
 * Broker workspace — shared presentation primitives for the Broker Statement Import
 * (`/user-portfolios/import`) and Broker Holdings (`/broker-holdings`) surfaces.
 *
 * WHY THIS MODULE EXISTS
 *   The two broker surfaces were the last screens in the application still rendering as
 *   unstyled browser markup: no cards, no summary figures, no table treatment, no
 *   responsive behaviour and default UA controls. They are also two views over the SAME
 *   pipeline: Broker Holdings is the preview-only instance, Broker Statement Import hosts
 *   that same preview plus the guarded Stage 4 commit. Giving them one shared presentation
 *   layer is what makes them read as two rooms of one application rather than two products.
 *
 * WHAT THIS IS NOT
 *   It is presentation only. Nothing here resolves identity, computes a price, computes a
 *   weight, validates a file, authorizes a write or retains evidence. Every value it renders
 *   is one the pipeline or the transport already produced. There is no state and no I/O.
 *
 * DESIGN SYSTEM
 *   All visual values resolve through the frozen semantic tokens in `core/tokens`, exposed
 *   as CSS variables by `core/theme`. No literal colour appears here. Semantic colour is
 *   applied to a chip's border or a notice's left accent, never to body copy, so meaning is
 *   never carried by colour alone and never by a contrast pair below AA.
 *
 * ACCESSIBILITY
 *   Chips deliberately carry no ARIA role: they are decorative reinforcement of a label that
 *   is already in the text. Adding `role="status"` to a repeated chip would flood a live
 *   region and would break the single-status assertions the existing behaviour tests make.
 */
import type { ReactNode } from 'react';
import './BrokerWorkspace.css';

/* ------------------------------------------------------------------ *
 * Page shell and header
 * ------------------------------------------------------------------ */

export function BrokerPage({ children }: { readonly children: ReactNode }) {
  return <div className="bw-page">{children}</div>;
}

export function BrokerPageHeader({
  eyebrow,
  title,
  lede,
  meta,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly lede: ReactNode;
  readonly meta?: ReactNode;
}) {
  return (
    <header className="bw-header">
      {eyebrow !== undefined ? <p className="bw-header__eyebrow">{eyebrow}</p> : null}
      <h1 className="bw-header__title">{title}</h1>
      <p className="bw-header__lede">{lede}</p>
      {meta !== undefined ? <div className="bw-header__meta">{meta}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Panels
 * ------------------------------------------------------------------ */

export function BrokerPanel({
  eyebrow,
  title,
  hint,
  aside,
  footer,
  secondary = false,
  tight = false,
  children,
}: {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly hint?: ReactNode;
  readonly aside?: ReactNode;
  readonly footer?: ReactNode;
  readonly secondary?: boolean;
  readonly tight?: boolean;
  readonly children?: ReactNode;
}) {
  return (
    <section className={secondary ? 'bw-panel bw-panel--secondary' : 'bw-panel'}>
      <div className="bw-panel__head">
        {eyebrow !== undefined ? <p className="bw-panel__eyebrow">{eyebrow}</p> : null}
        <div className="bw-panel__headRow">
          <h2 className="bw-panel__title">{title}</h2>
          {aside !== undefined ? <div>{aside}</div> : null}
        </div>
        {hint !== undefined ? <p className="bw-panel__hint">{hint}</p> : null}
      </div>
      <div className={tight ? 'bw-panel__body bw-panel__body--tight' : 'bw-panel__body'}>{children}</div>
      {footer !== undefined ? <div className="bw-panel__foot">{footer}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Summary figures
 * ------------------------------------------------------------------ */

export function BrokerSummary({ children }: { readonly children: ReactNode }) {
  return <div className="bw-summary">{children}</div>;
}

export function BrokerSummaryItem({
  label,
  value,
  sub,
}: {
  readonly label: string;
  readonly value: ReactNode;
  readonly sub?: ReactNode;
}) {
  return (
    <div className="bw-summary__item">
      <span className="bw-summary__label">{label}</span>
      <span className="bw-summary__value">{value}</span>
      {sub !== undefined ? <span className="bw-summary__sub">{sub}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Chips
 * ------------------------------------------------------------------ */

export type ChipTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'critical' | 'informational';

export function BrokerChip({
  label,
  glyph,
  tone = 'neutral',
}: {
  readonly label: string;
  readonly glyph?: string;
  readonly tone?: ChipTone;
}) {
  return (
    <span className={`bw-chip bw-chip--${tone}`}>
      {glyph !== undefined ? (
        <span className="bw-chip__glyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Fact list
 * ------------------------------------------------------------------ */

export function BrokerFacts({ children }: { readonly children: ReactNode }) {
  return <dl className="bw-facts">{children}</dl>;
}

export function BrokerFact({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Notices
 * ------------------------------------------------------------------ */

export function BrokerNotice({
  tone = 'informational',
  title,
  glyph,
  alert = false,
  children,
}: {
  readonly tone?: 'informational' | 'warning' | 'critical' | 'positive';
  readonly title?: ReactNode;
  readonly glyph?: string;
  /**
   * Renders the notice as an alert. Reserved for an error the operator must act on: a
   * notice that merely explains a standing condition must not interrupt a screen reader.
   */
  readonly alert?: boolean;
  readonly children?: ReactNode;
}) {
  const defaultGlyph = tone === 'warning' ? '▲' : tone === 'critical' ? '!' : tone === 'positive' ? '✓' : 'i';
  return (
    <div
      role={alert ? 'alert' : undefined}
      className={tone === 'informational' ? 'bw-notice' : `bw-notice bw-notice--${tone}`}
    >
      <span className="bw-notice__glyph" aria-hidden="true">
        {glyph ?? defaultGlyph}
      </span>
      <div className="bw-notice__body">
        {title !== undefined ? <strong className="bw-notice__title">{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Disclosure
 * ------------------------------------------------------------------ */

export function BrokerDisclosure({
  summary,
  children,
  open = false,
}: {
  readonly summary: string;
  readonly children: ReactNode;
  readonly open?: boolean;
}) {
  return (
    <details className="bw-disclosure" open={open}>
      <summary>{summary}</summary>
      <div className="bw-disclosure__body">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */

export function BrokerButton({
  children,
  variant = 'secondary',
  size,
  ...rest
}: {
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = ['bw-btn'];
  if (variant === 'primary') classes.push('bw-btn--primary');
  if (variant === 'ghost') classes.push('bw-btn--ghost');
  if (size === 'sm') classes.push('bw-btn--sm');
  return (
    <button type="button" className={classes.join(' ')} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Formats list
 * ------------------------------------------------------------------ */

export function BrokerFormatItem({
  name,
  variant,
  detail,
}: {
  readonly name: string;
  readonly variant: string;
  readonly detail: string;
}) {
  return (
    <li>
      <span className="bw-formats__name">{name}</span>
      <span className="bw-formats__variant">{variant}</span>
      <span className="bw-formats__detail">{detail}</span>
    </li>
  );
}

export function BrokerFormatList({ children }: { readonly children: ReactNode }) {
  return <ul className="bw-formats">{children}</ul>;
}

/* ------------------------------------------------------------------ *
 * Step rail
 * ------------------------------------------------------------------ */

export function BrokerSteps({ children }: { readonly children: ReactNode }) {
  return <ol className="bw-steps">{children}</ol>;
}

export function BrokerStep({ title, hint }: { readonly title: string; readonly hint: string }) {
  return (
    <li>
      <span className="bw-steps__title">{title}</span>
      <span className="bw-steps__hint">{hint}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Loading affordance
 * ------------------------------------------------------------------ */

/**
 * A spinner plus a label. It carries no live-region role: it is decoration beside a label
 * the surrounding text already announces, and a repeated `role="status"` here would break
 * the single-status assertions the existing behaviour tests make.
 */
export function BrokerSpinner({ label }: { readonly label: string }) {
  return (
    <span className="bw-inline-status">
      <span className="bw-spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
