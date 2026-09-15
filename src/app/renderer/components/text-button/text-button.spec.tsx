import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextButton } from "./text-button";
import { MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX } from "../../constants";

const TONE = {
  rest: "#a9808a",
  lit: "#c79aa4",
};

describe("TextButton", () => {
  it("is a bare mark that presses", () => {
    const onPress = vi.fn();

    render(
      <TextButton tone={TONE} onPress={onPress}>
        ЗУПИНИТИ
      </TextButton>,
    );

    const button = screen.getByRole("button", {
      name: "ЗУПИНИТИ",
    });

    expect(button).toHaveClass("font-monospace", "text-uppercase");
    expect(button).toHaveStyle({
      background: "transparent",
      color: TONE.rest,
      fontSize: `${MARK_FONT_SIZE_PX}px`,
      letterSpacing: `${MARK_LETTER_SPACING_PX}px`,
    });

    fireEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("lights under the pointer", () => {
    render(
      <TextButton tone={TONE} onPress={() => undefined}>
        ЗУПИНИТИ
      </TextButton>,
    );

    const button = screen.getByRole("button", {
      name: "ЗУПИНИТИ",
    });

    fireEvent.mouseEnter(button);

    expect(button).toHaveStyle({
      color: TONE.lit,
    });
  });

  it("holds a glyph beside the word, and the layout the caller gives it", () => {
    render(
      <TextButton tone={TONE} onPress={() => undefined} gap={7} className="me-auto">
        <svg data-testid="glyph" />
        ЗУПИНИТИ
      </TextButton>,
    );

    const button = screen.getByRole("button", {
      name: "ЗУПИНИТИ",
    });

    expect(button).toContainElement(screen.getByTestId("glyph"));
    expect(button).toHaveClass("me-auto");
    expect(button).toHaveStyle({
      gap: "7px",
    });
  });
});
