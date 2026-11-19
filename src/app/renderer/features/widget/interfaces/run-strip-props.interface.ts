import type { Agent, Link } from "../../../interfaces";
import type { WidgetExchange } from "./widget-exchange.interface";

export interface RunStripProps {
  agents: Agent[];
  links: Link[];
  /** The sphere the walk began at. */
  sphereId: string;
  /** The question whose walk is drawn. */
  exchange: WidgetExchange;
}
