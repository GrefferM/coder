import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainQuestions } from "./main-questions";
import { DELETE_AGENT_QUESTION } from "../../../../features/agents/ui/delete-agent-confirm/constants";
import { DELETE_COMMAND_QUESTION } from "../../../../features/commands/ui/delete-command-confirm/constants";
import { FORGET_RUN_QUESTION } from "../../../../features/record/ui/forget-run-confirm/constants";
import { RUN_DONE } from "../../../../features/record";
import type { MainQuestionsProps } from "./interfaces";
import type { OpenProject } from "../../../../interfaces";
import type { RunRow } from "../../../../features/record";
import { aCommand, aConfig } from "../../../../testing";

const AT = new Date(2026, 8, 4, 14, 0);

const project: OpenProject = {
  directory: "/code/coder",
  config: aConfig({
    name: "Coder",
  }),
  print: "print-1",
  view: null,
};

const run: RunRow = {
  id: "run-1",
  startedByAgentId: "agent-1",
  startedByAgentName: "Шукач",
  startedByAgentColor: "#6fd3d8",
  startedByScheduleId: null,
  askedAgentId: "agent-1",
  askedAgentName: "Шукач",
  asked: "Знайди md-файли",
  state: RUN_DONE,
  startedAt: AT,
  askedAt: AT,
  endedAt: AT,
  steps: 1,
  money: null,
  worked: 1_000,
};

/** Only the fields a standing question depends on. */
/** No consent window stands. */
const NO_CONSENT_ASKED = {
  asked: null,
  raise: vi.fn(),
  ask: vi.fn(),
  agree: vi.fn(async () => {}),
  decline: vi.fn(),
};

function props(patch: Record<string, unknown> = {}): MainQuestionsProps {
  return {
    project,
    file: {
      arrived: null,
      keepMine: vi.fn(),
      takeArrived: vi.fn(),
    },
    wayOut: {
      isHeld: false,
      unsaved: null,
      ask: null,
      guard: vi.fn(),
      stay: vi.fn(),
      saveAndLeave: vi.fn(async () => {}),
      discardAndLeave: vi.fn(),
    },
    agents: {
      doomedAgentId: null,
      confirmDelete: vi.fn(),
      dismissDelete: vi.fn(),
    },
    models: {
      armedModelId: null,
      confirmDelete: vi.fn(),
      dismissDelete: vi.fn(),
    },
    commands: {
      armedCommand: null,
      confirmDelete: vi.fn(),
      dismissDelete: vi.fn(),
    },
    servers: {
      armedServer: null,
      armedBurden: {
        grants: 0,
        agents: 0,
        hasToken: false,
        values: 0,
      },
      confirmDelete: vi.fn(),
      dismissDelete: vi.fn(),
    },
    schedules: {
      armedSchedule: null,
      confirmDelete: vi.fn(),
      dismissDelete: vi.fn(),
    },
    prompts: {
      armedPrompt: null,
      armedPromptAgents: [],
      editedPromptId: null,
      form: null,
      closeEditor: vi.fn(),
    },
    parts: {
      stream: {
        doomedRun: null,
        doomedRuns: null,
        forgetRun: vi.fn(async () => {}),
        dismissForget: vi.fn(),
        forgetAllRuns: vi.fn(async () => {}),
        dismissForgetAll: vi.fn(),
      },
      consent: NO_CONSENT_ASKED,
    },
    ...patch,
  } as unknown as MainQuestionsProps;
}

describe("MainQuestions", () => {
  it("stands nothing over the working area while nothing is armed", () => {
    const { container } = render(<MainQuestions {...props()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("stands the question whose own thing is armed, and only that one", () => {
    // Every question is over the same working area, so never two at once.
    const { rerender } = render(
      <MainQuestions
        {...props({
          agents: {
            doomedAgentId: "agent-1",
            confirmDelete: vi.fn(),
            dismissDelete: vi.fn(),
          },
        })}
      />,
    );

    expect(screen.getByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    expect(screen.queryByText(DELETE_COMMAND_QUESTION)).not.toBeInTheDocument();

    rerender(
      <MainQuestions
        {...props({
          commands: {
            armedCommand: aCommand({
              description: "",
              run: "",
            }),
            confirmDelete: vi.fn(),
            dismissDelete: vi.fn(),
          },
        })}
      />,
    );

    expect(screen.getByText(DELETE_COMMAND_QUESTION)).toBeInTheDocument();
    expect(screen.queryByText(DELETE_AGENT_QUESTION)).not.toBeInTheDocument();
  });

  it("takes the run's question from the stream, the record being the stream's own", () => {
    render(
      <MainQuestions
        {...props({
          parts: {
            stream: {
              doomedRun: run,
              doomedRuns: null,
              forgetRun: vi.fn(async () => {}),
              dismissForget: vi.fn(),
              forgetAllRuns: vi.fn(async () => {}),
              dismissForgetAll: vi.fn(),
            },
            consent: NO_CONSENT_ASKED,
          },
        })}
      />,
    );

    expect(screen.getByText(FORGET_RUN_QUESTION)).toBeInTheDocument();
  });

  it("stands the window of 36k over the server whose line waits, starting in the project's folder", () => {
    const base = props();

    render(
      <MainQuestions
        {...props({
          parts: {
            ...base.parts,
            consent: {
              ...NO_CONSENT_ASKED,
              asked: {
                id: "99999999-9999-4999-8999-999999999999",
                name: "exa-mcp",
                isLocal: true,
                run: "npx -y exa-mcp-server",
                address: "",
                signIn: "none",
                env: [],
              },
            },
          },
        })}
      />,
    );

    expect(screen.getByText("Запустити exa-mcp на цій машині?")).toBeInTheDocument();
    expect(screen.getByText(base.project.directory)).toBeInTheDocument();
  });
});
