import type { ReactNode, Ref } from "react";

export interface FieldProps {
  label: string;
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  step?: number;
  placeholder?: string;
  note?: string;
  /** What the number is counted in, standing quietly at the box's right edge. */
  unit?: string;
  isMono?: boolean;
  /**
   * Whether the system dictionary reads this field. Off everywhere by default: a name, an identifier, an address, a
   * key or a line for the shell is not a word, and underlining it in red says a mistake where there is none. Only a
   * field the person writes for a reader turns it on.
   */
  isProse?: boolean;
  isInvalid?: boolean;
  /** What stands here will not work — said standing, and quieter than a refusal. */
  isWarned?: boolean;
  /** Stands at the label's right edge and says something about the value — where it goes, what it is. */
  action?: ReactNode;
  /** Sunk one shade, for a field standing inside a box painted the field's own colour. */
  isSunken?: boolean;
  wasValue?: string | null;
  /**
   * Offered only by a field standing behind a hint — a key this machine holds, which the field cannot
   * show. Pressing it is how such a value is taken off, and it is the one way to say so out loud.
   */
  onClear?: () => void;
}
