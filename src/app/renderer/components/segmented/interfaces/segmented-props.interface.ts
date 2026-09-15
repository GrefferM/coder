import type { SegmentedOption } from "./segmented-option.interface";

/** Options, chosen value, change handler; `isChips` renders chips, not the track. */
export interface SegmentedProps<Value extends string> {
  options: SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  isChips?: boolean;
}
