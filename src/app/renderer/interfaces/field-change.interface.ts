/** One field changed from the saved value; `label` is its name as subject, `droppedLabel` as object. */
export interface FieldChange {
  label: string;
  droppedLabel: string;
  was: string;
  now: string;
}
