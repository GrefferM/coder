import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Template } from "./template";
import { UNSAVED_MARK_LABEL } from "../../../unsaved-mark/constants";

describe("Template", () => {
  it("shows its own label", () => {
    const { container } = render(<Template label="Агенти">body</Template>);

    expect(container).toHaveTextContent("Агенти");
  });

  it("shows whatever it's given as its own body", () => {
    const { getByText } = render(
      <Template label="Агенти">
        <span>Agent body</span>
      </Template>,
    );

    expect(getByText("Agent body")).toBeInTheDocument();
  });

  it("fills whatever space its own container gives it", () => {
    const { container } = render(<Template label="Агенти">body</Template>);

    expect(container.firstElementChild).toHaveClass("d-flex", "flex-column", "flex-fill");
  });
  /** jsdom drops `-webkit-app-region: no-drag` from the style attribute, so the box's presence is what is checked. */
  it("stands its pill in a box of its own, outside the header the window is dragged by", () => {
    const { getByText, container } = render(
      <Template label="Чат" pill={<button type="button">ТЕЗАР</button>}>
        body
      </Template>,
    );
    const header = container.firstElementChild!.firstElementChild;

    expect(getByText("ТЕЗАР").parentElement).not.toBe(header);
    expect(getByText("ТЕЗАР").parentElement?.parentElement).toBe(header);
  });

  it("says beside its own name when the section holds work that is not written", () => {
    const { queryByText, rerender } = render(<Template label="Агенти">body</Template>);

    expect(queryByText(UNSAVED_MARK_LABEL)).not.toBeInTheDocument();

    rerender(
      <Template label="Агенти" hasUnsaved>
        body
      </Template>,
    );

    expect(queryByText(UNSAVED_MARK_LABEL)).toBeInTheDocument();
  });
});
