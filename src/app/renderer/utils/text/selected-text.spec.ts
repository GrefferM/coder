import { describe, expect, it } from "vitest";
import { selectedText } from "./selected-text";

describe("selectedText", () => {
  it("says nothing is selected when the page holds no selection", () => {
    expect(selectedText()).toBe("");
  });

  it("gives the selected words back, without the whitespace around them", () => {
    const said = document.createElement("p");

    said.textContent = "  Готово, тест зелений.  ";
    document.body.append(said);

    const range = document.createRange();

    range.selectNodeContents(said);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    expect(selectedText()).toBe("Готово, тест зелений.");

    window.getSelection()?.removeAllRanges();
    said.remove();
  });
});
