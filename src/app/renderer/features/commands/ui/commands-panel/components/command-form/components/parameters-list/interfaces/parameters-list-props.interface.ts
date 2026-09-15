import type { CommandParameter } from "../../../../../../../../../interfaces";

export interface ParametersListProps {
  parameters: CommandParameter[];
  /** The run line, which the open card reads to see how this slot is written into it. */
  run: string;
  /** The names the run line actually uses, so a row can say whether it is written out anywhere. */
  usedNames: string[];
  /** The parameter standing open as a card; null while every one of them is a row. */
  openParameterId: string | null;
  onOpen: (parameterId: string) => void;
  onSubmit: (parameter: CommandParameter) => void;
  onDraft: (parameter: CommandParameter | null) => void;
  onRemove: (parameterId: string) => void;
  onCancel: () => void;
}
