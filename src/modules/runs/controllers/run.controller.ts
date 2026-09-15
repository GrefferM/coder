import { Validate } from "../../../utils/dto-validation";
import { RunKeeper, RunReader, RunSearch, RunWriter } from "../services";
import {
  AddStepDto,
  AskAgainDto,
  CallPlaceDto,
  CloseRunDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  OpenRunDto,
  ReadRunDto,
  SearchRunsDto,
} from "../dto";
import type { CallPlace, Run, RunHit, RunOpened, RunWhole } from "../interfaces";

/** The entry point to the record of a run: writing one as it goes, and reading it afterwards. */
export class RunController {
  constructor(
    private readonly writer: RunWriter,
    private readonly reader: RunReader,
    private readonly search: RunSearch,
    private readonly keeper: RunKeeper,
  ) {}

  @Validate()
  async open(payload: OpenRunDto): Promise<RunOpened> {
    return this.writer.open(payload);
  }

  @Validate()
  async step(payload: AddStepDto): Promise<string> {
    return this.writer.step(payload);
  }

  @Validate()
  async askAgain(payload: AskAgainDto): Promise<string | null> {
    return this.writer.askAgain(payload);
  }

  @Validate()
  async close(payload: CloseRunDto): Promise<void> {
    return this.writer.close(payload);
  }

  @Validate()
  async list(payload: ListRunsDto): Promise<Run[]> {
    return this.reader.list(payload.directory);
  }

  @Validate()
  async one(payload: ReadRunDto): Promise<RunWhole | null> {
    return this.reader.one(payload.id);
  }

  /** Where one call stands, so «ПОКАЗАТИ ВИКЛИК» can lead the chat to it. */
  @Validate()
  async placeOfCall(payload: CallPlaceDto): Promise<CallPlace | null> {
    return this.reader.placeOfCall(payload.callId);
  }

  /** Every run of this project the word stands in, each with the found words themselves. */
  @Validate()
  async find(payload: SearchRunsDto): Promise<RunHit[]> {
    return this.search.find(payload.directory, payload.query);
  }

  @Validate()
  async forget(payload: ForgetRunDto): Promise<boolean> {
    return this.keeper.forget(payload);
  }

  @Validate()
  async forgetAll(payload: ForgetRunsDto): Promise<number> {
    return this.keeper.forgetEnded(payload.directory);
  }
}
