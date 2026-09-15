import type { ReactNode } from "react";

/** The choice that stands above the items and is none of them, walked as the first row. */
export interface PickerLead {
  row: (close: () => void) => ReactNode;
  choose: (close: () => void) => void;
}
