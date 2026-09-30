import type { CommandParameter } from "../../../../../../../../../interfaces";

export interface ParametersListProps {
  parameters: CommandParameter[];
  /** The run line, read by the open card to see how the slot is written. */
  run: string;
  /** Names the run line actually uses, so a row can say whether it is written out. */
  usedNames: string[];
  /** The parameter open as a card; null while all are rows. */
  openParameterId: string | null;
  onOpen: (parameterId: string) => void;
  onSubmit: (parameter: CommandParameter) => void;
  onDraft: (parameter: CommandParameter | null) => void;
  onRemove: (parameterId: string) => void;
  onCancel: () => void;
}
