import { describe, expect, it } from "vitest";
import { CANVAS_LAYER, CONFIRM_LAYER, PROMPT_EDITOR_LAYER, RUN_DEBUG_LAYER, SWITCHER_LAYER } from "./layers.constant";

describe("layers", () => {
  it("stands the project's open list over the canvas's own marks", () => {
    // The list is opened by a click and the marks are not, so it is never covered.
    expect(SWITCHER_LAYER).toBeGreaterThan(CANVAS_LAYER);
  });

  it("stands the debug projection over the field it takes — the canvas, its marks and the project badge", () => {
    expect(RUN_DEBUG_LAYER).toBeGreaterThan(CANVAS_LAYER);
    expect(RUN_DEBUG_LAYER).toBeGreaterThan(SWITCHER_LAYER);
  });

  it("stands a question above everything that can raise it — a hidden question answers nothing", () => {
    expect(CONFIRM_LAYER).toBeGreaterThan(PROMPT_EDITOR_LAYER);
    expect(CONFIRM_LAYER).toBeGreaterThan(SWITCHER_LAYER);
    expect(CONFIRM_LAYER).toBeGreaterThan(CANVAS_LAYER);
    expect(CONFIRM_LAYER).toBeGreaterThan(RUN_DEBUG_LAYER);
  });

  it("gives every floating thing a number of its own, so nothing is settled by writing order", () => {
    const layers = [CANVAS_LAYER, SWITCHER_LAYER, RUN_DEBUG_LAYER, PROMPT_EDITOR_LAYER, CONFIRM_LAYER];

    expect(new Set(layers).size).toBe(layers.length);
  });
});
