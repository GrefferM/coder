export interface TroubleMarkProps {
  /** A break the walk would meet, against a fact that only wants filling in. */
  isBreak: boolean;
  /** The mark grows around its own middle as the canvas zooms out, so it stays readable. */
  markScale: number;
}
