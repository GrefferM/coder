import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Mark } from "./mark";
import { MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX, QUIET_MARK_COLOR } from "../../constants";

describe("Mark", () => {
  it("is quiet mono in upper case, at the mark's own size", () => {
    render(<Mark>ОТРИМАВ ВІД EDITOR</Mark>);

    const mark = screen.getByText("ОТРИМАВ ВІД EDITOR");

    expect(mark).toHaveClass("font-monospace", "text-uppercase");
    expect(mark).toHaveStyle({
      color: QUIET_MARK_COLOR,
      fontSize: `${MARK_FONT_SIZE_PX}px`,
      letterSpacing: `${MARK_LETTER_SPACING_PX}px`,
    });
  });

  it("takes the colour of the thing it names, and the size a head gives it", () => {
    render(
      <Mark color="#e8c46a" size={10} spacing={1}>
        КРОК 3
      </Mark>,
    );

    expect(screen.getByText("КРОК 3")).toHaveStyle({
      color: "#e8c46a",
      fontSize: "10px",
      letterSpacing: "1px",
    });
  });

  it("spaces by an em where a mark is spaced against its own size", () => {
    render(<Mark spacing="0.12em">ШАБЛОН</Mark>);

    // The computed style resolves an em to pixels, so what the mark declared is what is read here.
    expect(screen.getByText("ШАБЛОН").style.letterSpacing).toBe("0.12em");
  });

  it("leaves the layout to the caller", () => {
    render(<Mark className="flex-fill text-truncate">СЬОГОДНІ</Mark>);

    expect(screen.getByText("СЬОГОДНІ")).toHaveClass("font-monospace", "text-uppercase", "flex-fill", "text-truncate");
  });

  it("keeps its own case where the mark says a whole sentence, a price or a path", () => {
    // Upper case is the mark's own voice, and a sentence is not spoken in it.
    render(<Mark isUpperCase={false}>Каталог провайдера, як він відповів</Mark>);

    const mark = screen.getByText("Каталог провайдера, як він відповів");

    expect(mark).toHaveClass("font-monospace");
    expect(mark).not.toHaveClass("text-uppercase");
  });
});
