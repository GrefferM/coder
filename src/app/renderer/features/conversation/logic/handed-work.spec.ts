import { describe, expect, it } from "vitest";
import { handedWork } from "./handed-work";

describe("handedWork", () => {
  it("gives one line's answer as it was said, with nothing around it", () => {
    expect(
      handedWork([
        {
          text: "14 тестів зелені, один червоний.",
        },
      ]),
    ).toBe("14 тестів зелені, один червоний.");
  });

  it("keeps an answer of many lines whole", () => {
    expect(
      handedWork([
        {
          text: "Перший рядок.\nДругий рядок.",
        },
      ]),
    ).toBe("Перший рядок.\nДругий рядок.");
  });

  it("puts converging answers one under another, in the order they were handed", () => {
    expect(
      handedWork([
        {
          text: "14 тестів зелені.",
        },
        {
          text: "Зауважень немає.",
        },
      ]),
    ).toBe("14 тестів зелені.\n\nЗауважень немає.");
  });
});
