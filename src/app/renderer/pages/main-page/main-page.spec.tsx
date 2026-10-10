import { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MainPage } from "./main-page";
import { missingFieldsNote } from "../../features/agents";
import { COMMAND_DESCRIPTION_DROPPED_LABEL, COMMAND_RUN_DROPPED_LABEL } from "../../features/commands/constants";
import {
  RIGHT_SIDE_PANEL_WIDTH_PX,
  AGENTS_PANEL_LABEL,
  CHAT_PANEL_LABEL,
  CHAT_SECTION_ID,
  COMMANDS_PANEL_LABEL,
  MODELS_PANEL_LABEL,
  MODELS_SECTION_ID,
  PROMPTS_PANEL_LABEL,
} from "./constants";
import { PROMPTS_PANEL_NEW_LABEL } from "../../features/prompts/ui/prompts-panel/constants";
import {
  COMMANDS_PANEL_DECLARE_LABEL,
  COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL,
  COMMANDS_PANEL_NAME_FIELD_LABEL,
  COMMANDS_PANEL_NEW_LABEL,
  COMMANDS_PANEL_RUN_FIELD_LABEL,
} from "../../features/commands/ui/commands-panel/constants";
import { COMMAND_ROW_DELETE_LABEL } from "../../features/commands/ui/commands-panel/components/command-row/constants";
import {
  COMMAND_FORM_ADD_PARAMETER_LABEL,
  PARAMETER_FORM_CONFIRM_LABEL,
  PARAMETER_FORM_DESCRIPTION_LABEL,
  PARAMETER_FORM_NAME_LABEL,
  PARAMETER_FORM_REQUIRED_LABEL,
  PARAMETER_FORM_NEW_TITLE,
} from "../../features/commands/ui/commands-panel/components/command-form/constants";
import { DELETE_COMMAND_QUESTION } from "../../features/commands/ui/delete-command-confirm/constants";
import { PROMPT_CARD_DELETE_LABEL } from "../../features/prompts/ui/prompts-panel/components/prompt-card/constants";
import { deletedPromptLabel } from "../../features/prompts";
import { deletedCommandLabel } from "../../features/commands";
import { AGENT_COLORS } from "../../features/agents/constants";
import { deletedAgentNote } from "../../features/agents/words";
import { AIM_PICKER_ARIA_LABEL } from "../../features/conversation/ui/aim-picker/constants";
import {
  PROMPT_EDITOR_NAME_LABEL,
  PROMPT_EDITOR_SAVE_LABEL,
  PROMPT_EDITOR_TEXT_PLACEHOLDER,
} from "../../features/prompts/ui/prompt-editor/constants";
import { COLLAPSE_LABEL } from "../../components/side-panel/constants";
import {
  MODELS_PANEL_SEARCH_PLACEHOLDER,
  MODELS_PANEL_CREATE_LABEL,
  MODELS_PANEL_NEW_LABEL,
  MODELS_PANEL_TITLE_FIELD_LABEL,
} from "../../features/models/ui/models-panel/constants";
import { CANVAS_ADD_AGENT_LABEL, CANVAS_EMPTY_TITLE } from "../../features/canvas/constants";
import {
  AGENT_FORM_CANCEL_LABEL,
  AGENT_FORM_CREATE_LABEL,
  AGENT_FORM_TITLE,
  AGENT_FORM_NAME_LABEL,
} from "../../features/agents/ui/agent-panel/components/agent-form/constants";
import { DELETE_AGENT_QUESTION } from "../../features/agents/ui/delete-agent-confirm/constants";
import { CONFIRM_DIALOG_NO_LABEL, CONFIRM_DIALOG_YES_LABEL } from "../../components/confirm-dialog/constants";
import {
  AGENT_SETTINGS_MAX_CALLS_LABEL,
  AGENT_SETTINGS_NAME_LABEL,
  AGENT_SETTINGS_REVERT_LABEL,
  AGENT_SETTINGS_SAVE_LABEL,
} from "../../features/agents/ui/agent-panel/components/agent-settings/constants";
import {
  UNSAVED_AGENT_DECLINE_LABEL,
  UNSAVED_AGENT_DROP_QUESTION,
  UNSAVED_AGENT_QUESTION_PREFIX,
  UNSAVED_AGENT_QUESTION_SUFFIX,
  UNSAVED_AGENT_SAVE_LABEL,
  UNSAVED_AGENT_STAY_LABEL,
} from "../../features/agents/ui/unsaved-agent-confirm/constants";
import { MODEL_PICKER_PLACEHOLDER } from "../../features/agents/ui/agent-panel/components/model-picker/constants";
import { STEPPER_MORE_LABEL } from "../../components/stepper/constants";
import { PROMPT_PICKER_NONE_LABEL } from "../../features/agents/ui/agent-panel/components/prompt-picker/constants";
import { PICKER_SEARCH_PLACEHOLDER } from "../../components/picker-shell/constants";
import { OPEN_WALKS_CHANNEL, SAVE_PROJECT_CHANNEL } from "../../../../contracts";
import {
  LINK_PILL_DELETE_LABEL,
  LINK_PILL_DELETE_SHORTCUT,
} from "../../features/canvas/ui/components/link-pill/constants";
import { DELETED_LINK_LABEL } from "../../features/links/constants";
import { WRITE_AGENT_LABEL, WRITE_FAILED_PREFIX } from "../../features/project/constants";
import {
  WRITE_NOTE_MS,
  WRITE_NOTE_OUT_MS,
  WRITE_NOTE_RETRY_LABEL,
} from "../../features/canvas/ui/components/write-note/constants";
import {
  CLOSE_PROJECT_CHANNEL,
  LIST_PROVIDERS_CHANNEL,
  LIST_RUNS_CHANNEL,
  READ_RUN_CHANNEL,
} from "../../../../contracts";
import { SWITCHER_CLOSE_LABEL } from "../../features/project/ui/project-switcher/constants";
import { CHAT_TABS_HISTORY_LABEL, CHAT_TABS_STREAM_LABEL } from "../../features/conversation/ui/chat-tabs/constants";
import { PROVIDER_PICKER_PLACEHOLDER } from "../../features/models/ui/models-panel/components/model-form/components/provider-picker/constants";
import type { OpenProject, ProjectConfig, ProviderState } from "../../interfaces";
import { aCommand, aConfig, aLink, aModel, aPrompt, anAgent, standInBridge } from "../../testing";

