import { IsIn } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

/** Which provider is being asked whether it answers. */
export class AskProviderDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;
}
