import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorFoot } from "./editor-foot";
import {
  PROMPT_EDITOR_AGENTS_PREFIX,
  PROMPT_EDITOR_CANCEL_LABEL,
  PROMPT_EDITOR_NO_AGENTS_LABEL,
  PROMPT_EDITOR_SAVE_LABEL,
} from "../../constants";

describe("EditorFoot", () => {
  it("names whom a change here would reach, counting them in the form the number takes", () => {
    render(<EditorFoot agentNames={["Шукач", "Перелікар"]} onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByText(`${PROMPT_EDITOR_AGENTS_PREFIX} 2 агентів: Шукач · Перелікар`)).toBeInTheDocument();
  });

  it("says plainly that the prompt stands on nobody yet", () => {
    render(<EditorFoot agentNames={[]} onCancel={() => {}} onSave={() => {}} />);

    expect(screen.getByText(PROMPT_EDITOR_NO_AGENTS_LABEL)).toBeInTheDocument();
  });

  it("offers the two ends of the editing, each doing its own", async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();

    render(<EditorFoot agentNames={["Шукач"]} onCancel={onCancel} onSave={onSave} />);
    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText(PROMPT_EDITOR_CANCEL_LABEL));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
