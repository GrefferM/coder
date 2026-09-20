import type { ProviderAnswer, ProviderState } from "../../../../../interfaces";
import type { ProviderDraft } from "../../../interfaces";

/** This machine's providers; saving an empty value removes the key or restores the customary address. */
export interface ProvidersState {
  providers: ProviderState[];
  answers: Record<string, ProviderAnswer>;
  askingIds: string[];
  ask: (providerId: string) => void;
  /** Told what a turn heard at a provider's address, so the sphere's dot does not wait for the card's own asking. */
  heard: (providerId: string, isAnswering: boolean) => void;
  save: (provider: ProviderState, draft: ProviderDraft) => Promise<void>;
}
