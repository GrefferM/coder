import { describe, expect, it } from "vitest";
import { deletedModelLabel } from "./deleted-model-label";

describe("deletedModelLabel", () => {
  it("names the agents and the links that came off with the model", () => {
    expect(deletedModelLabel(2, 3)).toBe("МОДЕЛЬ ВИДАЛЕНО · 2 АГЕНТИ · 3 ЗВ'ЯЗКИ");
  });

  it("counts in Ukrainian, so one agent is not «1 АГЕНТИ»", () => {
    expect(deletedModelLabel(1, 1)).toBe("МОДЕЛЬ ВИДАЛЕНО · 1 АГЕНТ · 1 ЗВ'ЯЗОК");
    expect(deletedModelLabel(5, 12)).toBe("МОДЕЛЬ ВИДАЛЕНО · 5 АГЕНТІВ · 12 ЗВ'ЯЗКІВ");
  });

  it("leaves out what did not go: a model nobody was on says only that it went", () => {
    expect(deletedModelLabel(0, 0)).toBe("МОДЕЛЬ ВИДАЛЕНО");
    expect(deletedModelLabel(2, 0)).toBe("МОДЕЛЬ ВИДАЛЕНО · 2 АГЕНТИ");
  });
});
