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
