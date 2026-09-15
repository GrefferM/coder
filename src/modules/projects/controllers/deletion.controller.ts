import { Validate } from "../../../utils/dto-validation";
import { DeletionService } from "../services";
import { ForgetDeletionDto, OpenProjectDto, RememberDeletionDto } from "../dto";
import { Deletion } from "../interfaces";

/** The entry point to what a project has deleted. */
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @Validate()
  async remember(payload: RememberDeletionDto): Promise<string> {
    return this.deletionService.remember(payload);
  }

  @Validate()
  async list(payload: OpenProjectDto): Promise<Deletion[]> {
    return this.deletionService.list(payload.directory);
  }

  @Validate()
  async forget(payload: ForgetDeletionDto): Promise<void> {
    return this.deletionService.forget(payload);
  }
}
