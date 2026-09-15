import { type ReactNode } from "react";
import { type SidePanelRealm } from "./side-panel-realm.type";

/** One rail item: button, panel content, unsaved flag, and scope — the rail draws a rule between the two scopes. */
export interface SidePanelItem {
  id: string;
  realm: SidePanelRealm;
  glyph: ReactNode;
  label: string;
  /** Something of this section's own, shown in the header. */
  pill?: ReactNode;
  count?: number;
  hasUnsaved?: boolean;
  content: ReactNode;
}
