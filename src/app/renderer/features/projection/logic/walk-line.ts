import type { Point } from "../../../utils/math";
import type { WalkLine, WalkLineSizes } from "../interfaces";

/**
 * The line between two turns — horizontals and verticals, rounded where they meet. Down: out by the
 * sender's gutter, along the receiver's lane, in at its rim; up: along its own lane, up the receiver's gutter, a corner
 * into the row. Lines into one turn share that gutter; the head is drawn once, by the receiver (`walkHead`).
 */
export function walkLine(from: Point, to: Point, sizes: WalkLineSizes, isShared: boolean): WalkLine {
  const start = from.x + sizes.radius + sizes.tailAir;
  const end = to.x - sizes.radius - sizes.headAir - sizes.arrow;
  const gutter = from.y < to.y ? from.x + sizes.radius + gutterOut(sizes) : to.x - sizes.radius - gutterIn(sizes);
  const corners: Point[] =
    from.y === to.y
      ? []
      : [
          {
            x: gutter,
            y: from.y,
          },
          {
            x: gutter,
            y: to.y,
          },
        ];

  return {
    path: bentPath(
      [
        {
          x: start,
          y: from.y,
        },
        ...corners,
        {
          x: end,
          y: to.y,
        },
      ],
      sizes.corner,
    ),
    arrow: isShared ? "" : headAt(to, sizes),
  };
}

/** The one head a turn with several lines into it draws for all of them. */
export function walkHead(to: Point, sizes: WalkLineSizes): string {
  return headAt(to, sizes);
}

/** The gutter beside the sender: the air it leaves by, and room for the corner to turn in full. */
function gutterOut(sizes: WalkLineSizes): number {
  return sizes.tailAir + 2 * sizes.corner;
}

/**
 * The gutter before the receiver: the air, the head and room for the corner. The last stretch from the gutter to the
 * head's base is then two corners wide.
 */
function gutterIn(sizes: WalkLineSizes): number {
  return sizes.headAir + sizes.arrow + 2 * sizes.corner;
}

/** The arrowhead: it aims at the rim without touching it, standing off by the head's own air. */
function headAt(to: Point, sizes: WalkLineSizes): string {
  const tip = to.x - sizes.radius - sizes.headAir;
  const base = tip - sizes.arrow;

  return `${round(tip)},${round(to.y)} ${round(base)},${round(to.y - sizes.wing)} ${round(base)},${round(to.y + sizes.wing)}`;
}

/** The turns of the run, each corner cut back by as much as its two sides allow and rounded off. */
function bentPath(points: Point[], corner: number): string {
  const bends = points.slice(1, -1).map((bend, place) => {
    const before = points[place];
    const after = points[place + 2];
    const back = Math.hypot(bend.x - before.x, bend.y - before.y) || 1;
    const on = Math.hypot(after.x - bend.x, after.y - bend.y) || 1;
    const cut = Math.min(corner, back / 2, on / 2);

    return [
      `L ${round(bend.x + ((before.x - bend.x) / back) * cut)} ${round(bend.y + ((before.y - bend.y) / back) * cut)}`,
      `Q ${round(bend.x)} ${round(bend.y)}`,
      `${round(bend.x + ((after.x - bend.x) / on) * cut)} ${round(bend.y + ((after.y - bend.y) / on) * cut)}`,
    ].join(" ");
  });
  const last = points[points.length - 1];

  return [`M ${round(points[0].x)} ${round(points[0].y)}`, ...bends, `L ${round(last.x)} ${round(last.y)}`].join(" ");
}

/** A tenth of a pixel is as fine as a drawn line needs; the rest is noise in the path. */
function round(one: number): number {
  return Math.round(one * 10) / 10;
}
