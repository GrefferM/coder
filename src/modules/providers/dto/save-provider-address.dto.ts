import { IsIn, IsString } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

/** Empty restores the customary address. */
export class SaveProviderAddressDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;

  @IsString()
  declare value: string;
}
