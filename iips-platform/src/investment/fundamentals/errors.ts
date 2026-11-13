/** IID-0 — dataset errors. Every one of these fails closed: no partial read, no repaired value. */
export class DatasetIntegrityError extends Error {
  constructor(
    message: string,
    readonly detail: {
      readonly file?: string;
      readonly expected?: string;
      readonly actual?: string;
      readonly recomputedDigest?: string;
    } = {},
  ) {
    super(message);
    this.name = 'DatasetIntegrityError';
  }
}

export class DatasetMissingError extends Error {
  constructor(message: string, readonly dataDir: string) {
    super(message);
    this.name = 'DatasetMissingError';
  }
}

/**
 * A dataset publication that could not be completed (`S3-D2`, publication safety).
 *
 * Always thrown with the destination intact or recoverable: the writer never modifies a dataset file in place,
 * so at the moment this is raised the pre-existing dataset is either still at `datasetDir` or preserved whole
 * under the `previous` marker named in the message. `stage` says which step of the publication failed, and
 * `injected` distinguishes a test's deliberate fault from a real filesystem error.
 */
export class DatasetPublicationError extends Error {
  constructor(
    message: string,
    readonly detail: {
      readonly datasetDir?: string;
      readonly stage?: string;
      readonly file?: string;
      readonly markers?: readonly string[];
      readonly injected?: boolean;
    } = {},
  ) {
    super(message);
    this.name = 'DatasetPublicationError';
  }
}
