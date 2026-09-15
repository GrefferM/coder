import { describe, expect, it } from "vitest";
import { promptBlocker } from "./prompt-blocker";
import { PROMPT_NAME_DROPPED_LABEL } from "../constants";

describe("promptBlocker", () => {
  it("stops nothing when the prompt is named", () => {
    expect(
      promptBlocker({
        name: "Рев'ювер",
        text: "",
      }),
    ).toEqual([]);
  });

  it("names the one field a prompt cannot be without", () => {
    expect(
      promptBlocker({
        name: "  ",
        text: "Дивись на код уважно",
      }),
    ).toEqual([PROMPT_NAME_DROPPED_LABEL]);
  });
});
