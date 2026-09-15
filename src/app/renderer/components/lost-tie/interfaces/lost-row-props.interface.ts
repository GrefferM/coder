import type { ReactNode } from "react";

/** One broken tie: the name it points at, struck through, and whatever the tie still carries. */
export interface LostRowProps {
  name: string;
  children?: ReactNode;
}
