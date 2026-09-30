/** Where one step stands in its pass, and its neighbours. */
export interface StepPlace {
  /** Counted from one, in the order the pass ran. */
  number: number;
  count: number;
  before: StepNeighbour | null;
  after: StepNeighbour | null;
}

/** A neighbouring step the sheet footer goes to: its number and whose turn it was. */
export interface StepNeighbour {
  id: string;
  number: number;
  agentName: string;
}
