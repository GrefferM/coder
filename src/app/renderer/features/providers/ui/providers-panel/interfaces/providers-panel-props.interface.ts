import type { Agent, ProjectModel, ProviderAnswer, ProviderState } from "../../../../../interfaces";
import type { ProviderDraft } from "../../../interfaces";

export interface ProvidersPanelProps {
  providers: ProviderState[];
  answers: Record<string, ProviderAnswer>;
  askingIds: string[];
  models: ProjectModel[];
  agents: Agent[];
  onAsk: (providerId: string) => void;
  onSave: (provider: ProviderState, draft: ProviderDraft) => Promise<void>;
  /** «ВИМКНУТИ» / «УВІМКНУТИ»: acts at once, and the card folds. */
  onSwitch: (provider: ProviderState, isOff: boolean) => Promise<void>;
  /** Takes an undeclared installed model up to the catalogue. */
  onTakeUpModel: (providerId: string, title: string) => void;
}
