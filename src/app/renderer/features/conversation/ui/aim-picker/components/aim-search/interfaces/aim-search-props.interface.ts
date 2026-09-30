import type { KeyboardEvent } from "react";

export interface AimSearchProps {
  asked: string;
  onAsk: (asked: string) => void;
  /** Keys belong to the list; the field hands them back. */
  onKeyDown: (event: KeyboardEvent) => void;
}
