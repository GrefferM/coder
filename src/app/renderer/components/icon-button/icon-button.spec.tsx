import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./icon-button";
import { CONTROL_AT_REST_COLOR, FIRST_LEVEL_TEXT_COLOR, SECOND_LEVEL_TEXT_COLOR } from "../../constants";

describe("IconButton", () => {
  it("is a bare glyph named for a reader, quiet at rest", () => {
    render(
      <IconButton label="Закрити" onPress={() => undefined}>
        <svg data-testid="glyph" />
      </IconButton>,
    );

    const button = screen.getByRole("button", {
      name: "Закрити",
    });

    expect(button).toContainElement(screen.getByTestId("glyph"));
    expect(button).toHaveStyle({
      background: "transparent",
      color: SECOND_LEVEL_TEXT_COLOR,
      cursor: "pointer",
    });
  });

  it("lights under the pointer and presses through", () => {
    const onPress = vi.fn();

    render(
      <IconButton label="Назад" onPress={onPress}>
        <svg />
      </IconButton>,
    );

    const button = screen.getByRole("button", {
      name: "Назад",
    });

    fireEvent.mouseEnter(button);
    fireEvent.click(button);

    expect(button).toHaveStyle({
      color: FIRST_LEVEL_TEXT_COLOR,
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("takes the colours the glyph stands on", () => {
    render(
      <IconButton
        label="Далі"
        onPress={() => undefined}
        tone={{
          rest: CONTROL_AT_REST_COLOR,
          lit: "#e6e9f2",
        }}
      >
        <svg />
      </IconButton>,
    );

    const button = screen.getByRole("button", {
      name: "Далі",
    });

    expect(button).toHaveStyle({
      color: CONTROL_AT_REST_COLOR,
    });

    fireEvent.mouseEnter(button);

    expect(button).toHaveStyle({
      color: "#e6e9f2",
    });
  });

  it("goes dead in its dead colour, and does not press", () => {
    const onPress = vi.fn();

    render(
      <IconButton
        label="Далі"
        onPress={onPress}
        tone={{
          rest: CONTROL_AT_REST_COLOR,
          lit: "#e6e9f2",
          dead: "#3a4154",
        }}
        isDisabled
      >
        <svg />
      </IconButton>,
    );

    const button = screen.getByRole("button", {
      name: "Далі",
    });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveStyle({
      color: "#3a4154",
      cursor: "default",
    });
    expect(onPress).not.toHaveBeenCalled();
  });
});
