import { describe, expect, it } from "vitest";
import { noneAnsweredNote } from "./none-answered-note";

describe("noneAnsweredNote", () => {
  it("says the number the calls actually came to, in the form that number takes", () => {
    // The row says what it has, and not a fixed three.
    expect(noneAnsweredNote(3)).toBe(
      "3 виклики поспіль упали, вдалого не було жодного з підключення. Каталог сервер віддав, роботу — ні.",
    );
    // The verb agrees with the noun's form.
    expect(noneAnsweredNote(5)).toMatch(/^5 викликів поспіль упало,/);
    expect(noneAnsweredNote(21)).toMatch(/^21 виклик поспіль упав,/);
  });
});
