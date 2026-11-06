import type { ReactNode } from "react";

export interface SpeechCardProps {
  title: string;
  /** A quiet word at the head's far end; none where the card has nothing to say of itself. */
  note?: string;
  children: ReactNode;
}
