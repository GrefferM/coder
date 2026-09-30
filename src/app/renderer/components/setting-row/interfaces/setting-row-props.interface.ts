import type { ReactNode } from "react";

/** `wasValue` is the saved value the draft moved away from; `null` when unchanged. */
export interface SettingRowProps {
  label: string;
  children: ReactNode;
  wasValue?: string | null;
  /** A plain-words line under the row explaining its numbers. */
  hint?: string;
}
