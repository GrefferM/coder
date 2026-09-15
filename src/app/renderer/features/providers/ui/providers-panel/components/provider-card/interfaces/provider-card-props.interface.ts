import type { ProjectModel, ProviderAnswer, ProviderState } from "../../../../../../../interfaces";

export interface ProviderCardProps {
  provider: ProviderState;
  /**
   * What stands in the field, or **nothing at all** where nobody has typed in it. The two are not the
   * same: an untouched field shows the hint of the key already here and leaves it alone, while an emptied one is
   * a key being taken off this machine on purpose.
   */
  value: string | null;
  models: ProjectModel[];
  answer: ProviderAnswer | null;
  isAsking: boolean;
  onAsk: () => void;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onTakeUpModel: (title: string) => void;
}
