import type { Ref } from "react";

/** Value, change handler, and the aria label of the −/+ buttons. */
export interface StepperProps {
  label: string;
  /** Lets a card focus «+», the one way out of an empty row. */
  ref?: Ref<HTMLButtonElement>;
  value: number | null;
  onChange: (value: number) => void;
  /** A tenth for temperature, a whole number for calls; `places` is how the value is written. */
  step?: number;
  /** The floor of this row; always asked for, since the floor is the subject's own rule. */
  least: number;
  most?: number;
  places?: number;
  /** Word shown in place of the number at the floor, «∞» for a call ceiling of nought. */
  floorLabel?: string;
}
