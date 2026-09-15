/** Note about a finished write or an outside change; `reason` is what stopped a write. */
export interface WriteNote {
  label: string;
  detail: string | null;
  reason: string | null;
}
