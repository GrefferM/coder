import type { ReactNode } from "react";
import type { SidePanelSide } from "../../../interfaces";

export interface RailButtonProps {
  glyph: ReactNode;
  label: string;
  isActive: boolean;
  side: SidePanelSide;
  onSelect: () => void;
}
