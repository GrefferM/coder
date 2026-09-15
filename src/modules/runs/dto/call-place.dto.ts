import { IsNotEmpty, IsString } from "class-validator";

/** Which call is being asked about — its own id, which is the whole of what the row has. */
export class CallPlaceDto {
  @IsString()
  @IsNotEmpty()
  declare callId: string;
}
