import { describe, expect, it } from "vitest";
import { cannotDrawLink } from "./cannot-draw-link";
import type { Link } from "../../../interfaces";
import { aLink } from "../../../testing";

const LINKS: Link[] = [aLink()];

describe("cannotDrawLink", () => {
  it("refuses a line that already stands, since one answer would go down it twice", () => {
    expect(cannotDrawLink(LINKS, "agent-1", "agent-2")).toBe(true);
  });

  it("refuses a line that would close a ring, the shortest one included", () => {
    expect(cannotDrawLink(LINKS, "agent-2", "agent-1")).toBe(true);
    expect(cannotDrawLink(LINKS, "agent-1", "agent-1")).toBe(true);
  });

  it("lets a line be drawn where neither is true", () => {
    expect(cannotDrawLink(LINKS, "agent-2", "agent-3")).toBe(false);
  });
});
