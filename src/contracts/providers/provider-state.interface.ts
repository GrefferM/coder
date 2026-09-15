import type { ProviderKind } from "./provider-kind.type";

/** A provider as the renderer knows it; the key itself never crosses the boundary, only its hint. */
export interface ProviderState {
  id: string;
  name: string;
  kind: ProviderKind;
  customaryAddress: string | null;
  keyHint: string | null;
  address: string | null;
}
