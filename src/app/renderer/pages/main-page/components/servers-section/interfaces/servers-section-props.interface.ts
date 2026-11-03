import type { OpenProject } from "../../../../../interfaces";
import type { ServerConsentState, ServerSection, ServersState } from "../../../../../features/servers";
import type { WayOut } from "../../../../../hooks/use-way-out/interfaces";

/** The MCP section: the catalogue and the form that declares a server into it. */
export interface ServersSectionProps {
  project: OpenProject;
  /** What each declared server said this time, and which are being asked now. */
  state: ServersState;
  /** «ЗАПУСТИТИ» goes through it, so a line not agreed to is asked about first. */
  consent: ServerConsentState;
  section: ServerSection;
  /** Opening or leaving the form asks about unsaved work first, as in every section. */
  wayOut: WayOut;
  onShowCall: (callId: string) => Promise<boolean>;
}
