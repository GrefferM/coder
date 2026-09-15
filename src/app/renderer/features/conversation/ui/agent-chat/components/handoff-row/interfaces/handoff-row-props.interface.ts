/** `reason` is why the handoff did not happen; `null` means it did. */
export interface HandoffRowProps {
  /** What this row is: handed on, not handed on, a question that never went, or a turn that never began. */
  word: string;
  /** `null` where nobody handed the work — a question of the person's own has no sender. */
  fromName: string | null;
  fromColor: string | null;
  name: string;
  color: string;
  reason: string | null;
}
