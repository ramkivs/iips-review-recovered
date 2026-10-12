/** Stable transport-level validation/unavailability error; independent of authentication. */
export class TransportError extends Error {
  constructor(
    readonly status: 400 | 403 | 404 | 405 | 422 | 503,
    message: string,
    readonly detail?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = 'TransportError';
  }
}
