import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptCard } from "./prompt-card";
import {
  PROMPT_CARD_DELETE_LABEL,
  PROMPT_CARD_EDIT_LABEL,
  PROMPT_CARD_EMPTY_PREVIEW,
  PROMPT_CARD_NO_AGENTS_LABEL,
} from "./constants";
import type { ProjectPrompt } from "../../../../../../interfaces";
import { aPrompt } from "../../../../../../testing";

function prompt(patch: Partial<ProjectPrompt> = {}): ProjectPrompt {
  return aPrompt({
    name: "Пошуковий",
    file: "prompts/seeker.md",
    text: "Ти шукаєш файли у теці проєкту.",
    ...patch,
  });
}

function acts() {
  return {
    onChoose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe("PromptCard", () => {
  it("names the prompt, counts who stands on it, and shows the first of its words", () => {
    render(<PromptCard prompt={prompt()} agentCount={2} isChosen={false} {...acts()} />);

    expect(screen.getByText("Пошуковий")).toBeInTheDocument();
    expect(screen.getByText("2 агенти")).toBeInTheDocument();
    expect(screen.getByText("Ти шукаєш файли у теці проєкту.")).toBeInTheDocument();
  });

  it("says in words that a prompt stands on nobody, rather than showing a nought", () => {
    render(<PromptCard prompt={prompt()} agentCount={0} isChosen={false} {...acts()} />);

    expect(screen.getByText(PROMPT_CARD_NO_AGENTS_LABEL)).toBeInTheDocument();
  });

  it("says a prompt with no words is empty, so a blank card is never a mystery", () => {
    render(
      <PromptCard
        prompt={prompt({
          text: "   ",
        })}
        agentCount={0}
        isChosen={false}
        {...acts()}
      />,
    );

    expect(screen.getByText(PROMPT_CARD_EMPTY_PREVIEW)).toBeInTheDocument();
  });

  it("keeps the word count and the two acts for the chosen card alone", async () => {
    // A card list stays a list; actions belong to the chosen card.
    const said = acts();
    const { rerender } = render(<PromptCard prompt={prompt()} agentCount={1} isChosen={false} {...said} />);

    expect(screen.queryByText(PROMPT_CARD_EDIT_LABEL)).not.toBeInTheDocument();

    rerender(<PromptCard prompt={prompt()} agentCount={1} isChosen {...said} />);

    expect(screen.getByText("6 слів")).toBeInTheDocument();

    await userEvent.click(screen.getByText(PROMPT_CARD_EDIT_LABEL));

    expect(said.onEdit).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(PROMPT_CARD_DELETE_LABEL));

    expect(said.onDelete).toHaveBeenCalledOnce();
  });

  it("says to a reader whether it is the chosen one", () => {
    const { rerender } = render(<PromptCard prompt={prompt()} agentCount={0} isChosen={false} {...acts()} />);

    expect(screen.getByText("Пошуковий").closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "false");

    rerender(<PromptCard prompt={prompt()} agentCount={0} isChosen {...acts()} />);

    expect(screen.getByText("Пошуковий").closest("[aria-expanded]")).toHaveAttribute("aria-expanded", "true");
  });
});
