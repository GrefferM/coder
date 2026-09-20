import type { RefObject } from "react";
import type { ToolsPress } from "../../../../../../../interfaces";
import type { ProjectCommand, ToolGrant } from "../../../../../../../../../interfaces";

/** Grants are draft changes; nothing is written until «Зберегти». */
export interface ToolsSectionProps {
  commands: ProjectCommand[];
  grants: ToolGrant[];
  wasValue: string | null;
  /** The model's provider carries no functions, so nothing here may be granted; what stands, stands. */
  isLocked: boolean;
  /** The press on the arc that opens this list; `null` where none was made. */
  press: ToolsPress | null;
  /** The field itself, so «ВІДКРИТИ ВИДАЧУ» lands the cursor here. */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  onGrantsChange: (grants: ToolGrant[]) => void;
  onOpenGrant: (grantId: string) => void;
}
