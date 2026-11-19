import type { Agent } from "../../../interfaces";
import type { ReadAloud } from "../../speech";
import type { WidgetExchange } from "./widget-exchange.interface";

export interface WidgetOutputProps {
  exchanges: WidgetExchange[];
  agents: Agent[];
  /** The window's one voice, which a speaker over each answer reads it with. */
  aloud: ReadAloud;
}
