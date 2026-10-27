import type { LinkOut } from "./link-out.interface";

/**
 * One line out of a turn as it is handed on: the link, its word where it is not taken, and what it carries — the
 * agent's answer, or what `pass_to` handed this agent; empty where it was handed nothing.
 */
export interface HandedLine extends LinkOut {
  text: string;
}
