import { describe, expect, it } from "vitest";
import { deletedModelNote } from "./deleted-model-note";

describe("deletedModelNote", () => {
  it("names the model and how many agents stood on it", () => {
    expect(deletedModelNote("claude-sonnet-4.5", 2)).toBe(
      "Заберемо claude-sonnet-4.5 і 2 агенти на ній — ті, що згасли позаду, кожен зі своїми зв'язками.",
    );
  });

  it("counts one agent as one", () => {
    expect(deletedModelNote("qwen2.5-coder", 1)).toContain("і 1 агента на ній");
  });

  it("counts five the many way", () => {
    expect(deletedModelNote("qwen2.5-coder", 5)).toContain("і 5 агентів на ній");
  });
});
