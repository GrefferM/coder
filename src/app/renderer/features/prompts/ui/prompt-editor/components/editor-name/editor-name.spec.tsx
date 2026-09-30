import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorName } from "./editor-name";
import { PROMPT_EDITOR_NAME_LABEL, PROMPT_EDITOR_NAME_PLACEHOLDER } from "../../constants";

describe("EditorName", () => {
  it("stands the name as a word until it is asked for", () => {
    render(<EditorName name="Шукач" wasName={null} isRenaming={false} onRenaming={() => {}} onRename={() => {}} />);

    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(screen.queryByLabelText(PROMPT_EDITOR_NAME_LABEL)).not.toBeInTheDocument();
  });

  it("says the placeholder where the prompt has no name", () => {
    render(<EditorName name="" wasName={null} isRenaming={false} onRenaming={() => {}} onRename={() => {}} />);

    expect(screen.getByText(PROMPT_EDITOR_NAME_PLACEHOLDER)).toBeInTheDocument();
  });

  it("asks to be written on a press", async () => {
    const onRenaming = vi.fn();

    render(<EditorName name="Шукач" wasName={null} isRenaming={false} onRenaming={onRenaming} onRename={() => {}} />);
    await userEvent.click(screen.getByText("Шукач"));

    expect(onRenaming).toHaveBeenCalledWith(true);
  });

  it("is a field while it is being written, and gives every letter up as it is typed", async () => {
    const onRename = vi.fn();

    render(<EditorName name="Шук" wasName={null} isRenaming onRenaming={() => {}} onRename={onRename} />);

    const field = screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL);

    expect(field).toHaveValue("Шук");

    await userEvent.type(field, "а");

    expect(onRename).toHaveBeenCalledWith("Шука");
  });

  it("closes the writing on Enter", async () => {
    const onRenaming = vi.fn();

    render(<EditorName name="Шукач" wasName={null} isRenaming onRenaming={onRenaming} onRename={() => {}} />);
    await userEvent.type(screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL), "{Enter}");

    expect(onRenaming).toHaveBeenCalledWith(false);
  });

  it("wears the draft's dot while the name stands changed", () => {
    // A changed name is marked like any other field.
    const { container, rerender } = render(
      <EditorName name="Шукач" wasName={null} isRenaming={false} onRenaming={() => {}} onRename={() => {}} />,
    );

    expect(container.querySelector('[style*="border-radius: 50%"]')).toBeNull();

    rerender(<EditorName name="Шукач" wasName="Пошук" isRenaming={false} onRenaming={() => {}} onRename={() => {}} />);

    expect(container.querySelector('[style*="border-radius: 50%"]')).not.toBeNull();
  });
});
