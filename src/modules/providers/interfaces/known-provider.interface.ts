import type { ProviderKind } from "../../../contracts/providers";

/** One known provider; `id` matches a model's `provider` field, `customaryAddress` is a local one's default. */
export interface KnownProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  customaryAddress: string | null;
}
