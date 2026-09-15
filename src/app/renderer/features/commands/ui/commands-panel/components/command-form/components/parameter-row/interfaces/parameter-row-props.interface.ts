import type { CommandParameter } from "../../../../../../../../../interfaces";

export interface ParameterRowProps {
  parameter: CommandParameter;
  isUsed: boolean;
  onOpen: () => void;
  onRemove: () => void;
}
