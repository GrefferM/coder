import type { RefObject } from "react";
import type { ToolsPress } from "../../../../../../../interfaces";
import type { ProjectCommand, ToolGrant } from "../../../../../../../../../interfaces";

/** Grants are draft changes, written only by «Зберегти». */
export interface ToolsSectionProps {
  commands: ProjectCommand[];
  grants: ToolGrant[];
  wasValue: string | null;
  /** The model's provider has no functions: nothing can be granted, existing grants stay. */
  isLocked: boolean;
  /** The arc press that opens this list; `null` when none. */
  press: ToolsPress | null;
  /** The field itself, receiving the cursor from «ВІДКРИТИ ВИДАЧУ». */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  onGrantsChange: (grants: ToolGrant[]) => void;
  onOpenGrant: (grantId: string) => void;
}
