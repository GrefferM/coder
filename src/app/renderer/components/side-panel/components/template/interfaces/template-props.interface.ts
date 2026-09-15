import { type ReactNode } from "react";

export interface TemplateProps {
  label: string;
  /** Something of the section's own at the header's right edge — the chat puts its aim there. */
  pill?: ReactNode;
  count?: number;
  hasUnsaved?: boolean;
  children: ReactNode;
}
