import type { RefObject } from "react";
import type { ToolGrant } from "../../../../../../../../../interfaces";
import type { ToolChoice } from "../../../../../../../interfaces";

/** The field a tools section grants from: what may be granted, the agent's grants, and the closed field's words. */
export interface GrantPickerProps {
  options: ToolChoice[];
  grants: ToolGrant[];
  /** Said in the closed field while nothing of the options is granted. */
  chooseLabel: string;
  /** Said after «N з M» once something is. */
  chosenTail: string;
  isChanged: boolean;
  /** The field itself, so a card naming this place can focus it. */
  fieldRef?: RefObject<HTMLButtonElement | null>;
  /** Lets something outside the field open the list. */
  openedBy?: object | null;
  onGrantsChange: (grants: ToolGrant[]) => void;
}
