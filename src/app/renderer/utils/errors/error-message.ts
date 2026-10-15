export function errorMessage(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message;
  }

  return String(reason);
}
