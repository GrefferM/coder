import { describe, expect, it } from "vitest";
import { promptFormValues } from "./prompt-form-values";
import { EMPTY_PROMPT_FORM_VALUES } from "../constants";
import { aPrompt } from "../../../testing";

describe("promptFormValues", () => {
  it("takes the name and the body, and leaves the file the body was read from behind", () => {
    // The editor writes words, not a path: where they are kept is the record's business.
    expect(
      promptFormValues(
        aPrompt({
          name: "Тези",
          file: "prompts/b9fa48a0.md",
          text: "Ти ріжеш текст на тези.",
        }),
      ),
    ).toEqual({
      name: "Тези",
      text: "Ти ріжеш текст на тези.",
    });
  });

  it("opens a prompt that does not exist yet on the empty form", () => {
    expect(promptFormValues(null)).toBe(EMPTY_PROMPT_FORM_VALUES);
  });
});
