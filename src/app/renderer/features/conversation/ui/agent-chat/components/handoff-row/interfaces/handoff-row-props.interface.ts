/** `reason` is why the handoff did not happen; `null` means it did. */
export interface HandoffRowProps {
  /** What the row is: handed on, not handed on, a question that never went, or a turn that never began. */
  word: string;
  /** `null` when nobody handed the work (the person's own question). */
  fromName: string | null;
  fromColor: string | null;
  name: string;
  color: string;
  reason: string | null;
}
