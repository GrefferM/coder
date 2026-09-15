import type { ReactNode } from "react";

/** `wasValue` is the saved value the draft moved away from; `null` when unchanged. */
export interface SettingRowProps {
  label: string;
  children: ReactNode;
  wasValue?: string | null;
  /** A line under the row saying in plain words what its numbers mean. */
  hint?: string;
}
