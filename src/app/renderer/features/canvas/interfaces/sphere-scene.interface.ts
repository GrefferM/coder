import type { CanvasPicked } from "./canvas-picked.interface";
import type { Link } from "../../../interfaces";

/** What the canvas is in the middle of, which is what every sphere on it stands against. */
export interface SphereScene {
  picked: CanvasPicked;
  /** The sphere a line is being drawn from; nothing where no line is being drawn. */
  drawnFrom: string | null;
  /** A line is chosen, so the spheres that are not its ends stand back. */
  isLinkChosen: boolean;
  /** Every line of the canvas — a line already drawn is one this one must not be drawn twice. */
  links: Link[];
}
