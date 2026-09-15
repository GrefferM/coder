import { describe, expect, it } from "vitest";
import { deletedServerLabel } from "./deleted-server-label";

describe("deletedServerLabel", () => {
  it("names the grants that went with the server", () => {
    expect(deletedServerLabel(4)).toBe("СЕРВЕР ВИДАЛЕНО · 4 ВИДАЧІ ЗНИКЛИ");
    expect(deletedServerLabel(1)).toBe("СЕРВЕР ВИДАЛЕНО · 1 ВИДАЧА ЗНИКЛА");
    expect(deletedServerLabel(7)).toBe("СЕРВЕР ВИДАЛЕНО · 7 ВИДАЧ ЗНИКЛО");
  });

  it("says only that it went when nobody had been granted a function of it", () => {
    expect(deletedServerLabel(0)).toBe("СЕРВЕР ВИДАЛЕНО");
  });
});
