import { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SidePanel } from "./side-panel";
import type { SidePanelItem, SidePanelSide } from "./interfaces";

const ITEMS: SidePanelItem[] = [
  {
    id: "files",
    realm: "project",
    glyph: "Ф",
    label: "Файли",
    content: <span>Files body</span>,
  },
  {
    id: "git",
    realm: "project",
    glyph: "G",
    label: "Git",
    content: <span>Git body</span>,
  },
  {
    id: "keys",
    realm: "machine",
    glyph: "K",
    label: "Ключі",
    content: <span>Keys body</span>,
  },
];

/** Owns the active section the way `MainPage` does, so a rail click actually switches the panel. */
function Harness({
  isCollapsed = false,
  onCollapsedChange = () => {},
  side = "left",
}: {
  isCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  side?: SidePanelSide;
}) {
  const [activeId, setActiveId] = useState("files");

  return (
    <SidePanel
      items={ITEMS}
      side={side}
      activeId={activeId}
      onActiveIdChange={setActiveId}
      widthPx={300}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    />
  );
}

describe("SidePanel", () => {
  it("shows the default active item's own label and content", () => {
    const { container } = render(<Harness />);

    expect(container).toHaveTextContent("Файли");
    expect(container).toHaveTextContent("Files body");
    expect(container).not.toHaveTextContent("Git body");
  });

  it("gives every item its own rail button", () => {
    const { getAllByRole } = render(<Harness />);

    expect(getAllByRole("button")).toHaveLength(ITEMS.length);
  });

  it("switches to another item's own panel once its own rail button is clicked", () => {
    const { getByLabelText, container } = render(<Harness />);

    fireEvent.click(getByLabelText("Git"));

    expect(container).toHaveTextContent("Git body");
    expect(container).not.toHaveTextContent("Files body");
  });

  it("draws the rule once, before the first section that belongs to this machine", () => {
    const { getAllByRole } = render(<Harness />);

    // Above the rule is what travels with the folder, below it what stays here. The rail
    // is the one place that boundary is always on screen, so it is drawn once and not per button.
    expect(getAllByRole("separator")).toHaveLength(1);
  });

  it("shows the panel at its own width, and at nothing once collapsed", () => {
    const { container, rerender } = render(<Harness side="right" />);
    const [, panelBox] = container.firstElementChild!.children;

    expect(panelBox).toHaveStyle({
      width: "300px",
    });

    rerender(<Harness side="right" isCollapsed />);

    expect(panelBox).toHaveStyle({
      width: "0px",
    });
  });

  it("asks to collapse when its own active rail button is clicked again, rather than collapsing itself", () => {
    const onCollapsedChange = vi.fn();
    const { getByLabelText } = render(<Harness side="right" onCollapsedChange={onCollapsedChange} />);

    fireEvent.click(getByLabelText("Згорнути панель"));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("asks to open when a rail button is clicked while collapsed", () => {
    const onCollapsedChange = vi.fn();
    const { getByLabelText } = render(<Harness side="right" isCollapsed onCollapsedChange={onCollapsedChange} />);

    fireEvent.click(getByLabelText("Файли"));

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("names a rail button in its own style rather than leaving it to the browser", async () => {
    const { getByLabelText, getByText } = render(<Harness />);
    const button = getByLabelText("Git");

    expect(button).not.toHaveAttribute("title");

    await userEvent.hover(button);

    expect(getByText("Git")).toBeInTheDocument();
  });
});
