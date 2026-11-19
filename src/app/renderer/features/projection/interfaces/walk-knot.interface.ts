/** What the layout needs of a turn: which it is, where it stands in the order, and which turns fed it. */
export interface WalkKnot {
  id: string;
  place: number;
  fromStepIds: string[];
}
