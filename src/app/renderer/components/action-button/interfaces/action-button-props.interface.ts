import type { Ref } from "react";
import type { ActionButtonVariant } from "./action-button-variant.type";

export interface ActionButtonProps {
  variant: ActionButtonVariant;
  label: string;
  type?: "button" | "submit";
  ref?: Ref<HTMLButtonElement>;
  onClick?: () => void;
  isDisabled?: boolean;
}
