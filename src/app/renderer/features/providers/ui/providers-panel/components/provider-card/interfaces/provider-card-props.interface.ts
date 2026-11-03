import type { ProjectModel, ProviderAnswer, ProviderNeed, ProviderState } from "../../../../../../../interfaces";
import type { ProviderDraft } from "../../../../../interfaces";

export interface ProviderCardProps {
  provider: ProviderState;
  /**
   * What is in each field, or `null` where nothing was typed: untouched shows the existing key's hint and leaves it
   * alone, while emptied removes the key on purpose.
   */
  value: ProviderDraft;
  models: ProjectModel[];
  answer: ProviderAnswer | null;
  isAsking: boolean;
  onAsk: () => void;
  onChange: (need: ProviderNeed, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  /** «ВИМКНУТИ», or «УВІМКНУТИ» for one standing off; acts without «ЗБЕРЕГТИ». */
  onSwitch: () => void;
  onTakeUpModel: (title: string) => void;
}
