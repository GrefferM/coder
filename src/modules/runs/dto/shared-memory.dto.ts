import { IsUUID } from "class-validator";

/** One question's shared memory, asked by the run it stands in and its own id. */
export class SharedMemoryDto {
  @IsUUID()
  declare runId: string;

  @IsUUID()
  declare questionId: string;
}
