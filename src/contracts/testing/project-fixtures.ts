import type { Agent, Link, ProjectCommand, ProjectConfig, ProjectModel, ProjectPrompt } from "../project";

/** Whole project-file shapes for specs, patched where a spec cares. */
export function anAgent(patch: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "Шукач",
    purpose: null,
    modelId: "model-1",
    promptId: null,
    tools: [],
    color: "#6fd3d8",
    isActive: true,
    waitsForAll: true,
    memory: "own",
    x: 100,
    y: 100,
    maxCalls: 8,
    temperature: 0,
    compressAt: 90,
    compressTo: 10,
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
    version: 3,
    name: "coder",
    models: [],
    prompts: [],
    commands: [],
    servers: [],
    agents: [],
    links: [],
    schedules: [],
    speech: {
      listenModelId: null,
    },
    ...patch,
  };
}

export function aModel(patch: Partial<ProjectModel> = {}): ProjectModel {
  return {
    id: "model-1",
    title: "deepseek-v4-flash",
    kind: "text",
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
