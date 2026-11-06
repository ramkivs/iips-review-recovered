/**
 * `L-036` review control — the `POLICY_ZERO` clock.
 *
 * The bridge substitutes zero for an associates/JV carrying value that no dataset schema could hold, and it says
 * so in the payload. Saying so is not the same as resolving it: the authorized policy (2026-11-06) therefore keeps
 * `associates-treatment/1.0.0` and adds one obligation — if the carrying value is still unavailable after 180
 * calendar days, the assessment must **flag the treatment for review**.
 *
 * Three rules make the flag trustworthy, and each has a test:
 *
 *   1. **The clock starts at the evidence, not at the run.** `clockStart` is the dataset's newest balance-sheet
 *      instant — the date the bridge's inputs belong to. `asOf` is the assessment clock the age is measured
 *      against, which the engine takes from its caller, never from the wall clock.
 *
 * **THE PERSISTED BLOCK IS CLOCK-FREE, AND THAT IS DELIBERATE.** `assessAssociatesReview` computes the age
 * (`elapsedDays`) and the status; `describeAssociatesReview` publishes the block WITHOUT `elapsedDays` or `asOf`,
 * because both are pure functions of the execution clock. A payload member that moves every midnight would mint a
 * version on every re-run, which is exactly the defect `assessment-substantive-identity/1` closes (L-014, AC-L14.1
 * and AC-L14.2). The age therefore travels as `clockStart` + `reviewDueOn` + `reviewAgeDays` in the payload and is
 * derived at render time from those and the report's own `asOf` (see `explain`/`view`); the status stays in the
 * payload because it is a policy verdict on the evidence — like `asOf.staleBeyondPolicy` — and moves only when the
 * review crosses its date, which is a disclosure change worth one version.
 *   2. **A missing or unparseable date escalates.** It is never read as "not due": an age that cannot be computed
 *      is exactly the case where a silent pass would hide the problem.
 *   3. **The flag is inert.** It changes no carrying value, converts no unavailable figure into a nil, applies no
 *      confidence penalty and moves no valuation output. `reviewRequired` is a prompt for the owner to obtain
 *      current issuer evidence or to reconsider the policy — it is not a number and not a verdict.
 */
import type { AssociatesJVReview, AssociatesReviewAssessment } from './types';

export interface AssociatesReviewPolicy {
  readonly policyVersion: string;
  readonly reviewAgeDays: number;
}

export interface AssociatesReviewInput {
  /** The bridge treatment actually applied. */
  readonly treatment: 'CARRYING_VALUE_REPORTED' | 'DECLARED_NIL' | 'POLICY_ZERO_UNAVAILABLE';
  /** Treatment policy version recorded by the bridge (`associates-treatment/1.0.0`). */
  readonly treatmentPolicyVersion: string;
  /** The source-evidence date: the newest balance-sheet instant in the dataset, or null when there is none. */
  readonly clockStart: string | null;
  /** The assessment clock. */
  readonly asOf: string;
  readonly policy: AssociatesReviewPolicy;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse a `YYYY-MM-DD` or full ISO timestamp to a UTC day number, or null when it is not a valid date. */
function utcDay(value: string | null): number | null {
  if (value === null) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(stamp)) return null;
  // Reject an impossible date that `Date.UTC` would roll over (2024-02-31 → 2024-03-02).
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return Math.floor(stamp / DAY_MS);
}

/** Whole calendar days from `from` to `to`; null when either date is unusable. */
export function calendarDaysBetween(from: string | null, to: string | null): number | null {
  const start = utcDay(from);
  const end = utcDay(to);
  if (start === null || end === null) return null;
  return end - start;
}

