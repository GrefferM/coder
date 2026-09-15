import { describe, expect, it } from "vitest";
import { promptChanges } from "./prompt-changes";
import { PROMPT_NAME_CHANGE_LABEL, PROMPT_TEXT_CHANGE_LABEL } from "../constants";

const SAVED = {
  name: "Правки коду",
  text: "Ти працюєш у наявному репозиторії.",
};

describe("promptChanges", () => {
  it("says nothing moved while the editor still holds what is saved", () => {
    expect(promptChanges(SAVED, SAVED)).toEqual([]);
  });

  it("names the field that moved and both its sides", () => {
    const [change] = promptChanges(SAVED, {
      ...SAVED,
      name: "Правки коду 2",
    });

    expect(change.label).toBe(PROMPT_NAME_CHANGE_LABEL);
    expect(change.was).toBe("Правки коду");
    expect(change.now).toBe("Правки коду 2");
  });

  it("counts the text rather than quoting it, since a prompt does not fit in a diff line", () => {
    const [change] = promptChanges(SAVED, {
      ...SAVED,
      text: `${SAVED.text} Ще речення.`,
    });

    expect(change.label).toBe(PROMPT_TEXT_CHANGE_LABEL);
    expect(change.was).toContain(String(SAVED.text.length));
    expect(change.now).not.toContain(SAVED.text);
  });
});
