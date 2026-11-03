import type { Ref } from "react";
import type { ActionButtonVariant } from "./action-button-variant.type";

export interface ActionButtonProps {
  variant: ActionButtonVariant;
  label: string;
  type?: "button" | "submit";
  ref?: Ref<HTMLButtonElement>;
  onClick?: () => void;
  isDisabled?: boolean;
  /** `dialog` is the smaller pair of a window drawn by its own frame; `form` otherwise. */
  size?: "form" | "dialog";
}
