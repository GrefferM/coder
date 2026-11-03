import { describe, expect, it } from "vitest";
import { consentEnvLabel } from "./consent-env-label";

describe("consentEnvLabel", () => {
  it("counts the names the server starts with after the head", () => {
    expect(consentEnvLabel(4)).toBe("ЗМІННІ СЕРЕДОВИЩА · 4");
  });
});
