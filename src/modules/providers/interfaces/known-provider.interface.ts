import type { ProviderKind, ProviderNeed } from "../../../contracts/providers";

/** A known provider; `id` matches a model's `provider`, `customaryAddress` is a local one's default. */
export interface KnownProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  /** What it asks of the person: a key, an address, or both. */
  needs: ProviderNeed[];
  /** Whether its protocol carries function calls. */
  takesTools: boolean;
  customaryAddress: string | null;
}
