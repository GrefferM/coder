import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptsPanel } from "./prompts-panel";
import {
  PROMPTS_PANEL_EMPTY_LABEL,
  PROMPTS_PANEL_NEW_LABEL,
  PROMPTS_PANEL_SEARCH_EMPTY_LABEL,
  PROMPTS_PANEL_SEARCH_PLACEHOLDER,
} from "./constants";
import {
  PROMPT_CARD_DELETE_LABEL,
  PROMPT_CARD_EDIT_LABEL,
  PROMPT_CARD_NO_AGENTS_LABEL,
} from "./components/prompt-card/constants";
import type { Agent, ProjectPrompt } from "../../../../interfaces";
import { aPrompt, anAgent } from "../../../../testing";

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Правки коду",
    file: "prompts/pravky-kodu.md",
    text: "Ти працюєш у наявному репозиторії. Спершу читаєш код навколо, потім змінюєш.",
  }),
  aPrompt({
    id: "prompt-2",
    name: "Нічний обхід",
    file: "prompts/nichnyi-obkhid.md",
    text: "Перевір збірки за добу.",
  }),
];

const AGENTS: Agent[] = [
  anAgent({
    name: "EDITOR",
    promptId: "prompt-1",
    color: "#38a3ff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  }),
];

function renderPanel(overrides: Partial<Parameters<typeof PromptsPanel>[0]> = {}) {
  return render(
    <PromptsPanel
      prompts={PROMPTS}
      agents={AGENTS}
      chosenPromptId={null}
      onChosenPromptIdChange={() => {}}
      onEditPrompt={() => {}}
      onDeletePrompt={() => {}}
      {...overrides}
    />,
  );
}

describe("PromptsPanel", () => {
  it("draws a card per prompt, with how it starts and how many agents are on it", () => {
    renderPanel();

    expect(screen.getByText(PROMPTS[0].name)).toBeInTheDocument();
    expect(screen.getByText(/Ти працюєш у наявному репозиторії/)).toBeInTheDocument();
    expect(screen.getByText("1 агент")).toBeInTheDocument();
    expect(screen.getByText(PROMPT_CARD_NO_AGENTS_LABEL)).toBeInTheDocument();
  });

  it("says how long the open prompt is, and only that one carries the way into the editor", async () => {
    const onEditPrompt = vi.fn();

    renderPanel({
      chosenPromptId: "prompt-1",
      onEditPrompt,
    });

    // The first prompt's text is eleven words long.
    expect(screen.getByText("11 слів")).toBeInTheDocument();
    expect(screen.getAllByText(PROMPT_CARD_EDIT_LABEL)).toHaveLength(1);

    await userEvent.click(screen.getByText(PROMPT_CARD_EDIT_LABEL));

    expect(onEditPrompt).toHaveBeenCalledWith("prompt-1");
  });

  it("opens a card on a click, without opening the editor", async () => {
    const onChosenPromptIdChange = vi.fn();
    const onEditPrompt = vi.fn();

    renderPanel({
      onChosenPromptIdChange,
      onEditPrompt,
    });
    await userEvent.click(screen.getByText(PROMPTS[1].name));

    expect(onChosenPromptIdChange).toHaveBeenCalledWith("prompt-2");
    expect(onEditPrompt).not.toHaveBeenCalled();
  });

  it("asks for a new prompt with nothing chosen, which is what a new one is", async () => {
    const onEditPrompt = vi.fn();

    renderPanel({
      onEditPrompt,
    });
    await userEvent.click(screen.getByText(PROMPTS_PANEL_NEW_LABEL));

    expect(onEditPrompt).toHaveBeenCalledWith(null);
  });

  it("asks about a prompt from the open card, rather than taking it away on the spot", async () => {
    const onDeletePrompt = vi.fn();

    renderPanel({
      chosenPromptId: "prompt-1",
      onDeletePrompt,
    });
    await userEvent.click(screen.getByText(PROMPT_CARD_DELETE_LABEL));

    expect(onDeletePrompt).toHaveBeenCalledWith("prompt-1");
  });

  it("keeps only what the search names, and says so when it names nothing", async () => {
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText(PROMPTS_PANEL_SEARCH_PLACEHOLDER), "обхід");

    expect(screen.queryByText(PROMPTS[0].name)).not.toBeInTheDocument();
    expect(screen.getByText(PROMPTS[1].name)).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText(PROMPTS_PANEL_SEARCH_PLACEHOLDER));
    await userEvent.type(screen.getByPlaceholderText(PROMPTS_PANEL_SEARCH_PLACEHOLDER), "нічого");

    expect(screen.getByText(PROMPTS_PANEL_SEARCH_EMPTY_LABEL)).toBeInTheDocument();
  });

  it("says the library is empty rather than drawing nothing", () => {
    renderPanel({
      prompts: [],
    });

    expect(screen.getByText(PROMPTS_PANEL_EMPTY_LABEL)).toBeInTheDocument();
  });
});