const CONFIG: ProjectConfig = aConfig({
  name: "Coder",
  models: [
    aModel({
      title: "Claude Sonnet 4.5",
      provider: "anthropic",
      contextCeiling: 200000,
    }),
  ],
  agents: [
    anAgent({
      name: "EDITOR",
      color: "#38a3ff",
      x: 300,
      y: 200,
      maxCalls: 10,
      temperature: 0.3,
    }),
  ],
});

/** What the backend tells of a conversation that has no walk. */
const NO_WALKS = {
  out: {},
  walks: {},
  saidAgain: [],
  flowRunId: null,
};

/** The providers the machine offers, as far as this page shows them. */
const PROVIDERS: ProviderState[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
    keyHint: null,
    address: null,
  },
];

const PROJECT: OpenProject = {
  directory: "/tmp/coder",
  config: CONFIG,
  print: "print-1",
  view: null,
};

/** The panel already is the agent's settings; nothing to open. */
async function openSettings(_user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await Promise.resolve();
}

/** The box `SidePanel` animates between `0` and its width. */
function findPanelBox(container: HTMLElement): Element {
  const row = container.firstElementChild!.lastElementChild!;
  const [, panelBox] = row.children;

  return panelBox;
}

/** The canvas: the one presentational box, outside the panel and the switcher. */
function findCanvas(container: HTMLElement): HTMLElement {
  return container.querySelector("[role='presentation']") as HTMLElement;
}

/** `MainPage` with the saved project kept, as `App` keeps it. */
function OpenProjectHarness({ opened = PROJECT }: { opened?: OpenProject }) {
  const [project, setProject] = useState<OpenProject | null>(opened);

  return project === null ? null : <MainPage project={project} setProject={setProject} />;
}

/** The same project with a second agent, for what needs two spheres. */
const PAIRED: OpenProject = {
  ...PROJECT,
  config: {
    ...CONFIG,
    agents: [
      ...CONFIG.agents,
      anAgent({
        id: "agent-2",
        name: "REVIEWER",
        color: "#b18aff",
        x: 640,
        y: 420,
        maxCalls: 10,
        temperature: 0.3,
      }),
    ],
  },
};

