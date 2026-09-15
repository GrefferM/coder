import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeletePromptConfirm } from "./delete-prompt-confirm";
import { DELETED_PROMPT_QUESTION_PREFIX, DELETED_PROMPT_QUESTION_SUFFIX } from "../../constants";
import { deletedPromptNote } from "../../words";
import { CONFIRM_DIALOG_YES_LABEL } from "../../../../components/confirm-dialog/constants";
import type { Agent, ProjectPrompt } from "../../../../interfaces";
import { aPrompt, anAgent } from "../../../../testing";

const prompt: ProjectPrompt = aPrompt({
  name: "Пошуковий",
  text: "Ти шукаєш файли.",
  file: "prompts/seeker.md",
});

function agent(id: string, name: string): Agent {
  return anAgent({
    id,
    name,
    promptId: "prompt-1",
    x: 0,
    y: 0,
  });
}

describe("DeletePromptConfirm", () => {
  it("names the prompt in the question itself", () => {
    render(<DeletePromptConfirm prompt={prompt} agents={[]} onConfirm={() => {}} onDismiss={() => {}} />);

    expect(
      screen.getByText(`${DELETED_PROMPT_QUESTION_PREFIX}Пошуковий${DELETED_PROMPT_QUESTION_SUFFIX}`),
    ).toBeInTheDocument();
  });

  it("names every agent that would fall to the bare model, each on its own chip", () => {
    // A prompt is something an agent can stand without, so the question counts who loses it.
    render(
      <DeletePromptConfirm
        prompt={prompt}
        agents={[agent("agent-1", "Шукач"), agent("agent-2", "Перелікар")]}
        onConfirm={() => {}}
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByText(deletedPromptNote(prompt.name, 2))).toBeInTheDocument();
    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(screen.getByText("Перелікар")).toBeInTheDocument();
  });

  it("says plainly that the prompt stands on nobody, and puts up no chips", () => {
    render(<DeletePromptConfirm prompt={prompt} agents={[]} onConfirm={() => {}} onDismiss={() => {}} />);

    expect(screen.getByText(deletedPromptNote(prompt.name, 0))).toBeInTheDocument();
  });

  it("deletes on the yes", async () => {
    const onConfirm = vi.fn();

    render(<DeletePromptConfirm prompt={prompt} agents={[]} onConfirm={onConfirm} onDismiss={() => {}} />);
    await userEvent.click(screen.getByText(CONFIRM_DIALOG_YES_LABEL));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
