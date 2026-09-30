import { IsNotEmpty, IsString } from "class-validator";

/** The call asked about, by its own id. */
export class CallPlaceDto {
  @IsString()
  @IsNotEmpty()
  declare callId: string;
}