describe("MainPage", () => {
  // The agents panel reads window.electronApi on mount.
  beforeEach(() => {
    // The providers channel answers with the machine's list, every other with nothing.
    standInBridge({
      invoke: vi.fn(async (channel: string) => {
        if (channel === OPEN_WALKS_CHANNEL) {
          return NO_WALKS;
        }

        return channel === LIST_PROVIDERS_CHANNEL ? PROVIDERS : [];
      }),
    });
  });

  it("stands the rail's sections in order", () => {
    render(<MainPage project={PROJECT} setProject={() => {}} />);

    // Rail order: agents, models, MCP, commands, prompts, store; built ones keep their places.
    const rail = ["Агенти", "Моделі", "Команди", "Промпти", "Чат", "Провайдери"];

    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"))
        .filter((name) => name !== null && rail.includes(name)),
    ).toEqual(rail);
  });

  it("gives the canvas the whole space the panel leaves", () => {
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    expect(findCanvas(container)).toHaveClass("d-flex", "flex-fill");
  });

  it("draws a sphere for every agent in the project", () => {
    render(<MainPage project={PROJECT} setProject={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toBeInTheDocument();
  });

  it("claims the point the canvas menu was opened at, and writes nothing yet", async () => {
    const user = userEvent.setup();
    const setProject = vi.fn();
    const { container } = render(<MainPage project={PROJECT} setProject={setProject} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
    expect(setProject).not.toHaveBeenCalled();
  });

  it("writes the agent only once the form is filled in and saved", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );
    await user.type(screen.getByLabelText(AGENT_FORM_NAME_LABEL), "REVIEWER");
    await user.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    // The canvas names the same model under its sphere, so the choice is made inside the list.
    await user.click(within(screen.getByRole("listbox")).getByText("Claude Sonnet 4.5"));
    await user.click(screen.getByText(AGENT_FORM_CREATE_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          agents: expect.arrayContaining([
            expect.objectContaining({
              name: "REVIEWER",
              modelId: "model-1",
              promptId: null,
            }),
          ]),
        }),
      });
    });
  });

  it("abandons the agent being created when the canvas is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });

    await user.click(findCanvas(container));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("abandons the agent being created when the rail moves to another section", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );
    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));

    expect(screen.queryByText(AGENT_FORM_TITLE)).not.toBeInTheDocument();
  });

  it("lets the selected agent go when the rail moves to a catalogue, as a canvas click does", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("asks before the rail moves off an agent that has unsaved work", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));

    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR2");

    await user.click(screen.getByText(UNSAVED_AGENT_DECLINE_LABEL));

    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves a catalogue standing when the canvas is clicked: it is not the selection's", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });

    await user.click(findCanvas(container));

    // A typed search and a scroll position must not go with it.
    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });
  });

  it("gives the first click past an open list to the list, and the canvas keeps standing", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.click(await screen.findByText(PROMPT_PICKER_NONE_LABEL));

    expect(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).toBeInTheDocument();

    await user.click(findCanvas(container));

    // The click closed the list and did nothing else.
    expect(screen.queryByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });

    await user.click(findCanvas(container));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("gives Escape to the open list first, and the panel stays where it was", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.click(await screen.findByText(PROMPT_PICKER_NONE_LABEL));
    await user.keyboard("{Escape}");

    // The list is the floor above the panel and answers first.
    expect(screen.queryByPlaceholderText(PICKER_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("asks about a half-written model on the way out, the same as it asks about an agent", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));
    await user.click(screen.getByText(MODELS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL), "gpt-5.1-mini");
    await user.click(findCanvas(container));

    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}gpt-5.1-mini${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();

    await user.click(screen.getByText(UNSAVED_AGENT_STAY_LABEL));

    expect(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL)).toHaveValue("gpt-5.1-mini");
  });

  it("opens the models section from the rail with nothing selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));

    await waitFor(() => {
      expect(findPanelBox(container)).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });
    expect(screen.getByPlaceholderText(MODELS_PANEL_SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("writes a new model to the project's own folder", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));
    await user.click(screen.getByText(MODELS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(/НАЗВА/), "Claude Opus");
    // The button stays unpressable until a model is fully described.
    await user.click(await screen.findByText(PROVIDER_PICKER_PLACEHOLDER));
    await user.click(screen.getByText("Anthropic"));
    await user.type(screen.getByLabelText(/СТЕЛЯ КОНТЕКСТУ/), "200000");
    await user.type(screen.getByLabelText(/СТЕЛЯ ВІДПОВІДІ/), "4096");
    await user.type(screen.getByLabelText(/ВХІДНА/), "15");
    await user.type(screen.getByLabelText(/ВИХІДНА/), "75");
    await user.click(screen.getByText(MODELS_PANEL_CREATE_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          models: expect.arrayContaining([
            expect.objectContaining({
              title: "Claude Opus",
            }),
          ]),
        }),
      });
    });
  });

  it("starts with nothing selected, so the panel starts collapsed", () => {
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);

    expect(findPanelBox(container)).toHaveStyle({
      width: "0px",
    });
  });

  it("opens the panel when a sphere is selected, and puts it away when the canvas clears it", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });

    await user.click(findCanvas(container));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("moves the sphere's label as the name is typed, and writes nothing until «Зберегти»", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");

    // The canvas draws the unsaved name at once; the file is untouched.
    expect(
      screen.getByRole("button", {
        name: "EDITOR2",
      }),
    ).toBeInTheDocument();
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());

    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          agents: [
            expect.objectContaining({
              id: "agent-1",
              name: "EDITOR2",
            }),
          ],
        }),
      });
    });
  });

  it(
    "says what was saved once the write went through, and takes the word off by itself",
    {
      // The note stays long enough to read, so the wait outlasts the default five seconds.
      timeout: WRITE_NOTE_MS + WRITE_NOTE_OUT_MS + 5000,
    },
    async () => {
      const user = userEvent.setup();

      render(<OpenProjectHarness />);
      await user.click(
        screen.getByRole("button", {
          name: "EDITOR",
        }),
      );
      await openSettings(user);
      await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
      await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

      // Saving answers with a note that appears.
      expect(await screen.findByText(WRITE_AGENT_LABEL)).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.queryByText(WRITE_AGENT_LABEL)).not.toBeInTheDocument();
        },
        {
          timeout: WRITE_NOTE_MS + WRITE_NOTE_OUT_MS + 1000,
        },
      );
    },
  );

  it("names what stopped a write, keeps the draft, and writes it again on «ще раз»", async () => {
    const user = userEvent.setup();

    standInBridge({
      invoke: vi.fn().mockRejectedValue(new Error("немає доступу до файла")),
    });

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    expect(await screen.findByText(`${WRITE_FAILED_PREFIX}немає доступу до файла`)).toBeInTheDocument();

    // A failed write clears nothing; the draft remains.
    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR2");

    standInBridge({
      invoke: vi.fn(async (channel: string) => (channel === OPEN_WALKS_CHANNEL ? NO_WALKS : [])),
    });

    await user.click(screen.getByText(WRITE_NOTE_RETRY_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          agents: [
            expect.objectContaining({
              name: "EDITOR2",
            }),
          ],
        }),
      });
    });
    expect(await screen.findByText(WRITE_AGENT_LABEL)).toBeInTheDocument();
  });

  it("holds a picked colour in the draft too, and writes it with everything else", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(
      screen.getByRole("button", {
        name: AGENT_COLORS[2],
      }),
    );

    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());

    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          agents: [
            expect.objectContaining({
              name: "EDITOR2",
              color: AGENT_COLORS[2],
            }),
          ],
        }),
      });
    });
  });

  it("asks before leaving an agent with unsaved work, and stays put until it is answered", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PAIRED} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    );

    // The question names the agent and what moved; the panel is still on EDITOR.
    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR2");

    await user.click(screen.getByText(UNSAVED_AGENT_STAY_LABEL));

    expect(
      screen.queryByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR2");
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("puts the panel away on Escape, and lets the agent go with it", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);

    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("asks before Escape puts away a panel that holds a draft, and stays until it is answered", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.keyboard("{Escape}");

    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });

    // Escape reaches only the question while it stands, and means «лишитись тут».
    await user.keyboard("{Escape}");

    expect(
      screen.queryByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).not.toBeInTheDocument();
    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });
  });

  it("asks on «Скасувати» too, since a press is easy to make and what it drops cannot come back", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(screen.getByText(AGENT_SETTINGS_REVERT_LABEL));

    // The same box asking «Точно не зберігати?».
    expect(await screen.findByText(UNSAVED_AGENT_DROP_QUESTION)).toBeInTheDocument();
    expect(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR2");

    await user.click(screen.getByText(UNSAVED_AGENT_DECLINE_LABEL));

    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR");
  });

  it("asks before the canvas clears an agent that has unsaved work", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(findCanvas(container));

    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(panelBox).toHaveStyle({
      width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
    });

    await user.click(screen.getByText(UNSAVED_AGENT_DECLINE_LABEL));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("lets the way out happen on «Не зберігати», and the draft goes with it", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PAIRED} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    );
    await user.click(await screen.findByText(UNSAVED_AGENT_DECLINE_LABEL));

    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("REVIEWER");
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);

    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("EDITOR");
  });

  it("writes the draft on «Зберегти» and then takes the way out", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PAIRED} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.click(
      screen.getByRole("button", {
        name: "REVIEWER",
      }),
    );
    // Question and panel footer both carry «Зберегти»; the question is drawn first.
    const [saveInQuestion] = await screen.findAllByText(UNSAVED_AGENT_SAVE_LABEL);

    await user.click(saveInQuestion);

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          agents: expect.arrayContaining([
            expect.objectContaining({
              id: "agent-1",
              name: "EDITOR2",
            }),
          ]),
        }),
      });
    });
    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toHaveValue("REVIEWER");
  });

  it("offers an agent in the middle of the canvas when the rail opens agents with nothing selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(screen.getByLabelText(MODELS_PANEL_LABEL));
    await user.click(screen.getByLabelText(AGENTS_PANEL_LABEL));

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });
  });

  it("still lets the rail put an open panel away", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });

    await user.click(screen.getByLabelText(COLLAPSE_LABEL));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("puts the section away when creating is cancelled, and the claimed point goes with it", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={() => {}} />);
    const panelBox = findPanelBox(container);

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: `${RIGHT_SIDE_PANEL_WIDTH_PX}px`,
      });
    });

    await user.click(screen.getByText(AGENT_FORM_CANCEL_LABEL));

    await waitFor(() => {
      expect(panelBox).toHaveStyle({
        width: "0px",
      });
    });
  });

  it("deletes an agent from its sphere's menu, and leaves the way back on the canvas", async () => {
    const user = userEvent.setup();
    render(<OpenProjectHarness />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    // Gone from the screen and the folder at once; the way back remains.
    expect(
      screen.queryByRole("button", {
        name: "EDITOR",
      }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("АГЕНТА ВИДАЛЕНО")).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          agents: expect.not.arrayContaining([
            expect.objectContaining({
              name: "EDITOR",
            }),
          ]),
        }),
      }),
    );
  });

  it("brings the agent back when the line is taken up on", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );
    await user.click(await screen.findByText("СКАСУВАТИ ⌘Z"));

    // The agent is back on the canvas and the folder holds it again.
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("АГЕНТА ВИДАЛЕНО")).not.toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          agents: expect.arrayContaining([
            expect.objectContaining({
              name: "EDITOR",
            }),
          ]),
        }),
      }),
    );
  });

  it("leaves ⌘C to the words the person selected rather than taking the sphere with it", async () => {
    const user = userEvent.setup();
    const { container } = render(<MainPage project={PROJECT} setProject={vi.fn()} />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    // Selection is off except in the chat and fields.
    const said = document.createElement("p");

    said.textContent = "Готово, тест зелений.";
    document.body.append(said);

    const range = document.createRange();

    range.selectNodeContents(said);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    await user.keyboard("{Meta>}c{/Meta}");

    window.getSelection()?.removeAllRanges();
    said.remove();

    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });

    // Nothing was taken, so there is nothing to put down.
    expect(screen.getByText("Вставити агента").closest("button")).toBeDisabled();
  });

  it("puts a copy of an agent down where the canvas was clicked, numbered and selected", async () => {
    const user = userEvent.setup();
    const setProject = vi.fn();
    const { container } = render(<MainPage project={PROJECT} setProject={setProject} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Копіювати агента⌘C",
      }),
    );
    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(screen.getByText("Вставити агента").closest("button") as HTMLElement);

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          // The copy carries the settings and the next number, no links.
          agents: [
            ...PROJECT.config.agents,
            expect.objectContaining({
              name: "EDITOR 2",
              modelId: "model-1",
              color: "#38a3ff",
              maxCalls: 10,
              temperature: 0.3,
              tools: [],
              x: 0,
              y: 0,
            }),
          ],
          links: [],
        }),
      });
    });
  });

  it("takes the copy's mark away when another sphere is picked", async () => {
    const user = userEvent.setup();
    // The mark names a copy that must be on the canvas, so this one keeps the project.
    const { container } = render(<OpenProjectHarness />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Копіювати агента⌘C",
      }),
    );
    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(screen.getByText("Вставити агента").closest("button") as HTMLElement);

    expect(await screen.findByText("КОПІЯ EDITOR · ВСТАВЛЕНО")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    expect(screen.queryByText("КОПІЯ EDITOR · ВСТАВЛЕНО")).not.toBeInTheDocument();
  });

  it("copies the selected agent with \u2318C and stands its copy beside it on \u2318V", async () => {
    const user = userEvent.setup();
    render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.keyboard("{Meta>}c{/Meta}");
    await user.keyboard("{Meta>}v{/Meta}");

    expect(
      await screen.findByText(
        "\u041a\u041e\u041f\u0406\u042f EDITOR \u00b7 \u0412\u0421\u0422\u0410\u0412\u041b\u0415\u041d\u041e",
      ),
    ).toBeInTheDocument();
    // The free place one step down and right of the original at 300, 200.
    expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
      basis: expect.anything(),
      config: expect.objectContaining({
        agents: [
          CONFIG.agents[0],
          expect.objectContaining({
            name: "EDITOR 2",
            x: 430,
            y: 330,
          }),
        ],
      }),
    });
  });

  it("leaves \u2318C and \u2318V to the field being typed in", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.keyboard("{Meta>}c{/Meta}");
    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );
    await user.click(screen.getByLabelText(AGENT_FORM_NAME_LABEL));
    await user.keyboard("{Meta>}v{/Meta}");

    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("writes a link from one sphere to another, and never the same one twice", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness opened={PAIRED} />);

    async function drawLink() {
      await user.pointer({
        keys: "[MouseRight]",
        target: screen.getByRole("button", {
          name: "EDITOR",
        }),
      });
      await user.click(
        screen.getByRole("menuitem", {
          name: "Додати лінію",
        }),
      );
      fireEvent.mouseMove(findCanvas(container), {
        clientX: 640,
        clientY: 420,
      });
      await user.click(
        screen.getByRole("button", {
          name: "REVIEWER",
        }),
      );
    }

    await drawLink();

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          links: [
            expect.objectContaining({
              from: "agent-1",
              to: "agent-2",
            }),
          ],
        }),
      });
    });

    /** The writes alone; the provider reading lands whenever it lands. */
    const written = () =>
      vi.mocked(window.electronApi.invoke).mock.calls.filter(([channel]) => channel === SAVE_PROJECT_CHANNEL);
    const saves = written().length;

    // The same direction again is the existing link; nothing is written.
    await drawLink();

    expect(written()).toHaveLength(saves);
  });

  it("asks before an agent inside a chain goes, naming who is left, and writes only on yes", async () => {
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
    };

    render(<OpenProjectHarness opened={linked} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );

    expect(await screen.findByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(/REVIEWER лишиться сам по собі/)).toBeInTheDocument();
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());

    await user.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_NO_LABEL,
      }),
    );

    expect(screen.queryByText(DELETE_AGENT_QUESTION)).not.toBeInTheDocument();
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("gives ⌫ to the chosen link, and asks nothing about the agent the chat still holds", async () => {
    // Aiming the chat keeps the sphere selected; a link chosen afterwards takes the key, so one press never both takes
    // a link and raises a question.
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
      view: {
        pan: {
          x: 0,
          y: 0,
        },
        scale: 1,
        sectionId: CHAT_SECTION_ID,
        isCollapsed: false,
        aimedAgentId: null,
        fieldHeight: null,
      },
    };
    const { container } = render(<OpenProjectHarness opened={linked} />);

    await user.click(
      screen.getByRole("button", {
        name: AIM_PICKER_ARIA_LABEL,
      }),
    );
    await user.click(within(screen.getByRole("listbox")).getByText("EDITOR"));
    // The link's invisible hit stroke, which a click on the line lands on.
    await user.click(container.querySelector("svg line[stroke='transparent']") as unknown as Element);
    fireEvent.keyDown(window, {
      key: "Delete",
    });

    expect(screen.queryByText(DELETE_AGENT_QUESTION)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          links: [],
        }),
      });
    });
  });

  it("asks about the draft before the deletion of somebody else, and not the other way round", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PAIRED} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "REVIEWER",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );

    // Taking REVIEWER moves focus off EDITOR2, so its draft blocks first.
    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
    expect(screen.queryByText(DELETE_AGENT_QUESTION)).not.toBeInTheDocument();

    await user.click(screen.getByText(UNSAVED_AGENT_DECLINE_LABEL));

    // Answered, the deletion takes its turn.
    expect(await screen.findByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
  });

  it("asks once when the agent being edited is the one taken, since its draft goes with it", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PAIRED} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.type(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL), "2");
    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR2",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );

    expect(await screen.findByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    expect(
      screen.queryByText(`${UNSAVED_AGENT_QUESTION_PREFIX}EDITOR2${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).not.toBeInTheDocument();
  });

  it("takes the agent and its links off the screen once the question is answered yes", async () => {
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
    };

    render(<OpenProjectHarness opened={linked} />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    // Gone from the screen and from the folder, its line with it.
    expect(
      screen.queryByRole("button", {
        name: "EDITOR",
      }),
    ).not.toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          links: [],
        }),
      }),
    );
  });
  it("takes the selected agent away on \u232b, and asks first when it is tied to somebody", async () => {
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
    };

    render(<OpenProjectHarness opened={linked} />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.keyboard("{Backspace}");

    expect(await screen.findByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("writes a new prompt from the editor, and the catalogue then holds it", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: PROMPTS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(PROMPTS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL), "Правки коду");
    await user.type(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER), "Ти працюєш у наявному репозиторії.");
    await user.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
        directory: PROJECT.directory,
        basis: expect.anything(),
        config: expect.objectContaining({
          prompts: [
            expect.objectContaining({
              name: "Правки коду",
              text: "Ти працюєш у наявному репозиторії.",
              // The backend names the file the first time it writes one.
              file: "",
            }),
          ],
        }),
      });
    });
  });

  it("steps the maximum of calls and writes it, since every agent carries one", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.click(
      await screen.findByRole("button", {
        name: `${AGENT_SETTINGS_MAX_CALLS_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );
    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          agents: [
            expect.objectContaining({
              maxCalls: 11,
            }),
          ],
        }),
      }),
    );
  });

  it("writes the prompt an agent is given, and the library then counts it", async () => {
    const user = userEvent.setup();
    const withPrompt: OpenProject = {
      ...PROJECT,
      config: {
        ...CONFIG,
        prompts: [
          aPrompt({
            name: "Правки коду",
            file: "prompts/pravky-kodu.md",
            text: "Ти працюєш у наявному репозиторії.",
          }),
        ],
      },
    };

    render(<OpenProjectHarness opened={withPrompt} />);
    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await openSettings(user);
    await user.click(await screen.findByText(PROMPT_PICKER_NONE_LABEL));
    await user.click(
      screen.getByRole("option", {
        name: /Правки коду/,
      }),
    );

    // The prompt stands in the draft by name and is written by «Зберегти».
    expect(screen.getByText("Правки коду")).toBeInTheDocument();

    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          agents: [
            expect.objectContaining({
              promptId: "prompt-1",
            }),
          ],
        }),
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: PROMPTS_PANEL_LABEL,
      }),
    );

    expect(screen.getByText("1 агент")).toBeInTheDocument();
  });

  it("asks before a prompt's editor is left with a text that was not written", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: PROMPTS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(PROMPTS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL), "Правки коду");
    await user.type(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER), "Ти працюєш у наявному репозиторії.");
    await user.keyboard("{Escape}");

    expect(
      await screen.findByText(`${UNSAVED_AGENT_QUESTION_PREFIX}Правки коду${UNSAVED_AGENT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();

    await user.click(screen.getByText(UNSAVED_AGENT_STAY_LABEL));

    expect(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER)).toHaveValue("Ти працюєш у наявному репозиторії.");
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("leaves the prompt editor when the rail moves to another section", async () => {
    const user = userEvent.setup();

    render(<MainPage project={PROJECT} setProject={() => {}} />);
    await user.click(
      screen.getByRole("button", {
        name: PROMPTS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(PROMPTS_PANEL_NEW_LABEL));

    expect(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );

    // The editor stands over the working area; moving the rail puts it away.
    expect(screen.queryByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.getByText(COMMANDS_PANEL_NEW_LABEL)).toBeInTheDocument();
  });

  it("does not offer to save a half-declared command, since the file would refuse it", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(COMMANDS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(COMMANDS_PANEL_NAME_FIELD_LABEL), "cd");
    await user.keyboard("{Escape}");

    // The question cannot offer «Зберегти».
    expect(
      await screen.findByText(missingFieldsNote([COMMAND_DESCRIPTION_DROPPED_LABEL, COMMAND_RUN_DROPPED_LABEL])),
    ).toBeInTheDocument();
    expect(screen.queryByText(UNSAVED_AGENT_SAVE_LABEL)).not.toBeInTheDocument();
    expect(window.electronApi.invoke).not.toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, expect.anything());
  });

  it("declares a command from the empty section, and the catalogue then holds it", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(COMMANDS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(COMMANDS_PANEL_NAME_FIELD_LABEL), "run_tests");
    await user.type(screen.getByLabelText(COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL), "Прогнати тести проєкту");
    await user.type(screen.getByLabelText(COMMANDS_PANEL_RUN_FIELD_LABEL), "npm test");
    await user.click(screen.getByText(COMMANDS_PANEL_DECLARE_LABEL));

    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          commands: [
            expect.objectContaining({
              name: "run_tests",
              description: "Прогнати тести проєкту",
              run: "npm test",
              parameters: [],
            }),
          ],
        }),
      }),
    );

    // The form closes onto the list; a command with no parameters has no line under its name.
    expect(await screen.findByText("run_tests")).toBeInTheDocument();
    expect(screen.queryByText("БЕЗ ПАРАМЕТРІВ")).not.toBeInTheDocument();
  });

  it("adds a parameter a row at a time, and shows the model what it will be handed", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText(COMMANDS_PANEL_NEW_LABEL));
    await user.type(screen.getByLabelText(COMMANDS_PANEL_NAME_FIELD_LABEL), "run_tests");
    await user.type(screen.getByLabelText(COMMANDS_PANEL_DESCRIPTION_FIELD_LABEL), "Прогнати тести проєкту");
    await user.type(screen.getByLabelText(COMMANDS_PANEL_RUN_FIELD_LABEL), "npm test -- {{pattern}");

    await user.click(screen.getByText(COMMAND_FORM_ADD_PARAMETER_LABEL));

    // The command above also carries «ОПИС ДЛЯ МОДЕЛІ», so the card's fields are found inside the card.
    const card = screen.getByText(PARAMETER_FORM_NEW_TITLE).parentElement!.parentElement!;

    await user.type(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL), "pattern");
    await user.type(within(card).getByLabelText(PARAMETER_FORM_DESCRIPTION_LABEL), "Маска файлів тестів");
    await user.click(
      screen.getByRole("radio", {
        name: "bool",
      }),
    );
    await user.click(
      screen.getByRole("switch", {
        name: PARAMETER_FORM_REQUIRED_LABEL,
      }),
    );
    await user.click(screen.getByText(PARAMETER_FORM_CONFIRM_LABEL));

    // The block under the row says what the model reads; a required parameter has no «?».
    expect(screen.queryByText("НЕОБОВ'ЯЗКОВИЙ")).not.toBeInTheDocument();
    expect(screen.getByText("ОБОВ'ЯЗКОВИЙ")).toBeInTheDocument();
    // «bool» appears twice: the row's chip and the type in the preview.
    expect(screen.getAllByText("bool")).toHaveLength(2);

    await user.click(screen.getByText(COMMANDS_PANEL_DECLARE_LABEL));

    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          commands: [
            expect.objectContaining({
              parameters: [
                expect.objectContaining({
                  name: "pattern",
                  type: "bool",
                  description: "Маска файлів тестів",
                  isRequired: true,
                  values: [],
                }),
              ],
            }),
          ],
        }),
      }),
    );

    // With something to say, the row's line says it.
    expect(await screen.findByText("1 ПАРАМЕТР")).toBeInTheDocument();
  });

  it("refuses to declare a command with a field missing, and asks about taking one away", async () => {
    const user = userEvent.setup();
    const withCommand: OpenProject = {
      ...PROJECT,
      config: {
        ...CONFIG,
        commands: [
          aCommand({
            name: "run_tests",
            description: "Прогнати тести проєкту",
            run: "npm test",
          }),
        ],
      },
    };

    render(<OpenProjectHarness opened={withCommand} />);
    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText("run_tests"));
    await user.click(screen.getByText(COMMAND_ROW_DELETE_LABEL));

    expect(await screen.findByText(DELETE_COMMAND_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(/Агенти, яким її видали, лишаться без неї/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    // Gone from the screen and the folder at once; the line offers the way back.
    expect(screen.queryByText("run_tests")).not.toBeInTheDocument();
    // Nobody was granted it, so the line has no second half.
    expect(await screen.findByText(deletedCommandLabel(0))).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          commands: [],
        }),
      }),
    );
  });

  it("takes the grants on a command away with the command, leaving no agent holding nothing", async () => {
    const user = userEvent.setup();
    const withGrant: OpenProject = {
      ...PROJECT,
      config: {
        ...CONFIG,
        commands: [
          aCommand({
            name: "run_tests",
            description: "Прогнати тести проєкту",
            run: "npm test",
          }),
        ],
        agents: CONFIG.agents.map((agent) => ({
          ...agent,
          tools: [
            {
              id: "grant-1",
              source: "command" as const,
              commandId: "command-1",
              pinned: [],
            },
          ],
        })),
      },
    };

    render(<OpenProjectHarness opened={withGrant} />);
    await user.click(
      screen.getByRole("button", {
        name: COMMANDS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText("run_tests"));
    await user.click(screen.getByText(COMMAND_ROW_DELETE_LABEL));
    await user.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    // A grant pointing at the deleted command goes with it, and the line counts it.
    expect(screen.queryByText("run_tests")).not.toBeInTheDocument();
    expect(await screen.findByText(deletedCommandLabel(1))).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          commands: [],
          agents: [
            expect.objectContaining({
              tools: [],
            }),
          ],
        }),
      }),
    );
  });

  it("takes a prompt away once asked, and leaves its agents standing without one", async () => {
    const user = userEvent.setup();
    const withPrompt: OpenProject = {
      ...PROJECT,
      config: {
        ...CONFIG,
        prompts: [
          aPrompt({
            name: "Правки коду",
            file: "prompts/pravky-kodu.md",
            text: "Ти працюєш у наявному репозиторії.",
          }),
        ],
        agents: [
          {
            ...CONFIG.agents[0],
            promptId: "prompt-1",
          },
        ],
      },
    };

    render(<OpenProjectHarness opened={withPrompt} />);

    await user.click(
      screen.getByRole("button", {
        name: PROMPTS_PANEL_LABEL,
      }),
    );
    await user.click(screen.getByText("Правки коду"));
    await user.click(screen.getByText(PROMPT_CARD_DELETE_LABEL));

    // The box names the thing and what stays: the agent falls to a bare model, it does not go.
    expect(
      screen.getByText(/Заберемо промпт «Правки коду»\. 1 агент на ньому лишиться на голій моделі\./),
    ).toBeInTheDocument();
    // Named on a chip of its own, beside the sphere of the same name on the canvas.
    expect(screen.getAllByText(CONFIG.agents[0].name)).toHaveLength(2);

    await user.click(screen.getByText(CONFIRM_DIALOG_YES_LABEL));

    // Gone from the screen and the folder; its agents are left without one, and the way back is offered.
    expect(screen.queryByText("Правки коду")).not.toBeInTheDocument();
    expect(await screen.findByText(deletedPromptLabel(1))).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
      basis: expect.anything(),
      config: expect.objectContaining({
        prompts: [],
        agents: [
          expect.objectContaining({
            id: "agent-1",
            promptId: null,
          }),
        ],
      }),
    });
  });

  it("leaves a way back after a link goes, and writes nothing while it stands", async () => {
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
    };
    const { container } = render(<OpenProjectHarness opened={linked} />);

    // The line, and the invisible wide stroke over it that takes the click.
    await user.click(container.querySelectorAll("svg line")[2] as SVGLineElement);
    await user.click(
      screen.getByRole("button", {
        name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
      }),
    );

    expect(await screen.findByText(DELETED_LINK_LABEL)).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(
      SAVE_PROJECT_CHANNEL,
      expect.objectContaining({
        config: expect.objectContaining({
          links: [],
        }),
      }),
    );
  });
  it("asks about an agent tied to nobody too, saying it takes nothing with it", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", {
        name: "EDITOR",
      }),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: "Видалити агента⌫",
      }),
    );

    expect(await screen.findByText(DELETE_AGENT_QUESTION)).toBeInTheDocument();
    // The box names the sphere, so the whole sentence is asserted.
    expect(screen.getByText(deletedAgentNote("EDITOR", []))).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: CONFIRM_DIALOG_YES_LABEL,
      }),
    );

    expect(
      screen.queryByRole("button", {
        name: "EDITOR",
      }),
    ).not.toBeInTheDocument();
  });

  it("takes the link off the canvas from its pill, and keeps both its agents standing", async () => {
    const user = userEvent.setup();
    const linked: OpenProject = {
      ...PAIRED,
      config: {
        ...PAIRED.config,
        links: [aLink()],
      },
    };
    const { container } = render(<OpenProjectHarness opened={linked} />);

    // The line, and the invisible wide stroke over it that takes the click.
    await user.click(container.querySelectorAll("svg line")[2] as SVGLineElement);
    await user.click(
      screen.getByRole("button", {
        name: `${LINK_PILL_DELETE_SHORTCUT} ${LINK_PILL_DELETE_LABEL}`,
      }),
    );

    // The line is gone and written away; both spheres stay.
    expect(container.querySelectorAll("svg line")).toHaveLength(0);
    expect(
      screen.getByRole("button", {
        name: linked.config.agents[0].name,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: linked.config.agents[1].name,
      }),
    ).toBeInTheDocument();
    expect(window.electronApi.invoke).toHaveBeenCalledWith(SAVE_PROJECT_CHANNEL, {
      directory: PROJECT.directory,
      basis: expect.anything(),
      config: expect.objectContaining({
        links: [],
        agents: linked.config.agents,
      }),
    });
  });

  it("draws an empty project rather than nothing at all", () => {
    // A freshly made project has every list empty; nothing on the page may read that as missing.
    render(
      <MainPage
        project={{
          directory: "/tmp/empty",
          config: aConfig({
            name: "empty",
          }),
          print: "print-1",
          view: null,
        }}
        setProject={() => {}}
      />,
    );

    expect(screen.getByText(CANVAS_EMPTY_TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "empty",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the agent in focus while the chat stands, since that panel is not the selection's", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.click(
      screen.getByLabelText(CHAT_PANEL_LABEL, {
        selector: "button",
      }),
    );
    await user.click(findCanvas(container));

    // Letting go here would take the mark that says where a question goes.
    expect(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".sphere-breathe")).toBeInTheDocument();
  });

  it("takes the light off the canvas in a catalogue, where no agent is in play", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.click(
      screen.getByLabelText(CHAT_PANEL_LABEL, {
        selector: "button",
      }),
    );

    expect(container.querySelector(".sphere-breathe")).toBeInTheDocument();

    await user.click(screen.getByLabelText(PROMPTS_PANEL_LABEL));

    // A catalogue concerns no agent: the canvas stands as if nothing were chosen.
    expect(container.querySelector(".sphere-breathe")).not.toBeInTheDocument();
  });

  it("takes the light off when the chat is put away, since the aim is the chat's own business", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );

    const chat = screen.getByLabelText(CHAT_PANEL_LABEL, {
      selector: "button",
    });

    await user.click(chat);

    expect(container.querySelector(".sphere-breathe")).toBeInTheDocument();

    await user.click(chat);

    expect(container.querySelector(".sphere-breathe")).not.toBeInTheDocument();
  });

  it("opens the create form even out of the chat, since the form lives in the agents section", async () => {
    const user = userEvent.setup();
    const { container } = render(<OpenProjectHarness />);

    await user.click(
      screen.getByRole("button", {
        name: "EDITOR",
      }),
    );
    await user.click(
      screen.getByLabelText(CHAT_PANEL_LABEL, {
        selector: "button",
      }),
    );
    await user.pointer({
      keys: "[MouseRight]",
      target: findCanvas(container),
    });
    await user.click(
      screen.getByRole("menuitem", {
        name: CANVAS_ADD_AGENT_LABEL,
      }),
    );

    // A click on a sphere keeps the rail in the chat; asking for the form must show it.
    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
    // With the chat gone from the panel, the canvas says nothing about any agent.
    expect(container.querySelector(".sphere-breathe")).not.toBeInTheDocument();
  });

  it("opens the canvas where this machine left it, at the scale it left", () => {
    render(
      <MainPage
        project={{
          ...PROJECT,
          view: {
            pan: {
              x: -120,
              y: 40,
            },
            scale: 0.7,
            sectionId: MODELS_SECTION_ID,
            isCollapsed: false,
            aimedAgentId: null,
            fieldHeight: null,
          },
        }}
        setProject={() => {}}
      />,
    );

    // The zoom toolbar shows the scale, and the section that was open opens again.
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(MODELS_PANEL_SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("opens the chat aimed where it was left, though no sphere is fixed", () => {
    render(
      <MainPage
        setProject={() => {}}
        project={{
          ...PROJECT,
          view: {
            pan: {
              x: 0,
              y: 0,
            },
            scale: 1,
            sectionId: CHAT_SECTION_ID,
            isCollapsed: false,
            aimedAgentId: "agent-1",
            fieldHeight: null,
          },
        }}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: AIM_PICKER_ARIA_LABEL,
      }),
    ).toHaveTextContent("EDITOR");
  });

  it("aims the chat at the sphere pressed, and moves both marks off the one before it", async () => {
    // Guards against the history moving the aim while the ring stayed, which lit two spheres and made the next press on
    // the lit one do nothing.
    const user = userEvent.setup();

    standInBridge({
      invoke: vi.fn(async (channel: string) => {
        if (channel === LIST_PROVIDERS_CHANNEL) {
          return PROVIDERS;
        }

        if (channel === OPEN_WALKS_CHANNEL) {
          return NO_WALKS;
        }

        // One row of this project's record, asked of the second agent.
        const row = {
          id: "run-1",
          startedByAgentId: "agent-2",
          startedByAgentName: "REVIEWER",
          startedByAgentColor: "#b18aff",
          askedAgentId: "agent-2",
          askedAgentName: "REVIEWER",
          asked: "Знайди md-файли",
          state: "done",
          startedAt: new Date(2026, 8, 7, 15, 10),
          askedAt: new Date(2026, 8, 7, 15, 10),
          endedAt: new Date(2026, 8, 7, 15, 11),
          steps: 2,
          money: 0.01,
          worked: 44_000,
        };

        if (channel === LIST_RUNS_CHANNEL) {
          return [row];
        }

        // The opened row is read whole; a run with no questions and no walk is not an empty list.
        return channel === READ_RUN_CHANNEL
          ? {
              ...row,
              questions: [],
              walk: [],
            }
          : [];
      }),
    });

    render(
      <MainPage
        setProject={() => {}}
        project={{
          ...PAIRED,
          view: {
            pan: {
              x: 0,
              y: 0,
            },
            scale: 1,
            sectionId: CHAT_SECTION_ID,
            isCollapsed: false,
            aimedAgentId: null,
            fieldHeight: null,
          },
        }}
      />,
    );

    const aim = () =>
      screen.getByRole("button", {
        name: AIM_PICKER_ARIA_LABEL,
      });
    const sphere = (name: string) =>
      screen.getByRole("button", {
        name,
      });

    await user.click(sphere("EDITOR"));

    expect(aim()).toHaveTextContent("EDITOR");

    // The row opens in the stream, aimed at whoever walked it.
    await user.click(screen.getByText(CHAT_TABS_HISTORY_LABEL));
    await user.click(await screen.findByText("Знайди md-файли"));

    expect(aim()).toHaveTextContent("REVIEWER");
    // Fixing and aiming are two marks of one agent; the sphere left behind holds neither.
    expect(sphere("EDITOR")).toHaveAttribute("aria-pressed", "false");
    expect(sphere("REVIEWER")).toHaveAttribute("aria-pressed", "true");

    // And back in one press: the original sphere takes the aim again.
    await user.click(screen.getByText(CHAT_TABS_STREAM_LABEL));
    await user.click(sphere("EDITOR"));

    expect(aim()).toHaveTextContent("EDITOR");
    expect(sphere("REVIEWER")).toHaveAttribute("aria-pressed", "false");
  });

  it("tells the main process the project is put down, so its folder stops being watched", async () => {
    const user = userEvent.setup();

    render(<OpenProjectHarness />);
    await user.click(
      screen.getByRole("button", {
        name: CONFIG.name,
      }),
    );
    await user.click(await screen.findByText(SWITCHER_CLOSE_LABEL));

    // Nothing is handed over: the main process knows the one open project.
    await waitFor(() => {
      expect(window.electronApi.invoke).toHaveBeenCalledWith(CLOSE_PROJECT_CHANNEL);
    });
  });
});
