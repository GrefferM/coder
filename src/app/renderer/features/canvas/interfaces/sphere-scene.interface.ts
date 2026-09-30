import type { CanvasPicked } from "./canvas-picked.interface";
import type { Link } from "../../../interfaces";

/** What the canvas is in the middle of, which every sphere stands against. */
export interface SphereScene {
  picked: CanvasPicked;
  /** The sphere a line is being drawn from; null when none. */
  drawnFrom: string | null;
  /** A line is chosen, so spheres that are not its ends stand back. */
  isLinkChosen: boolean;
  /** Every line of the canvas, so a line already drawn is not drawn twice. */
  links: Link[];
}
