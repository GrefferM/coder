export interface TroubleMarkProps {
  /** A break the walk would meet, versus a fact that only needs filling in. */
  isBreak: boolean;
  /** Grows around its middle as the canvas zooms out, to stay readable. */
  markScale: number;
}
