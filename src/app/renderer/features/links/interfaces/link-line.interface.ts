/** A link's line geometry; the handle sits at the middle. */
export interface LinkLine {
  x1: number;
  y1: number;
  /** The arrow's tip, and the far end of the run a click is taken on. */
  x2: number;
  y2: number;
  /** Where the drawn line stops: the arrow's base, so a round cap never pokes out past the point. */
  stem: {
    x: number;
    y: number;
  };
  arrow: string;
  middle: {
    x: number;
    y: number;
  };
}
