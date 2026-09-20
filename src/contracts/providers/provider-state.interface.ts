import type { ProviderKind } from "./provider-kind.type";
import type { ProviderNeed } from "./provider-need.type";

/** A provider as the renderer knows it; the key itself never crosses the boundary, only its hint. */
export interface ProviderState {
  id: string;
  name: string;
  kind: ProviderKind;
  /** What it asks for before it can be called; a card draws a field for each of these and no others. */
  needs: ProviderNeed[];
  /** Whether a turn on it may carry functions at all: a provider that cannot call one is asked with none. */
  takesTools: boolean;
  customaryAddress: string | null;
  keyHint: string | null;
  address: string | null;
}
