import type { ProviderKind } from "./provider-kind.type";
import type { ProviderNeed } from "./provider-need.type";

/** A provider as the renderer knows it; the key never crosses the boundary, only its hint. */
export interface ProviderState {
  id: string;
  name: string;
  kind: ProviderKind;
  /** What it asks for; a card draws a field for each. */
  needs: ProviderNeed[];
  /** Whether a turn on it may carry functions; a provider that cannot call one is asked with none. */
  takesTools: boolean;
  customaryAddress: string | null;
  keyHint: string | null;
  address: string | null;
}
