import type { DeclaringActs } from "./declaring-acts.interface";
import type { ServerActs } from "./server-acts.interface";
import type { ServerCatalogue } from "./server-catalogue.interface";
import type { ServerDeclaring } from "./server-declaring.interface";

/**
 * The catalogue in four parts, each named after what owns it, so a caller says which one it is handing over
 * instead of laying nineteen flat fields side by side and hoping the reader groups them the same way.
 */
export interface ServersPanelProps {
  catalogue: ServerCatalogue;
  declaring: ServerDeclaring;
  serverActs: ServerActs;
  declaringActs: DeclaringActs;
}
