import { IsObject } from "class-validator";
import type { ChatMessage } from "../../../contracts";

/** The card a repeat was pressed under. */
export class SayWalkAgainDto {
  @IsObject()
  declare said: ChatMessage;
}
