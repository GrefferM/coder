import type { AgentCatalogue } from "./agent-catalogue.interface";

/** The catalogue part used to turn an agent's ids into the names shown. */
export type AgentNaming = Pick<AgentCatalogue, "models" | "prompts" | "commands" | "servers" | "agents">;
