import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Words } from "./words";
import { WORDS_COLOR, WORDS_FONT_SIZE_PX, WORDS_LINE_HEIGHT } from "./constants";
import { SECOND_LEVEL_TEXT_COLOR } from "../../constants";

describe("Words", () => {
  it("is the app's own sentence, at one measure", () => {
    render(<Words>Заберемо сферу DOCS.</Words>);

    expect(screen.getByText("Заберемо сферу DOCS.")).toHaveStyle({
      color: WORDS_COLOR,
      fontSize: `${WORDS_FONT_SIZE_PX}px`,
      lineHeight: `${WORDS_LINE_HEIGHT}`,
    });
  });

  it("goes to the second level where a section is empty", () => {
    render(<Words isQuiet>Команд ще немає.</Words>);

    expect(screen.getByText("Команд ще немає.")).toHaveStyle({
      color: SECOND_LEVEL_TEXT_COLOR,
    });
  });

  it("leaves the layout to the caller", () => {
    render(<Words className="text-center">Історія порожня</Words>);

    expect(screen.getByText("Історія порожня")).toHaveClass("text-center");
  });
});
