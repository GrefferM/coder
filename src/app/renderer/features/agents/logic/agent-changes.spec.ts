import { describe, expect, it } from "vitest";
import { agentChanges } from "./agent-changes";
import {
  AGENT_NAME_CHANGE_LABEL,
  AGENT_NAME_DROPPED_LABEL,
  AGENT_NO_PROMPT_LABEL,
  AGENT_PROMPT_CHANGE_LABEL,
  AGENT_PROMPT_DROPPED_LABEL,
  AGENT_MEMORY_CHANGE_LABEL,
  AGENT_ROUTE_CHANGE_LABEL,
  AGENT_ROUTE_DROPPED_LABEL,
  AGENT_ROUTE_OFF_LABEL,
  AGENT_ROUTE_ON_LABEL,
  AGENT_MEMORY_DROPPED_LABEL,
  AGENT_MEMORY_WORDS,
  AGENT_COMPRESS_AT_CHANGE_LABEL,
  AGENT_COMPRESS_TO_CHANGE_LABEL,
} from "../constants";
import type { ProjectCommand, ProjectModel, ProjectPrompt } from "../../../interfaces";
import type { AgentDraft, AgentNaming } from "../interfaces";
import { aDraft, aModel, aPrompt } from "../../../testing";
import type { ProjectMcpServer } from "../../../interfaces";

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
];

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Рев'ювер",
    file: "prompts/reviewer.md",
    text: "Читай уважно.",
  }),
];

const COMMANDS: ProjectCommand[] = [];

const SAVED: AgentDraft = aDraft({
  name: "EDITOR",
  promptId: "prompt-1",
  color: "#b18aff",
  maxCalls: 5,
  temperature: 0.3,
});

const SERVERS: ProjectMcpServer[] = [];

/** The catalogues a diff line's words are read from. */
const NAMING: AgentNaming = {
  models: MODELS,
  prompts: PROMPTS,
  commands: COMMANDS,
  servers: SERVERS,
  agents: [],
};

describe("agentChanges", () => {
  it("says nothing moved while the draft still holds what is saved", () => {
    expect(agentChanges(SAVED, SAVED, NAMING)).toEqual([]);
  });

  it("names only the field that moved, and both its sides", () => {
    expect(
      agentChanges(
        SAVED,
        {
          ...SAVED,
          name: "REVIEWER",
        },
        NAMING,
      ),
    ).toEqual([
      {
        label: AGENT_NAME_CHANGE_LABEL,
        droppedLabel: AGENT_NAME_DROPPED_LABEL,
        was: "EDITOR",
        now: "REVIEWER",
      },
    ]);
  });

  it("names the route turned on by both its words", () => {
    expect(
      agentChanges(
        SAVED,
        {
          ...SAVED,
          choosesRoute: true,
        },
        NAMING,
      ),
    ).toEqual([
      {
        label: AGENT_ROUTE_CHANGE_LABEL,
        droppedLabel: AGENT_ROUTE_DROPPED_LABEL,
        was: AGENT_ROUTE_OFF_LABEL,
        now: AGENT_ROUTE_ON_LABEL,
      },
    ]);
  });

  it("names the memory turned off by both its words", () => {
    expect(
      agentChanges(
        SAVED,
        {
          ...SAVED,
          memory: "none",
        },
        NAMING,
      ),
    ).toEqual([
      {
        label: AGENT_MEMORY_CHANGE_LABEL,
        droppedLabel: AGENT_MEMORY_DROPPED_LABEL,
        was: AGENT_MEMORY_WORDS.own,
        now: AGENT_MEMORY_WORDS.none,
      },
    ]);
  });

  it("names a prompt by its name, and having none in words", () => {
    expect(
      agentChanges(
        SAVED,
        {
          ...SAVED,
          promptId: null,
        },
        NAMING,
      ),
    ).toEqual([
      {
        label: AGENT_PROMPT_CHANGE_LABEL,
        droppedLabel: AGENT_PROMPT_DROPPED_LABEL,
        was: "Рев'ювер",
        now: AGENT_NO_PROMPT_LABEL,
      },
    ]);
  });

  it("names a model no longer in the project by its id, since there is no title to show", () => {
    const changes = agentChanges(
      SAVED,
      {
        ...SAVED,
        modelId: "model-gone",
      },
      NAMING,
    );

    const [change] = changes;

    expect(changes).toHaveLength(1);
    expect(change.now).toBe("model-gone");
  });

  it("counts every field that differs, without the ones that still match", () => {
    expect(
      agentChanges(
        SAVED,
        {
          ...SAVED,
          name: "REVIEWER",
          color: "#7ad1ff",
          isActive: false,
          maxCalls: 9,
          temperature: 0.9,
        },
        NAMING,
      ),
    ).toHaveLength(5);
  });

  it("names the compression's two numbers as percents where the memory is kept", () => {
    const changes = agentChanges(
      SAVED,
      {
        ...SAVED,
        compressAt: 80,
        compressTo: 20,
      },
      NAMING,
    );

    expect(changes.map((change) => [change.label, change.was, change.now])).toEqual([
      [AGENT_COMPRESS_AT_CHANGE_LABEL, "90 %", "80 %"],
      [AGENT_COMPRESS_TO_CHANGE_LABEL, "10 %", "20 %"],
    ]);
  });

  it("leaves the compression out where the memory is off, since its rows are not on the screen", () => {
    expect(
      agentChanges(
        {
          ...SAVED,
          memory: "none",
        },
        {
          ...SAVED,
          memory: "none",
          compressAt: 80,
        },
        NAMING,
      ),
    ).toEqual([]);
  });
});
