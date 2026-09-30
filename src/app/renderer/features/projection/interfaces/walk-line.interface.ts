/** The line between two turns of a pass, drawn with right angles alone. */
export interface WalkLine {
  /** The run as an SVG path: horizontals, verticals, rounded corners. */
  path: string;
  /** The arrowhead as SVG polygon points; empty where the receiver draws it for all. */
  arrow: string;
}

/** Sizes the routing is built on; gutters are derived from the air, the arrowhead and the corner. */
export interface WalkLineSizes {
  /** The sphere's drawn radius; lines leave and arrive near the rim. */
  radius: number;
  /** Air between the sender's rim and the line's start, 0.28 of the radius. */
  tailAir: number;
  /** Air between the arrow's point and the receiver's rim, 0.38 of the radius. */
  headAir: number;
  /** How much a corner is rounded off. */
  corner: number;
  arrow: number;
  wing: number;
}
