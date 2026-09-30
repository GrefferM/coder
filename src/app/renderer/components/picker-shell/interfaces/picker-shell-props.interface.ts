import type { RefObject, ReactNode } from "react";
import type { PickerLead } from "./picker-lead.interface";

/** Inputs of the shared shell; `headRow` renders under the lead and above the items, and receives the match count. */
export interface PickerShellProps<Item> {
  field: ReactNode;
  fieldColor: string;
  /** The field itself, so a card naming this place can focus it. */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  isInvalid?: boolean;
  isChanged?: boolean;
  items: Item[];
  matches: (item: Item, query: string) => boolean;
  row: (item: Item, close: () => void) => ReactNode;
  /** What Enter does on the current row; the same as a click on it. */
  choose?: (item: Item, close: () => void) => void;
  lead?: PickerLead;
  headRow?: (close: () => void, matchCount: number) => ReactNode;
  /** A row's group; when given, a head is drawn before the first row of each group that survives the search. */
  groupOf?: (item: Item) => string;
  head?: (group: string) => ReactNode;
  /**
   * Lets something outside the field open the list: every new value opens it again; `null` and `undefined` never do.
   */
  openedBy?: object | null;
  listMaxHeightPx?: number;
}
