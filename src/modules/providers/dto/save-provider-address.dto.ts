import { IsIn, IsString } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

/** Writes a local provider's address; empty restores the customary one. */
export class SaveProviderAddressDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;

  @IsString()
  declare value: string;
}
