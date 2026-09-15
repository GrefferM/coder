import { describe, expect, it } from "vitest";
import { newsLabel } from "./news-label";

describe("newsLabel", () => {
  it("agrees with the reply, which is the thing that came", () => {
    expect(newsLabel(1)).toBe("1 НОВА");
    expect(newsLabel(3)).toBe("3 НОВІ");
    expect(newsLabel(5)).toBe("5 НОВИХ");
    expect(newsLabel(11)).toBe("11 НОВИХ");
    expect(newsLabel(22)).toBe("22 НОВІ");
  });
});
