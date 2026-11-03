import { IsBoolean, IsIn } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

/** Off stands the provider still; on lets it be reached again. */
export class SwitchProviderDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;

  @IsBoolean()
  declare isOff: boolean;
}
