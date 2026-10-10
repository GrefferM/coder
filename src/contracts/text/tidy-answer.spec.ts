import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tidyAnswer } from "./tidy-answer";

describe("tidyAnswer", () => {
  it("takes the empty space off both ends of an answer", () => {
    assert.equal(tidyAnswer("\n\n\nОсь структура проєкту.\n\n\n"), "Ось структура проєкту.");
  });

  it("leaves one blank line between paragraphs, however many the model left", () => {
    assert.equal(tidyAnswer("Перше.\n\n\n\n\nДруге."), "Перше.\n\nДруге.");
  });

  it("keeps a list as it was written, since one newline is not an empty line", () => {
    assert.equal(tidyAnswer("- перше\n- друге"), "- перше\n- друге");
  });
});
