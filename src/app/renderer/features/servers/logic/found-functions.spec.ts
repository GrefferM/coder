import { describe, expect, it } from "vitest";
import { foundFunctions } from "./found-functions";
import type { FunctionRow } from "../interfaces";

const ROWS: FunctionRow[] = [
  {
    name: "pulls.create",
    description: "Відкрити пул-реквест на гілку",
    agents: 2,
  },
  {
    name: "browser_click",
    description: "Натиснути по елементу",
    agents: 0,
  },
];

describe("foundFunctions", () => {
  it("gives back everything while nothing is typed", () => {
    expect(foundFunctions(ROWS, "")).toEqual(ROWS);
    expect(foundFunctions(ROWS, "   ")).toEqual(ROWS);
  });

  it("finds by the name, whatever the case", () => {
    expect(foundFunctions(ROWS, "PULLS").map((row) => row.name)).toEqual(["pulls.create"]);
  });

  it("finds by the server's own words too, because a person searches the sentence they know", () => {
    // The search is over one server's functions, and the name is what a person does not know yet.
    expect(foundFunctions(ROWS, "гілку").map((row) => row.name)).toEqual(["pulls.create"]);
  });

  it("finds nothing where nothing matches, and says so with a count rather than a guess", () => {
    expect(foundFunctions(ROWS, "нема такого")).toEqual([]);
  });
});
