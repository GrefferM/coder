import { describe, expect, it } from "vitest";
import { tidyAnswer } from "./tidy-answer";

describe("tidyAnswer", () => {
  it("takes the empty space off both ends of an answer", () => {
    expect(tidyAnswer("\n\n\nОсь структура проєкту.\n\n\n")).toBe("Ось структура проєкту.");
  });

  it("leaves one blank line between paragraphs, however many the model left", () => {
    expect(tidyAnswer("Перше.\n\n\n\n\nДруге.")).toBe("Перше.\n\nДруге.");
  });

  it("keeps a list as it was written, since one newline is not an empty line", () => {
    expect(tidyAnswer("- перше\n- друге")).toBe("- перше\n- друге");
  });
});
