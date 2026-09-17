import type { LinkEnd } from "../../../../interfaces";

export interface LinkPillProps {
  from: LinkEnd;
  to: LinkEnd;
  at: {
    x: number;
    y: number;
  };
  onDelete: () => void;
}
