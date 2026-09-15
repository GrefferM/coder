import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorHead } from "./editor-head";
import {
  PROMPT_EDITOR_COLLAPSE_LABEL,
  PROMPT_EDITOR_NAME_PLACEHOLDER,
  PROMPT_EDITOR_SECTION_LABEL,
  PROMPT_EDITOR_SEPARATOR,
} from "../../constants";
import { UNSAVED_MARK_LABEL } from "../../../../../../components/unsaved-mark/constants";

describe("EditorHead", () => {
  it("says where the editor stands and whose prompt is open in it", () => {
    render(<EditorHead name="Шукач" words={12} hasUnsaved={false} onClose={() => {}} />);

    expect(screen.getByText(`${PROMPT_EDITOR_SECTION_LABEL}${PROMPT_EDITOR_SEPARATOR}Шукач`)).toBeInTheDocument();
  });

  it("stands the placeholder where the prompt has no name yet", () => {
    render(<EditorHead name="" words={0} hasUnsaved={false} onClose={() => {}} />);

    expect(
      screen.getByText(`${PROMPT_EDITOR_SECTION_LABEL}${PROMPT_EDITOR_SEPARATOR}${PROMPT_EDITOR_NAME_PLACEHOLDER}`),
    ).toBeInTheDocument();
  });

  it("counts the words in the form the number takes", () => {
    const { rerender } = render(<EditorHead name="Шукач" words={1} hasUnsaved={false} onClose={() => {}} />);

    expect(screen.getByText("1 слово")).toBeInTheDocument();

    rerender(<EditorHead name="Шукач" words={3} hasUnsaved={false} onClose={() => {}} />);

    expect(screen.getByText("3 слова")).toBeInTheDocument();

    rerender(<EditorHead name="Шукач" words={12} hasUnsaved={false} onClose={() => {}} />);

    expect(screen.getByText("12 слів")).toBeInTheDocument();
  });

  it("shows the unsaved mark only while something stands unsaved", () => {
    const { rerender } = render(<EditorHead name="Шукач" words={2} hasUnsaved={false} onClose={() => {}} />);

    expect(screen.queryByText(UNSAVED_MARK_LABEL)).not.toBeInTheDocument();

    rerender(<EditorHead name="Шукач" words={2} hasUnsaved onClose={() => {}} />);

    expect(screen.getByText(UNSAVED_MARK_LABEL)).toBeInTheDocument();
  });

  it("goes back by either way out — the arrow and the collapse", async () => {
    const onClose = vi.fn();

    render(<EditorHead name="Шукач" words={2} hasUnsaved={false} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText(PROMPT_EDITOR_SECTION_LABEL));

    expect(onClose).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByText(PROMPT_EDITOR_COLLAPSE_LABEL));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
