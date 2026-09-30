import { wouldMakeCycle } from "./would-make-cycle";
import type { Link } from "../../../interfaces";

/** Whether a link cannot be drawn: it would close a ring or already exists. */
export function cannotDrawLink(links: Link[], fromAgentId: string, toAgentId: string): boolean {
  return (
    wouldMakeCycle(links, fromAgentId, toAgentId) ||
    links.some((link) => link.from === fromAgentId && link.to === toAgentId)
  );
}
