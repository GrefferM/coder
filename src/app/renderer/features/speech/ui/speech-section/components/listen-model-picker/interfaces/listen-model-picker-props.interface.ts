import type { ProjectModel, ProviderState } from "../../../../../../../interfaces";
import type { MacHearingState } from "../../../../../interfaces";

export interface ListenModelPickerProps {
  /** The project's models that recognise speech. */
  models: ProjectModel[];
  providers: ProviderState[];
  /** The chosen one by id; `null` while none is, and an id no such model answers is a broken tie. */
  modelId: string | null;
  /** The machine is a Mac: macOS's row is offered. */
  isMac: boolean;
  /** This machine hears with macOS, over whatever the project chose. */
  isMacChosen: boolean;
  mac: MacHearingState;
  onChange: (modelId: string) => void;
  onChooseMac: () => void;
  onOpenModels: () => void;
}
