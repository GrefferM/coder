import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextAction } from "./text-action";
import { INTERACTION_HOVER_BACKGROUND_COLOR, INTERACTION_PRESSED_BACKGROUND_COLOR } from "../../constants";

describe("TextAction", () => {
  it("takes a backdrop under the pointer, and a darker one while held", async () => {
    render(<TextAction label="РЕДАГУВАТИ" onClick={() => {}} />);

    const action = screen.getByText("РЕДАГУВАТИ");

    expect(action).toHaveStyle({
      background: "transparent",
    });

    await userEvent.hover(action);

    expect(action).toHaveStyle({
      background: INTERACTION_HOVER_BACKGROUND_COLOR,
    });

    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: action,
    });

    expect(action).toHaveStyle({
      background: INTERACTION_PRESSED_BACKGROUND_COLOR,
    });
  });

  it("lets go of the press when the pointer leaves it held", async () => {
    render(<TextAction label="ВИДАЛИТИ" isDanger onClick={() => {}} />);

    const action = screen.getByText("ВИДАЛИТИ");

    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: action,
    });
    await userEvent.unhover(action);

    expect(action).toHaveStyle({
      background: "transparent",
    });
  });

  it("keeps its click from the row it sits in", async () => {
    const onClick = vi.fn();
    const onRowClick = vi.fn();

    render(
      <div onClick={onRowClick} role="presentation">
        <TextAction label="ВИДАЛИТИ" onClick={onClick} />
      </div>,
    );
    await userEvent.click(screen.getByText("ВИДАЛИТИ"));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
