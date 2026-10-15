import { IsIn } from "class-validator";
import { KNOWN_PROVIDERS } from "../constants";

export class AskProviderDto {
  @IsIn(KNOWN_PROVIDERS.map((provider) => provider.id))
  declare providerId: string;
}
