import type { IncomingWork } from "./incoming-work.interface";

/** One supplier of a converging point whose turn has ended — whose it was, what it brought, and how. */
export interface SettledSupplier {
  /** The supplier itself, by its own id: the point counts it settled by that and by nothing else. */
  fromId: string;
  /** What it answered; nothing where it answered nothing, and the point still counts it settled. */
  work: IncomingWork | null;
  /** The line the work came in by; nothing where nothing came. */
  via: string | null;
  /** The walk broke under the point, so it stands until a hand runs the broken step again. */
  isBroken: boolean;
}
