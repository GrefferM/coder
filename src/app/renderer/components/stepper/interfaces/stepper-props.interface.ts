import type { Ref } from "react";

/** Value, change handler, and the label the −/+ buttons are announced under (aria). */
export interface StepperProps {
  label: string;
  /** A card that sent the person here puts the cursor on «+», the one way out of an empty row. */
  ref?: Ref<HTMLButtonElement>;
  value: number | null;
  onChange: (value: number) => void;
  /** A tenth for temperature, a whole number for calls; `places` is how the value is written. */
  step?: number;
  /**
   * The floor this row stands on. Asked for and never guessed: a floor is the subject's own rule, and an atom
   * holding a default one would be a second place the app decides how few calls an agent may be allowed.
   */
  least: number;
  most?: number;
  places?: number;
  /** A word shown in place of the number at the floor — «∞» for a call ceiling of nought, no ceiling at all. */
  floorLabel?: string;
}
