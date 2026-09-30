export interface FieldHeight {
  /** How tall the field stands right now, in pixels. */
  height: number;
  /** The strip's own handler: everything the pull needs is in it. */
  onPointerDown: (event: { clientY: number; pointerId: number; currentTarget: Element }) => void;
  /** Whether a pull is in progress. */
  isPulled: boolean;
}
