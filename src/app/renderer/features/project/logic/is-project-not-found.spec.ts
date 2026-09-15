import { describe, expect, it } from "vitest";
import { isProjectNotFound } from "./is-project-not-found";
import { PROJECT_NOT_FOUND } from "../constants";

describe("isProjectNotFound", () => {
  it("finds the code inside the wrapping the main process puts around it", () => {
    // Electron hands the renderer its own sentence with the code somewhere in the middle of it.
    expect(isProjectNotFound(new Error(`Error invoking remote method: ${PROJECT_NOT_FOUND}: no config`))).toBe(true);
  });

  it("says no to another failure, and to what is not a failure at all", () => {
    expect(isProjectNotFound(new Error("EACCES: permission denied"))).toBe(false);
    expect(isProjectNotFound(PROJECT_NOT_FOUND)).toBe(false);
    expect(isProjectNotFound(null)).toBe(false);
  });
});
