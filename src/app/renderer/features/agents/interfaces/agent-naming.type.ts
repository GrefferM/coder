import type { AgentCatalogue } from "./agent-catalogue.interface";

/**
 * The part of the catalogue a field's own words are read from: what an agent points at by id becomes the
 * name the person sees. Narrower than the whole catalogue on purpose — nothing here asks what a provider
 * answered or who the other agents are.
 */
export type AgentNaming = Pick<AgentCatalogue, "models" | "prompts" | "commands" | "servers" | "agents">;
