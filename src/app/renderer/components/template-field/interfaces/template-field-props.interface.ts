import type { TemplateSlot } from "./template-slot.interface";

/** Template line field; `slots` are the declared names offered on `{` and validated against. */
export interface TemplateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  note?: string;
  isInvalid?: boolean;
  wasValue?: string | null;
  slots?: TemplateSlot[];
}
