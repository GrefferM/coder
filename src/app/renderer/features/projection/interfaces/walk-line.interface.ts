/** The line between two turns of a pass, drawn with right angles alone. */
export interface WalkLine {
  /** The whole run as an SVG path: horizontals, verticals, and a rounded corner where they meet. */
  path: string;
  /** The arrowhead as an SVG polygon's points, or empty where the receiver draws it for them all. */
  arrow: string;
}

/**
 * The sizes the routing is built on, all of them the projection's own. The gutters are not
 * among them: they are counted from the air, the arrowhead and the corner, so a corner is never cut
 * back at any scale.
 */
export interface WalkLineSizes {
  /** The sphere's radius as drawn: a line leaves and arrives near the rim, never at the centre. */
  radius: number;
  /** The air between the sender's rim and the start of the line — 0.28 of the radius, as on the canvas. */
  tailAir: number;
  /** The air between the arrow's point and the receiver's rim — 0.38 of the radius, as on the canvas. */
  headAir: number;
  /** How much a corner is rounded off. */
  corner: number;
  arrow: number;
  wing: number;
}
