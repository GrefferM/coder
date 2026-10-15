import { IsNotEmpty, IsString } from "class-validator";

export class CallPlaceDto {
  @IsString()
  @IsNotEmpty()
  declare callId: string;
}
