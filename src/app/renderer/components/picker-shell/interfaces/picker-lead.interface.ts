import type { ReactNode } from "react";

/** A choice above the items that is none of them; walked as the first row. */
export interface PickerLead {
  row: (close: () => void) => ReactNode;
  choose: (close: () => void) => void;
}
