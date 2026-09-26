/**
 * Note about a finished write or an outside change; `reason` is what stopped a write. A refusal is something the
 * app would not do: its reason is said in red and leaves by itself, with nothing to try again.
 */
export interface WriteNote {
  label: string;
  detail: string | null;
  reason: string | null;
  isRefusal: boolean;
}
