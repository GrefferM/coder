/** One segmented option: label and reported value. */
export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
}
