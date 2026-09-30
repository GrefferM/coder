import type { IncomingWork } from "./incoming-work.interface";

/** One supplier of a converging point whose turn has ended: whose, what it brought, and how. */
export interface SettledSupplier {
  /** The supplier's own id; the point counts it settled by this alone. */
  fromId: string;
  /** What it answered; null where it answered nothing, which still counts as settled. */
  work: IncomingWork | null;
  /** The line the work came in by; nothing where nothing came. */
  via: string | null;
  /** The walk broke under the point, which stands until a hand repeats the broken step. */
  isBroken: boolean;
}
