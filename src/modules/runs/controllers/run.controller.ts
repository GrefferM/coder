import { Validate } from "../../../utils/dto-validation";
import { RunKeeper, RunReader, RunSearch } from "../services";
import {
  CallPlaceDto,
  ForgetRunDto,
  ForgetRunsDto,
  ListRunsDto,
  ReadRunDto,
  RecordingSoundDto,
  SearchRunsDto,
} from "../dto";
import type { CallPlace, Run, RunHit, RunWhole } from "../interfaces";

/** Entry point to a run's record, read afterwards; the walks write it from the backend. */
export class RunController {
  constructor(
    private readonly reader: RunReader,
    private readonly search: RunSearch,
    private readonly keeper: RunKeeper,
  ) {}

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

  /** One recording kept with a question: its sound, played on the person's card. */
  @Validate()
  async recordingSound(payload: RecordingSoundDto): Promise<Uint8Array | null> {
    return this.reader.recordingSound(payload.id);
  }

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
