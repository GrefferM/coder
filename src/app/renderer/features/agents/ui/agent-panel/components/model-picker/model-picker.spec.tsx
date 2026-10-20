import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModelPicker } from "./model-picker";
import { MODEL_PICKER_PLACEHOLDER } from "./constants";
import { PICKER_SEARCH_PLACEHOLDER } from "../../../../../../components/picker-shell/constants";
import type { Agent, ProjectModel } from "../../../../../../interfaces";
import { aModel } from "../../../../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    id: "sonnet",
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
  aModel({
    id: "haiku",
    title: "claude-haiku-4.5",
    provider: "anthropic",
    inputPrice: 1,
    outputPrice: 5,
    contextCeiling: 200000,
  }),
];

const AGENTS: Agent[] = ["a", "b", "c"].map((id) => ({
  id,
  name: id,
  purpose: null,
  modelId: "sonnet",
  promptId: null,
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

function renderPicker(overrides: Partial<Parameters<typeof ModelPicker>[0]> = {}) {
  return render(<ModelPicker models={MODELS} agents={AGENTS} modelId="" onModelIdChange={() => {}} {...overrides} />);
}

describe("ModelPicker", () => {
  it("stays shut until it is asked, saying what it is for", () => {
    renderPicker();

    expect(screen.getByText(MODEL_PICKER_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows every model with its prices and how many agents run on it", async () => {
    const user = userEvent.setup();

    renderPicker();
    await user.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));

    expect(screen.getByText("claude-sonnet-4.5")).toBeInTheDocument();
    expect(screen.getByText("$3.00 · $15.00 / 1M")).toBeInTheDocument();
    expect(screen.getByText("3 АГЕНТИ")).toBeInTheDocument();
    expect(screen.getByText("БЕЗ АГЕНТІВ")).toBeInTheDocument();
  });

  it("narrows the list as it is searched, and says how many of how many are left", async () => {
    const user = userEvent.setup();

    renderPicker();
    await user.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    await user.type(screen.getByPlaceholderText(PICKER_SEARCH_PLACEHOLDER), "haiku");

    expect(screen.queryByText("claude-sonnet-4.5")).not.toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("reports the model picked and shuts", async () => {
    const user = userEvent.setup();
    const onModelIdChange = vi.fn();

    renderPicker({
      onModelIdChange,
    });
    await user.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    await user.click(screen.getByText("claude-haiku-4.5"));

    expect(onModelIdChange).toHaveBeenCalledWith("haiku");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("names the model already chosen instead of the placeholder", () => {
    renderPicker({
      modelId: "sonnet",
    });

    expect(screen.getByText("claude-sonnet-4.5")).toBeInTheDocument();
    expect(screen.queryByText(MODEL_PICKER_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("shuts when anything outside it is clicked", async () => {
    const user = userEvent.setup();

    renderPicker();
    await user.click(screen.getByText(MODEL_PICKER_PLACEHOLDER));
    await user.click(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
