/** Human-readable message from a `catch`'s `unknown`. */
export function errorMessage(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message;
  }

  return String(reason);
}
