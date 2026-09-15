import { describe, expect, it } from "vitest";
import { errorMessage } from "./error-message";

describe("errorMessage", () => {
  it("takes the message off a real error", () => {
    expect(errorMessage(new Error("No project saved in that folder."))).toBe("No project saved in that folder.");
  });

  it("reads whatever else was thrown", () => {
    expect(errorMessage("plain string")).toBe("plain string");
  });
});
