import type { OpenProject } from "../../../../../interfaces";
import type { ServerSection, ServersState } from "../../../../../features/servers";
import type { WayOut } from "../../../../../hooks/use-way-out/interfaces";

/** The MCP section — the catalogue, and the one form that declares a server into it. */
export interface ServersSectionProps {
  project: OpenProject;
  /** What each declared server said this time, and which of them are being asked right now. */
  state: ServersState;
  section: ServerSection;
  /** Opening or leaving the form asks about unsaved work first, as every other section does. */
  wayOut: WayOut;
  onShowCall: (callId: string) => void;
}
