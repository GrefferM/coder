import type { Agent, Link, ProjectCommand, ProjectConfig, ProjectModel, ProjectPrompt } from "../interfaces";
import type { AgentDraft } from "../features/agents";

/**
 * The shapes of the project file, built whole for a spec and patched where the spec cares. A field added to any of
 * them lands here once instead of in every spec that happens to name that shape.
 */
export function anAgent(patch: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "Шукач",
    modelId: "model-1",
    promptId: null,
    tools: [],
    color: "#6fd3d8",
    isActive: true,
    waitsForAll: true,
    x: 100,
    y: 100,
    maxCalls: 8,
    temperature: 0,
    ...patch,
  };
}

export function aModel(patch: Partial<ProjectModel> = {}): ProjectModel {
  return {
    id: "model-1",
    title: "deepseek-v4-flash",
    provider: "openrouter",
    inputPrice: 3,
    outputPrice: 15,
    contextCeiling: 700_000,
    answerCeiling: 4_096,
    ...patch,
  };
}

export function aPrompt(patch: Partial<ProjectPrompt> = {}): ProjectPrompt {
  return {
    id: "prompt-1",
    name: "Шукати",
    file: "prompts/prompt-1.md",
    text: "Знайди що просять.",
    ...patch,
  };
}

export function aCommand(patch: Partial<ProjectCommand> = {}): ProjectCommand {
  return {
    id: "command-1",
    name: "open_pr",
    description: "Відкриває pull request",
    run: "gh pr create",
    parameters: [],
    ...patch,
  };
}

export function aLink(patch: Partial<Link> = {}): Link {
  return {
    id: "link-1",
    from: "agent-1",
    to: "agent-2",
    ...patch,
  };
}

export function aConfig(patch: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    version: 1,
    name: "coder",
    models: [],
    prompts: [],
    commands: [],
    servers: [],
    agents: [],
    links: [],
    ...patch,
  };
}

/** The agent as the settings tab edits it: everything an agent is bar where it stands and which it is. */
export function aDraft(patch: Partial<AgentDraft> = {}): AgentDraft {
  const { id: _id, x: _x, y: _y, ...draft } = anAgent();

  return {
    ...draft,
    ...patch,
  };
}
