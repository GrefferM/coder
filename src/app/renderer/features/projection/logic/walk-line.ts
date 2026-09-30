import type { Point } from "../../../utils/math";
import type { WalkLine, WalkLineSizes } from "../interfaces";

/**
 * The line between two turns: horizontals and verticals with rounded corners. Down: out by the sender's gutter, along
 * the receiver's lane, in at its rim; up: along its own lane, up the receiver's gutter, a corner into the row. Lines
 * into one turn share the gutter; the head is drawn by the receiver (`walkHead`).
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

/** The single head a turn draws for all lines into it. */
export function walkHead(to: Point, sizes: WalkLineSizes): string {
  return headAt(to, sizes);
}

/** Gutter beside the sender: the air it leaves by plus room for a full corner. */
function gutterOut(sizes: WalkLineSizes): number {
  return sizes.tailAir + 2 * sizes.corner;
}

/** Gutter before the receiver: the air, the head and room for the corner. */
function gutterIn(sizes: WalkLineSizes): number {
  return sizes.headAir + sizes.arrow + 2 * sizes.corner;
}

/** The arrowhead, aimed at the rim and standing off by the head's air. */
function headAt(to: Point, sizes: WalkLineSizes): string {
  const tip = to.x - sizes.radius - sizes.headAir;
  const base = tip - sizes.arrow;

  return `${round(tip)},${round(to.y)} ${round(base)},${round(to.y - sizes.wing)} ${round(base)},${round(to.y + sizes.wing)}`;
}

/** The run's turns, each corner cut back as far as its two sides allow and rounded. */
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

/** Rounds to a tenth of a pixel. */
function round(one: number): number {
  return Math.round(one * 10) / 10;
}
