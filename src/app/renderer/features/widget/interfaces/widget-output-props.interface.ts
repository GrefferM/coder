import type { Agent } from "../../../interfaces";
import type { WidgetExchange } from "./widget-exchange.interface";

export interface WidgetOutputProps {
  exchanges: WidgetExchange[];
  agents: Agent[];
}
