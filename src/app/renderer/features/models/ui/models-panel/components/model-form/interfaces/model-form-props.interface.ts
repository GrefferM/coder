import type { ModelFormValues } from "../../../../../interfaces";
import type { ProviderState } from "../../../../../../../interfaces";

export interface ModelFormProps {
  providers: ProviderState[];
  values: ModelFormValues;
  saved: ModelFormValues | null;
  isNew: boolean;
  /** Opened by a card's act, so the cursor goes to the field the card named. */
  isMending: boolean;
  onChange: (patch: Partial<ModelFormValues>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}
