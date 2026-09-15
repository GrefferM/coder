import { describe, expect, it } from "vitest";
import { deletedCommandLabel } from "./deleted-command-label";

describe("deletedCommandLabel", () => {
  it("names the grants that went with the command", () => {
    expect(deletedCommandLabel(4)).toBe("КОМАНДУ ВИДАЛЕНО · 4 ВИДАЧІ ЗНИКЛИ");
    expect(deletedCommandLabel(1)).toBe("КОМАНДУ ВИДАЛЕНО · 1 ВИДАЧА ЗНИКЛА");
    expect(deletedCommandLabel(7)).toBe("КОМАНДУ ВИДАЛЕНО · 7 ВИДАЧ ЗНИКЛО");
  });

  it("says only that it went when it was granted to nobody", () => {
    expect(deletedCommandLabel(0)).toBe("КОМАНДУ ВИДАЛЕНО");
  });
});
