import { IsOptional, IsUUID } from "class-validator";

/** What the project recognises speech with; `null` while no model is chosen. */
export class ProjectSpeechDto {
  @IsOptional()
  @IsUUID()
  declare listenModelId: string | null;
}
