import type { RefObject, ReactNode } from "react";
import type { PickerLead } from "./picker-lead.interface";

/** Inputs of the shared shell; `headRow` renders under the lead and above the items, and receives the match count. */
export interface PickerShellProps<Item> {
  field: ReactNode;
  fieldColor: string;
  /** The field itself, so a card that names this place can put the cursor on it. */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  isInvalid?: boolean;
  isChanged?: boolean;
  items: Item[];
  matches: (item: Item, query: string) => boolean;
  row: (item: Item, close: () => void) => ReactNode;
  /** What Enter does to the row the keyboard stands on: the same as a click on it. */
  choose?: (item: Item, close: () => void) => void;
  lead?: PickerLead;
  headRow?: (close: () => void, matchCount: number) => ReactNode;
  /**
   * Which group a row belongs to. Where it is given, a head is drawn before the first row of every
   * group that survived the search — the shell is the only one that knows what survived, so it is the only one
   * that can say where a group begins.
   */
  groupOf?: (item: Item) => string;
  head?: (group: string) => ReactNode;
  /**
   * Something outside the field may open this list — the press on the arc does. Every new value is a
   * new press and opens it again; `null` and `undefined` never open it, so a page that has none passes nothing.
   */
  openedBy?: object | null;
  listMaxHeightPx?: number;
}
