import type { KeyboardEvent } from "react";

export interface AimSearchProps {
  asked: string;
  onAsk: (asked: string) => void;
  /** The keys belong to the list, so the field hands them straight back to it. */
  onKeyDown: (event: KeyboardEvent) => void;
}
