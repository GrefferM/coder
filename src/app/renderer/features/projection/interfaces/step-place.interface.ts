/** Where one step stands in its pass, and the steps on either side of it. */
export interface StepPlace {
  /** Counted from one, in the order the pass ran. */
  number: number;
  count: number;
  before: StepNeighbour | null;
  after: StepNeighbour | null;
}

/** The step the footer of the sheet steps to — its number and whose turn it was. */
export interface StepNeighbour {
  id: string;
  number: number;
  agentName: string;
}
