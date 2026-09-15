import { describe, expect, it } from "vitest";
import { keepInSight } from "./keep-in-sight";

/** jsdom lays nothing out, so the list and the row are told where they stand and what the list keeps clear. */
function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
  } as DOMRect;
}

function listWith(
  row: { top: number; bottom: number },
  kept: { scrollTop?: number; padding?: number; border?: number } = {},
): HTMLElement {
  const list = document.createElement("div");
  const node = document.createElement("div");

  Object.defineProperty(list, "scrollHeight", {
    value: 500,
  });
  Object.defineProperty(list, "clientHeight", {
    value: 100,
  });
  Object.defineProperty(list, "scrollTop", {
    value: kept.scrollTop ?? 0,
    writable: true,
  });
  list.style.overflowY = "auto";
  list.style.border = `${kept.border ?? 0}px solid`;
  list.style.padding = `${kept.padding ?? 0}px`;
  list.getBoundingClientRect = () => rect(100, 200);
  node.getBoundingClientRect = () => rect(row.top, row.bottom);
  list.append(node);
  keepInSight(node);

  return list;
}

describe("keepInSight", () => {
  it("lifts the list when the row stands above what is seen", () => {
    expect(
      listWith(
        {
          top: 80,
          bottom: 100,
        },
        {
          scrollTop: 50,
        },
      ).scrollTop,
    ).toBe(30);
  });

  it("lowers the list when the row stands below what is seen", () => {
    expect(
      listWith(
        {
          top: 200,
          bottom: 225,
        },
        {
          scrollTop: 50,
        },
      ).scrollTop,
    ).toBe(75);
  });

  it("leaves the list alone when the row is already seen whole", () => {
    expect(
      listWith(
        {
          top: 120,
          bottom: 150,
        },
        {
          scrollTop: 50,
        },
      ).scrollTop,
    ).toBe(50);
  });

  it("leaves the list's own padding showing above the row it lifts to", () => {
    expect(
      listWith(
        {
          top: 95,
          bottom: 125,
        },
        {
          scrollTop: 50,
          padding: 6,
        },
      ).scrollTop,
    ).toBe(39);
  });

  it("counts the list's border as well, so the row clears it too", () => {
    expect(
      listWith(
        {
          top: 95,
          bottom: 125,
        },
        {
          scrollTop: 50,
          padding: 6,
          border: 2,
        },
      ).scrollTop,
    ).toBe(37);
  });

  it("leaves alone a row whose only tall ancestor is not a list that scrolls", () => {
    const node = document.createElement("div");

    expect(() => keepInSight(node)).not.toThrow();
  });
});
