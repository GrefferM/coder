import type { ReactNode } from "react";
import type { SidePanelSide } from "../../../interfaces";

/** Glyph, label, active state, rail side (tooltip opens inwards), select handler. */
export interface RailButtonProps {
  glyph: ReactNode;
  label: string;
  isActive: boolean;
  side: SidePanelSide;
  onSelect: () => void;
}
