import { IsIn, IsString } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

/** An empty value removes the key. */
export class SaveProviderKeyDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;

  @IsString()
  declare value: string;
}
