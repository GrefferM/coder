import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CatalogueAction } from "./catalogue-action";
import { INTERACTION_ACCENT_COLOR, INTERACTION_HOVER_BACKGROUND_COLOR } from "../../constants";
import { CATALOGUE_ACTION_FILLED_HOVER_BACKGROUND_COLOR } from "./constants";

describe("CatalogueAction", () => {
  it("fills its outline under the pointer", async () => {
    render(<CatalogueAction label="Нова модель" onClick={() => {}} />);

    const action = screen.getByText("Нова модель");

    await userEvent.hover(action);

    expect(action).toHaveStyle({
      background: INTERACTION_HOVER_BACKGROUND_COLOR,
    });
  });

  it("lightens the filled one instead, which an empty section stands on", async () => {
    render(<CatalogueAction label="Нова модель" isFilled onClick={() => {}} />);

    const action = screen.getByText("Нова модель");

    expect(action).toHaveStyle({
      background: INTERACTION_ACCENT_COLOR,
    });

    await userEvent.hover(action);

    expect(action).toHaveStyle({
      background: CATALOGUE_ACTION_FILLED_HOVER_BACKGROUND_COLOR,
    });
  });

  it("reports the press", async () => {
    const onClick = vi.fn();

    render(<CatalogueAction label="Новий промпт" onClick={onClick} />);
    await userEvent.click(screen.getByText("Новий промпт"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
