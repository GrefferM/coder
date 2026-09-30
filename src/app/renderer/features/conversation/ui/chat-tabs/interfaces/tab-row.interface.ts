import type { ChatTab } from "./chat-tab.type";

/** One of the two tabs as its row needs it: which tab, its name, its dot. */
export interface TabRow {
  id: ChatTab;
  label: string;
  isNews: boolean;
}
