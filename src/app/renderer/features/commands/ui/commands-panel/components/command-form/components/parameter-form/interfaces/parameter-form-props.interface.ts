import type { CommandParameter } from "../../../../../../../../../interfaces";

/** `parameter` is `null` for a new one; `onDraft` fires per keystroke. */
export interface ParameterFormProps {
  parameter: CommandParameter | null;
  /** The run line, so the card can see whether this slot is quoted on its own. */
  run: string;
  onSubmit: (parameter: CommandParameter) => void;
  onDraft: (parameter: CommandParameter) => void;
  onCancel: () => void;
}
