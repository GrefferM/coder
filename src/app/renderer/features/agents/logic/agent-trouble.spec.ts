import { describe, expect, it } from "vitest";
import { agentTrouble } from "./agent-trouble";
import {
  TROUBLE_LOST_FUNCTION_LABEL,
  TROUBLE_LOST_PROMPT_LABEL,
  TROUBLE_NO_ADDRESS_LABEL,
  TROUBLE_NO_KEY_LABEL,
  TROUBLE_NO_MODEL_LABEL,
  TROUBLE_NO_PROMPT_LABEL,
  TROUBLE_NO_PROVIDER_LABEL,
  TROUBLE_PROVIDER_OFF_LABEL,
} from "../constants";
import { AGENT_FIELD_TEMPERATURE, MODEL_FIELD_ANSWER_CEILING, NOT_FILLED_LABEL } from "../../../constants";
import type { Agent, ProjectConfig, ProviderState } from "../../../interfaces";
import { NO_MCP_CALLS } from "../../../interfaces";
import { aConfig, aModel, aPrompt, anAgent } from "../../../testing";

const ANTHROPIC: ProviderState = {
  id: "anthropic",
  name: "Anthropic",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-ant-…4Kd",
  address: null,
  isOff: false,
};

const AGENT: Agent = anAgent({
  name: "EDITOR",
  promptId: "prompt-1",
  color: "#b18aff",
  x: 0,
  y: 0,
  temperature: 0.3,
});

const CONFIG: ProjectConfig = aConfig({
  models: [
    aModel({
      title: "claude-sonnet-4.5",
      provider: "anthropic",
      contextCeiling: 200000,
    }),
    aModel({
      id: "model-local",
      title: "qwen2.5-coder:0.5b",
      provider: "ollama",
      inputPrice: 0,
      outputPrice: 0,
      contextCeiling: 200000,
    }),
  ],
  prompts: [
    aPrompt({
      name: "Правки коду",
      text: "Ти правиш код.",
    }),
  ],
  agents: [AGENT],
});

describe("agentTrouble", () => {
  it("says nothing about an agent that can start", () => {
    expect(agentTrouble(AGENT, CONFIG, [ANTHROPIC])).toBeNull();
  });

  it("marks an agent whose provider this build does not know", () => {
    expect(agentTrouble(AGENT, CONFIG, [])).toEqual({
      label: TROUBLE_NO_PROVIDER_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent whose provider is turned off on this machine, before anything that provider lacks", () => {
    // Off and keyless at once: the person turned it off, so that is what is said.
    expect(
      agentTrouble(AGENT, CONFIG, [
        {
          ...ANTHROPIC,
          keyHint: null,
          isOff: true,
        },
      ]),
    ).toEqual({
      label: TROUBLE_PROVIDER_OFF_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent whose remote provider has no key on this machine", () => {
    expect(
      agentTrouble(AGENT, CONFIG, [
        {
          ...ANTHROPIC,
          keyHint: null,
        },
      ]),
    ).toEqual({
      label: TROUBLE_NO_KEY_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent whose provider asks for an address of its own and has none", () => {
    // RunPod's endpoint carries its id in the address: the key alone leaves no address.
    expect(
      agentTrouble(AGENT, CONFIG, [
        {
          ...ANTHROPIC,
          needs: ["key", "address"],
          takesTools: true,
          keyHint: "rpa_lon•••",
          isOff: false,
        },
      ]),
    ).toEqual({
      label: TROUBLE_NO_ADDRESS_LABEL,
      isBreak: true,
    });
  });

  it("marks nothing for a provider whose address is written, or one that has a customary one behind the field", () => {
    expect(
      agentTrouble(AGENT, CONFIG, [
        {
          ...ANTHROPIC,
          needs: ["key", "address"],
          takesTools: true,
          keyHint: "rpa_lon•••",
          address: "https://api.runpod.ai/v2/q7w2e9r4t6y1u3/openai/v1",
          isOff: false,
        },
      ]),
    ).toBeNull();
  });

  it("marks an agent whose model is gone from the project", () => {
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          modelId: "model-gone",
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: TROUBLE_NO_MODEL_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent holding a grant whose command is gone", () => {
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "command",
              commandId: "command-gone",
              pinned: {},
            },
          ],
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: TROUBLE_LOST_FUNCTION_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent holding a grant on a server the project no longer names", () => {
    // Every broken grant gets the same word.
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          tools: [
            {
              id: "grant-1",
              source: "mcp",
              serverId: "server-gone",
              functionName: "fs.write_file",
            },
          ],
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: TROUBLE_LOST_FUNCTION_LABEL,
      isBreak: true,
    });
  });

  it("marks nothing while the server has not answered, and marks it once it has", () => {
    // A server still starting has unknown functions, not gone ones: no trouble.
    const server = {
      id: "server-1",
      name: "playwright-mcp",
      isLocal: true,
      run: "npx -y @playwright/mcp@latest",
      address: "",
      signIn: <const>"none",
      env: [],
    };
    const armed = <Agent>{
      ...AGENT,
      tools: [
        {
          id: "grant-1",
          source: "mcp",
          serverId: "server-1",
          functionName: "browser_navigate",
        },
      ],
    };
    const config = <ProjectConfig>{
      ...CONFIG,
      servers: [server],
    };

    expect(agentTrouble(armed, config, [ANTHROPIC], {})).toBeNull();
    expect(
      agentTrouble(armed, config, [ANTHROPIC], {
        "server-1": {
          serverId: "server-1",
          isUp: true,
          functions: [
            {
              name: "browser_click",
              description: "Натиснути",
              parameters: {},
            },
          ],
          answeredAt: 1_700_000_000_000,
          failure: null,
          changedAt: null,
          wasCount: null,
          calls: NO_MCP_CALLS,
        },
      }),
    ).toEqual({
      label: TROUBLE_LOST_FUNCTION_LABEL,
      isBreak: true,
    });
  });

  it("marks an agent whose model lacks a number, and names the field that is empty", () => {
    // The mark points at the row to fill, not just at the model.
    expect(
      agentTrouble(
        AGENT,
        <ProjectConfig>{
          ...CONFIG,
          models: [
            {
              ...CONFIG.models[0],
              answerCeiling: null,
            },
          ],
        },
        [ANTHROPIC],
      ),
    ).toEqual({
      label: `${NOT_FILLED_LABEL} · ${MODEL_FIELD_ANSWER_CEILING}`,
      isBreak: true,
    });
  });

  it("breaks on a prompt the project has lost, which is not the same as choosing none", () => {
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          promptId: "prompt-gone",
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: TROUBLE_LOST_PROMPT_LABEL,
      isBreak: true,
    });
  });

  it("breaks on the agent's own number as readily as on the model's, and names that field", () => {
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          temperature: null,
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: `${NOT_FILLED_LABEL} · ${AGENT_FIELD_TEMPERATURE}`,
      isBreak: true,
    });
  });

  it("says an agent on a bare model is a fact, not a break", () => {
    expect(
      agentTrouble(
        <Agent>{
          ...AGENT,
          promptId: null,
        },
        CONFIG,
        [ANTHROPIC],
      ),
    ).toEqual({
      label: TROUBLE_NO_PROMPT_LABEL,
      isBreak: false,
    });
  });
});
