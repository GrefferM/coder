import type { ReactNode } from "react";

import type { SphereMark } from "./sphere-mark.interface";
import type { SphereTrailProps } from "../components/sphere-trail/interfaces";

export interface SphereProps {
  name: string;
  trouble?: SphereMark | null;
  modelTitle?: string;
  color: string;
  isActive: boolean;
  /** State colour for the dot beside the name. */
  stateColor?: string;
  isSelected: boolean;
  /** The chat writes to this agent; only its halo breathes. */
  isAimed?: boolean;
  isDimmed?: boolean;
  /** Multiplier that keeps the «?» at its size while the graph shrinks. */
  markScale?: number;
  /** The canvas is small enough that the model line takes its full tone. */
  isDrawnSmall?: boolean;
  /** The dim third line under the model: the prompt's page and the key with its number. */
  trail?: SphereTrailProps | null;
  /** What stands under the labels — the work or the wait pill. */
  underLabel?: ReactNode;
  onSelect: () => void;
}
