import { ukrainianPlural } from "../../../utils/text";
import { SERVERS_FORMS, SERVERS_OF_JOIN, SERVER_HELD_JOIN } from "../constants";

/** «2 з 3 серверів» — how many of the project's servers this agent is connected to. */
export function connectedLabel(connected: number, of: number): string {
  const [one, few, many] = SERVERS_FORMS;

  return `${connected}${SERVERS_OF_JOIN}${of} ${ukrainianPlural(of, one, few, many)}`;
}

/** «5 з 24» — how much of what a server hands over this agent holds. */
export function heldLabel(held: number, of: number): string {
  return `${held}${SERVER_HELD_JOIN}${of}`;
}
