import type { ChatTab } from "./chat-tab.type";

/** One of the two tabs, as the row that draws it needs it: which tab, what it is called, and its dot. */
export interface TabRow {
  id: ChatTab;
  label: string;
  isNews: boolean;
}
