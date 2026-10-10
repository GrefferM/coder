import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handedWork } from "./handed-work";

describe("handedWork", () => {
  it("gives one line's answer as it was said, with nothing around it", () => {
    assert.equal(
      handedWork([
        {
          text: "14 тестів зелені, один червоний.",
        },
      ]),
      "14 тестів зелені, один червоний.",
    );
  });

  it("keeps an answer of many lines whole", () => {
    assert.equal(
      handedWork([
        {
          text: "Перший рядок.\nДругий рядок.",
        },
      ]),
      "Перший рядок.\nДругий рядок.",
    );
  });

  it("puts converging answers one under another, in the order they were handed", () => {
    assert.equal(
      handedWork([
        {
          text: "14 тестів зелені.",
        },
        {
          text: "Зауважень немає.",
        },
      ]),
      "14 тестів зелені.\n\nЗауважень немає.",
    );
  });
});
