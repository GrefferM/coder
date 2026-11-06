import type { SegmentedOption } from "./segmented-option.interface";

/** `isChips` renders chips, not the track. */
export interface SegmentedProps<Value extends string> {
  options: SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  isChips?: boolean;
  /** Stands dim and takes no press; the caller says why beside it. */
  isDisabled?: boolean;
}
