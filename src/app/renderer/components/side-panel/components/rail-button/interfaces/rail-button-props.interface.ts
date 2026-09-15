import type { ReactNode } from "react";
import type { SidePanelSide } from "../../../interfaces";

/** Glyph, label, active state, rail side (the tooltip opens inwards), and select handler. */
export interface RailButtonProps {
  glyph: ReactNode;
  label: string;
  isActive: boolean;
  side: SidePanelSide;
  onSelect: () => void;
}
