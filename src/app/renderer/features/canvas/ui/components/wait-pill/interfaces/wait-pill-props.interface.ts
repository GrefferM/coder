export interface WaitPillProps {
  /** Suppliers still to have their turn, by name. */
  awaitedNames: string[];
  /** The walk broke, so the pill names the repeat instead of a supplier. */
  isAwaitingRepeat: boolean;
  answered: number;
  ofSuppliers: number;
  /** The waiting agent's own colour, which the three dots take. */
  color: string;
}
