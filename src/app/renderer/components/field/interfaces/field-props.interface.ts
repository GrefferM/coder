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
  /** What the number is counted in, at the box's right edge. */
  unit?: string;
  isMono?: boolean;
  /** Whether the system dictionary reads this field; off by default, on only for prose. */
  isProse?: boolean;
  isInvalid?: boolean;
  /** What stands here will not work; shown standing, quieter than a refusal. */
  isWarned?: boolean;
  /** At the label's right edge; says something about the value. */
  action?: ReactNode;
  /** Sunk one shade, for a field inside a box of the field's own colour. */
  isSunken?: boolean;
  wasValue?: string | null;
  /** Offered only by a field behind a hint, such as a held key the field cannot show; removes the value. */
  onClear?: () => void;
}