/** `from + days`, rendered as `YYYY-MM-DD`; null when the input is unusable. */
export function addCalendarDays(from: string | null, days: number): string | null {
  const start = utcDay(from);
  if (start === null) return null;
  return new Date((start + days) * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Assess the review control, age included. Deterministic: identical inputs give an identical result, and the only
 * dates that matter are supplied by the caller. This is the form the boundary tests assert and the form the
 * rendered narrative derives its day count from.
 */
export function assessAssociatesReview(input: AssociatesReviewInput): AssociatesReviewAssessment {
  const { policy } = input;
  const reviewAgeDays = policy.reviewAgeDays;
  const startDay = utcDay(input.clockStart);
  const elapsedDays = calendarDaysBetween(input.clockStart, input.asOf);
  const reviewDueOn = addCalendarDays(input.clockStart, reviewAgeDays);
  const base = {
    reviewPolicyVersion: policy.policyVersion,
    treatmentPolicyVersion: input.treatmentPolicyVersion,
    reviewAgeDays,
    clockStart: input.clockStart,
    // A date that cannot be parsed is as unavailable as a missing one: the basis must not claim a period it cannot read.
    clockStartBasis: (startDay === null ? 'UNAVAILABLE' : 'DATASET_PERIOD_END') as AssociatesJVReview['clockStartBasis'],
    reviewDueOn,
    asOf: input.asOf,
    elapsedDays,
  };

  // A value (or a disclosed nil) resolves the question the flag exists to keep open, so there is nothing to review.
  if (input.treatment === 'CARRYING_VALUE_REPORTED') {
    return {
      ...base,
      treatment: 'CARRYING_VALUE_REPORTED',
      status: 'NOT_APPLICABLE',
      reviewRequired: false,
      reason:
        'The dataset carries a filed associates/JV carrying value, so the bridge uses it and no review of the POLICY_ZERO treatment is outstanding.',
    };
  }
  if (input.treatment === 'DECLARED_NIL') {
    return {
      ...base,
      treatment: 'DECLARED_NIL',
      status: 'NOT_APPLICABLE',
      reviewRequired: false,
      reason:
        'The filer declared the associates/JV balance nil in words, with its filing reference and period, so the zero is the issuer’s and no policy substitution is outstanding.',
    };
  }
  if (elapsedDays === null) {
    return {
      ...base,
      treatment: 'POLICY_ZERO',
      status: 'CLOCK_UNAVAILABLE',
      reviewRequired: true,
      reason:
        'The source-evidence date for the associates/JV term is missing or not a valid calendar date, so the 180-day review clock cannot be computed. The treatment is flagged for review rather than assumed not due, because an age that cannot be measured is exactly what the control exists to surface.',
    };
  }
  if (elapsedDays >= reviewAgeDays) {
    return {
      ...base,
      treatment: 'POLICY_ZERO',
      status: 'REVIEW_DUE',
      reviewRequired: true,
      reason: `The associates/JV carrying value has been unavailable since the evidence date ${input.clockStart}, and the ${reviewAgeDays}-day treatment review fell due on ${reviewDueOn}. The owner must obtain current issuer evidence for the carrying value, or explicitly reconsider the POLICY_ZERO treatment; the flag itself changes no value, no nil and no confidence.`,
    };
  }
  return {
    ...base,
    treatment: 'POLICY_ZERO',
    status: 'NOT_DUE',
    reviewRequired: false,
    reason: `The associates/JV carrying value has been unavailable since the evidence date ${input.clockStart}; the ${reviewAgeDays}-day treatment review is not due until ${reviewDueOn}.`,
  };
}

/**
 * The review control as it is PERSISTED: the assessed block minus the two members that are pure functions of the
 * execution clock (`asOf`, `elapsedDays`). See the module note: a clock member in the payload would mint a version
 * on every midnight re-run, which is the defect the substantive-identity grammar exists to prevent.
 *
 * Nothing is lost from the disclosure: `clockStart`, `reviewAgeDays`, `reviewDueOn`, `status` and `reason` are all
 * clock-free and all published, and a reader recovers the age from `clockStart` and the report's own `asOf`.
 */
export function describeAssociatesReview(input: AssociatesReviewInput): AssociatesJVReview {
  const { asOf: _asOf, elapsedDays: _elapsedDays, ...block } = assessAssociatesReview(input);
  return block;
}
