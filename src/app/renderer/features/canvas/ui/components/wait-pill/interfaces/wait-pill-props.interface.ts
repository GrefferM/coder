export interface WaitPillProps {
  /** The suppliers still to have their turn, as the person named them. */
  awaitedNames: string[];
  /** The walk broke, so the pill names the repeat instead of a supplier. */
  isAwaitingRepeat: boolean;
  answered: number;
  ofSuppliers: number;
  /** The waiting agent's own colour, which the three dots take. */
  color: string;
}
