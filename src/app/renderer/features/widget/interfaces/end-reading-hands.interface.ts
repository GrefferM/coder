import type { ReadAloud } from "../../speech";
import type { WidgetExchange } from "./widget-exchange.interface";

export interface EndReadingHands {
  exchanges: WidgetExchange[];
  aloud: ReadAloud;
  /** The chosen sphere; an end that came before it stood chosen is history. */
  sphereId: string | null;
  /** The speaker crossed: an end that comes is left unread, and never read later. */
  isSilent: boolean;
}
