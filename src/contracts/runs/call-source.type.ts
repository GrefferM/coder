import type { ToolSource } from "../project";

/**
 * Where a call of a turn went: to a tool the agent was granted, or to the app itself, which is `route` where the agent
 * chose where its answer goes. A route is no grant, so it is no `ToolSource`.
 */
export type CallSource = ToolSource | "route";
