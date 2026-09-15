import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LostPrompt } from "./lost-prompt";
import { LOST_PROMPT_NOTE, LOST_PROMPT_REMOVE_LABEL } from "./constants";
import { AGENT_LOST_PROMPT_NAME } from "../../../../../../constants";

describe("LostPrompt", () => {
  it("says the agent names a prompt whose file is gone", () => {
    render(<LostPrompt onRemove={() => {}} />);

    expect(screen.getByText(LOST_PROMPT_NOTE)).toBeInTheDocument();
    expect(screen.getByText(AGENT_LOST_PROMPT_NAME)).toBeInTheDocument();
  });

  it("takes the tie off when asked, a prompt being something an agent can stand without", async () => {
    // Unlike the model, a prompt may simply be dropped — so this tie has its own way out.
    const onRemove = vi.fn();

    render(<LostPrompt onRemove={onRemove} />);
    await userEvent.click(screen.getByText(LOST_PROMPT_REMOVE_LABEL));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
