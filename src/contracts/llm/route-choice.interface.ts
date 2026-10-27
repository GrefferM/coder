import type { RoutePass } from "./route-pass.interface";

/**
 * Where a turn's work goes by the agent's own commands; a turn that called none has none, and its answer goes down every
 * line.
 */
export interface RouteChoice {
  /** What `pass_to` handed on, one to each agent named, in the order they were first named; empty where none was called. */
  passes: RoutePass[];
  /** The agent ended the branch; whatever it passed still goes to those it named. */
  isFinished: boolean;
}
