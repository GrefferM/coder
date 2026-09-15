import type { ProviderState } from "../../../../../../../../../interfaces";

export interface ProviderPickerProps {
  providers: ProviderState[];
  providerId: string;
  wasProviderId: string | null;
  isInvalid: boolean;
  onChange: (providerId: string) => void;
}
