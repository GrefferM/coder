/**
 * Note about a finished write or an outside change; `reason` is what stopped a write. A refusal is shown in red, leaves
 * by itself and offers no retry.
 */
export interface WriteNote {
  label: string;
  detail: string | null;
  reason: string | null;
  isRefusal: boolean;
}
