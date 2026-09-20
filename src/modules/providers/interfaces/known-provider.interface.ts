import type { ProviderKind, ProviderNeed } from "../../../contracts/providers";

/** One known provider; `id` matches a model's `provider` field, `customaryAddress` is a local one's default. */
export interface KnownProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  /** What it asks of the person: a key, an address, or both — and nothing is asked for that is not here. */
  needs: ProviderNeed[];
  /** Whether its protocol carries function calls; RunPod's queue does not, and the app says so before a turn. */
  takesTools: boolean;
  customaryAddress: string | null;
}
