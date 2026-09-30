import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChoiceArrows } from "./use-choice-arrows";

function Page({
  onChoose = () => {},
  isThirdShut = false,
}: {
  onChoose?: (value: string) => void;
  isThirdShut?: boolean;
}) {
  useChoiceArrows();

  return (
    <div>
      <div data-field>
        <span>ДЕ ЖИВЕ</span>
        <div data-choice>
          {["локальний", "віддалений", "чужий"].map((value, at) => (
            <button
              key={value}
              type="button"
              aria-label={value}
              aria-pressed={at === 0}
              disabled={isThirdShut && at === 2}
              onClick={() => onChoose(value)}
            />
          ))}
        </div>
      </div>

      {/* A list of rows that each lead somewhere: looks alike, but is not a choice row. */}
      <div data-field>
        <span>ФУНКЦІЇ</span>
        <button type="button" aria-label="browser_click" aria-pressed={false} />
        <button type="button" aria-label="browser_navigate" aria-pressed={false} />
      </div>

      <input aria-label="ім'я" />
    </div>
  );
}

/** The key event itself; where focus lands is the hook's doing. */
function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });

  (document.activeElement ?? window).dispatchEvent(event);

  return event;
}

describe("useChoiceArrows", () => {
  it("makes the next choice, and the focus goes with it", () => {
    const onChoose = vi.fn();

    render(<Page onChoose={onChoose} />);
    screen.getByLabelText("локальний").focus();
    press("ArrowRight");

    expect(onChoose).toHaveBeenCalledWith("віддалений");
    expect(document.activeElement).toBe(screen.getByLabelText("віддалений"));
  });

  it("walks back with the other arrow, and round from the end", () => {
    const onChoose = vi.fn();

    render(<Page onChoose={onChoose} />);
    screen.getByLabelText("локальний").focus();
    press("ArrowLeft");

    expect(onChoose).toHaveBeenCalledWith("чужий");
    expect(document.activeElement).toBe(screen.getByLabelText("чужий"));
  });

  it("takes up and down the same way, since nothing in a slot has a second dimension", () => {
    const onChoose = vi.fn();

    render(<Page onChoose={onChoose} />);
    screen.getByLabelText("локальний").focus();
    press("ArrowDown");

    expect(onChoose).toHaveBeenCalledWith("віддалений");
  });

  it("steps over a choice that is not offered", () => {
    const onChoose = vi.fn();

    render(<Page onChoose={onChoose} isThirdShut />);
    screen.getByLabelText("локальний").focus();
    press("ArrowLeft");

    expect(onChoose).toHaveBeenCalledWith("віддалений");
  });

  it("leaves a list of roads alone, however much it looks like a row of choices", () => {
    // A row that leads somewhere is not a field; arrows are not its key.
    render(<Page />);
    screen.getByLabelText("browser_click").focus();

    expect(press("ArrowRight").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(screen.getByLabelText("browser_click"));
  });

  it("leaves the caret alone in a field being typed into", () => {
    render(<Page />);
    screen.getByLabelText("ім'я").focus();

    expect(press("ArrowRight").defaultPrevented).toBe(false);
  });

  it("leaves the window's own keystrokes alone", () => {
    const onChoose = vi.fn();

    render(<Page onChoose={onChoose} />);
    screen.getByLabelText("локальний").focus();

    const event = press("ArrowRight", {
      metaKey: true,
    });

    expect(event.defaultPrevented).toBe(false);
    expect(onChoose).not.toHaveBeenCalled();
  });
});
