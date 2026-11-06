import type { ProjectModel, ProviderState } from "../../../../../interfaces";
import type { SpeechState } from "../../../interfaces";

export interface SpeechSectionProps {
  /** The project's models; only those of the kind `listen` are offered. */
  models: ProjectModel[];
  /** The model the project hears with, by id; `null` while none is chosen. */
  listenModelId: string | null;
  providers: ProviderState[];
  /** This machine's voice. */
  speech: SpeechState;
  onChooseListenModel: (modelId: string) => void;
  /** «ДО МОДЕЛЕЙ»: where a recognition model is made. */
  onOpenModels: () => void;
  /** «ПОСЛУХАТИ»: says a short sentence with the chosen voice. */
  onListen: () => void;
}
