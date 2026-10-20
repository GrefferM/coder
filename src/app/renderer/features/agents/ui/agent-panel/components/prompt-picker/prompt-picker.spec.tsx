import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PromptPicker } from "./prompt-picker";
import { PROMPT_PICKER_NONE_LABEL } from "./constants";
import type { Agent, ProjectPrompt } from "../../../../../../interfaces";
import { aPrompt } from "../../../../../../testing";

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Правки коду",
    file: "prompts/pravky-kodu.md",
    text: "Ти працюєш у наявному репозиторії.",
  }),
  aPrompt({
    id: "prompt-2",
    name: "Рев'ю",
    file: "prompts/reviu.md",
    text: "Ти рев'юер.",
  }),
];

const AGENTS: Agent[] = ["agent-1", "agent-2", "agent-3"].map((id, index) => ({
  id,
  name: id.toUpperCase(),
  purpose: null,
  modelId: "model-1",
  // Two of the three agents share the first prompt, counted in both the field and its row.
  promptId: index === 2 ? null : "prompt-1",
  color: "#38a3ff",
  isActive: true,
  waitsForAll: true,
  memory: "own",
  x: 0,
  y: 0,
  maxCalls: 10,
  temperature: 0.3,
  compressAt: 90,
  compressTo: 10,
  tools: [],
}));

/** Stands in for the agent's draft, which controls the field. */
function PickerHarness({ promptId: initial = null }: { promptId?: string | null }) {
  const [promptId, setPromptId] = useState(initial);

  return <PromptPicker prompts={PROMPTS} agents={AGENTS} promptId={promptId} onPromptIdChange={setPromptId} />;
}

describe("PromptPicker", () => {
  it("says an agent has no prompt in words, not as an empty field", () => {
    render(<PickerHarness />);

    expect(
      screen.getByRole("button", {
        expanded: false,
      }),
    ).toHaveTextContent(PROMPT_PICKER_NONE_LABEL);
  });

  it("says the prompt by name, and how many agents stand on it", () => {
    render(<PickerHarness promptId="prompt-1" />);

    expect(screen.getByText("Правки коду")).toBeInTheDocument();
    expect(screen.getByText("2 АГЕНТИ")).toBeInTheDocument();
    expect(screen.queryByText(PROMPTS[0].text)).not.toBeInTheDocument();
  });

  it("says the same number in the list as in the field, so one prompt is never two counts", async () => {
    const user = userEvent.setup();

    render(<PickerHarness promptId="prompt-1" />);
    await user.click(
      screen.getByRole("button", {
        expanded: false,
      }),
    );

    expect(screen.getAllByText("2 АГЕНТИ")).toHaveLength(2);
  });

  it("takes a prompt from the list, and gives it back", async () => {
    const user = userEvent.setup();

    render(<PickerHarness />);
    await user.click(
      screen.getByRole("button", {
        expanded: false,
      }),
    );
    await user.click(
      screen.getByRole("option", {
        name: /Рев'ю/,
      }),
    );

    expect(
      screen.getByRole("button", {
        expanded: false,
      }),
    ).toHaveTextContent("Рев'ю");

    await user.click(
      screen.getByRole("button", {
        expanded: false,
      }),
    );
    await user.click(screen.getAllByRole("option")[0]);

    expect(
      screen.getByRole("button", {
        expanded: false,
      }),
    ).toHaveTextContent(PROMPT_PICKER_NONE_LABEL);
  });
});
