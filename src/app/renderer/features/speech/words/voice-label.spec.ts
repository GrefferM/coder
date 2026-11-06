import { describe, expect, it } from "vitest";
import { voiceLabel } from "./voice-label";

describe("voiceLabel", () => {
  it("names a voice by its name and its language", () => {
    expect(
      voiceLabel({
        name: "Lesya",
        lang: "uk-UA",
      }),
    ).toBe("Lesya · uk-UA");
  });
});
