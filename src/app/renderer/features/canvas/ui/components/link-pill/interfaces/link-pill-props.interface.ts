import type { Agent } from "../../../../../../interfaces";

export interface LinkPillProps {
  from: Agent;
  to: Agent;
  at: {
    x: number;
    y: number;
  };
  onDelete: () => void;
}
