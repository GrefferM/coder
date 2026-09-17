import { describe, expect, it } from "vitest";
import { wasAgent } from "./was-agent";
import { AGENT_ACTIVE_ON_LABEL, AGENT_NO_PROMPT_LABEL } from "../constants";
import type { AgentDraft, AgentNaming } from "../interfaces";
import type { ProjectModel, ProjectPrompt } from "../../../interfaces";
import { aDraft, aModel, aPrompt } from "../../../testing";

function draft(patch: Partial<AgentDraft> = {}): AgentDraft {
  return aDraft({
    name: "EDITOR",
    promptId: "prompt-1",
    color: "#b18aff",
    maxCalls: 10,
    temperature: 0.3,
    ...patch,
  });
}

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
    answerCeiling: 8000,
    inputPrice: null,
    outputPrice: null,
  }),
];

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Редактор",
    file: "prompts/editor.md",
    text: "",
  }),
];

/** The catalogues a field's words are read from — an id becomes the name the person sees. */
const NAMING: AgentNaming = {
  models: MODELS,
  prompts: PROMPTS,
  commands: [],
  servers: [],
};

describe("wasAgent", () => {
  it("says nothing about an agent that has never been saved", () => {
    const was = wasAgent(draft(), null, NAMING);

    expect(Object.values(was).every((word) => word === null)).toBe(true);
  });

  it("says nothing about a field standing as it was saved", () => {
    const saved = draft();

    expect(wasAgent(draft(), saved, NAMING)).toEqual({
      name: null,
      model: null,
      prompt: null,
      commandTools: null,
      serverTools: null,
      color: null,
      maxCalls: null,
      temperature: null,
      isActive: null,
    });
  });

  it("says what a changed field was, in the words its own field shows", () => {
    // A model and a prompt by their names, the numbers as they are written, the switch as its own word.
    const was = wasAgent(
      draft({
        name: "REVIEWER",
        promptId: null,
        maxCalls: 12,
        isActive: false,
      }),
      draft(),
      NAMING,
    );

    expect(was.name).toBe("EDITOR");
    expect(was.prompt).toBe("Редактор");
    expect(was.maxCalls).toBe("10");
    // The word says what the field WAS: the draft switched the agent off, so it stood on.
    expect(was.isActive).toBe(AGENT_ACTIVE_ON_LABEL);
  });

  it("names a prompt the project no longer has by the word for none at all", () => {
    const was = wasAgent(
      draft({
        promptId: "prompt-1",
      }),
      draft({
        promptId: "prompt-gone",
      }),
      NAMING,
    );

    expect(was.prompt).toBe(AGENT_NO_PROMPT_LABEL);
  });

  it("says what each tool field was on its own, so a command never stands under «MCP»", () => {
    const saved = draft({
      tools: [
        {
          id: "grant-command",
          source: "command",
          commandId: "command-1",
          pinned: [],
        },
      ],
    });
    const was = wasAgent(
      draft({
        tools: [
          {
            id: "grant-command",
            source: "command",
            commandId: "command-1",
            pinned: [],
          },
          {
            id: "grant-server",
            source: "mcp",
            serverId: "server-1",
            functionName: "search",
          },
        ],
      }),
      saved,
      NAMING,
    );

    // Only the server's field moved, so only it says what it was — and it says nothing of the command.
    expect(was.commandTools).toBe(null);
    expect(was.serverTools).toBe("без інструментів");
  });
});
