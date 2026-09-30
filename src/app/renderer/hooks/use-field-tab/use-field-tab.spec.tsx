import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFieldTab } from "./use-field-tab";

function Page({
  isColorShut = false,
  isSaveShut = false,
  isSaveDim = false,
}: {
  isColorShut?: boolean;
  isSaveShut?: boolean;
  isSaveDim?: boolean;
}) {
  useFieldTab();

  return (
    <div>
      {/* The head of the tab: a way back and a rail of its own; roads, not fields. */}
      <button type="button">назад</button>

      <div data-field>
        <span>ІМ&apos;Я</span>
        {/* A slot's own action stands in its head, above the value; the walk goes to the value. */}
        <button type="button">закріпити</button>
        <input aria-label="ім'я" />
      </div>

      <div data-field>
        <span>КОЛІР</span>
        <button type="button" aria-label="бузковий" aria-pressed={false} disabled={isColorShut} />
        <button type="button" aria-label="рожевий" aria-pressed={!isColorShut} disabled={isColorShut} />
      </div>

      {/* A list of things to open: no row is a field. */}
      <div>
        <button type="button">run_lint</button>
        <button type="button">run_test</button>
      </div>

      {/* The foot of the tab: the act that writes is walked first. */}
      <div data-foot>
        <button type="button" data-action="cancel">
          скасувати
        </button>
        <button type="button" data-action="save" disabled={isSaveShut} aria-disabled={isSaveDim || undefined}>
          зберегти
        </button>
      </div>
    </div>
  );
}

/**
 * Sends only the key event; `userEvent.tab()` moves focus itself and would pass regardless. Where focus lands is the
 * hook's doing.
 */
function press(init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
    ...init,
  });

  (document.activeElement ?? window).dispatchEvent(event);

  return event;
}

function name(): HTMLElement {
  return screen.getByLabelText("ім'я");
}

function chosenColor(): HTMLElement {
  return screen.getByLabelText("рожевий");
}

function save(): HTMLElement {
  return screen.getByText("зберегти");
}

function cancel(): HTMLElement {
  return screen.getByText("скасувати");
}

describe("useFieldTab", () => {
  it("goes to the field's own value, stepping over the head's action and the tab's chrome", () => {
    render(<Page />);

    press();

    expect(document.activeElement).toBe(name());
  });

  it("counts a row of choices as one field, and lands on the one already chosen", () => {
    // The colour is one field; the choice inside it is one.
    render(<Page />);

    press();
    press();

    expect(document.activeElement).toBe(chosenColor());
  });

  it("walks past a list of things to open, because a row that leads somewhere is a road and not a field", () => {
    render(<Page />);

    press();
    press();
    press();

    // Rows between the last field and the foot are walked over.
    expect(document.activeElement).toBe(save());
  });

  it("goes from the last field into the tab's foot, the act that writes first", () => {
    // «Зберегти» comes before «Скасувати» in the walk though drawn after it.
    render(<Page />);

    press();
    press();
    press();

    expect(document.activeElement).toBe(save());

    press();

    expect(document.activeElement).toBe(cancel());
  });

  it("goes round from the foot back to the first field", () => {
    render(<Page />);

    press();
    press();
    press();
    press();
    press();

    expect(document.activeElement).toBe(name());
  });

  it("comes into the foot from the other end when the walk goes backwards", () => {
    render(<Page />);

    press({
      shiftKey: true,
    });

    expect(document.activeElement).toBe(cancel());
  });

  it("walks backwards with Shift, and from nowhere starts at the end it comes from", () => {
    render(<Page />);

    press({
      shiftKey: true,
    });
    press({
      shiftKey: true,
    });

    expect(document.activeElement).toBe(save());

    press({
      shiftKey: true,
    });

    expect(document.activeElement).toBe(chosenColor());
  });

  it("leaves out a slot with nothing left to press in it", () => {
    render(<Page isColorShut />);

    press();
    press();

    // No pressable in the colour slot, so the name is the last field and the foot follows.
    expect(document.activeElement).toBe(save());
  });

  it("steps over an act the tab is not offering at all", () => {
    // A shut act is skipped, so the foot has one act left.
    render(<Page isSaveShut />);

    press();
    press();
    press();

    expect(document.activeElement).toBe(cancel());
  });

  it("still goes to a dimmed act, because the closed door is what the walk came to show", () => {
    // A dimmed act keeps the ring and ignores Enter.
    render(<Page isSaveDim />);

    press();
    press();
    press();

    expect(document.activeElement).toBe(save());
  });

  it("takes the key back from the browser, so nothing of the old order is left behind", () => {
    render(<Page />);

    expect(press().defaultPrevented).toBe(true);
  });

  it("leaves the window's own keystrokes alone", () => {
    // ⌘Tab and its like are left to the window; only the bare key is handled.
    render(<Page />);

    const event = press({
      metaKey: true,
    });

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });
});
