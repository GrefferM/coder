import type { ProviderKind, ProviderNeed } from "../../../contracts/providers";

/** A known provider; `id` matches a model's `provider`, `customaryAddress` is a local one's default. */
export interface KnownProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  needs: ProviderNeed[];
  /** Whether its protocol carries function calls. */
  takesTools: boolean;
  customaryAddress: string | null;
}
