import { Validate } from "../../../utils/dto-validation";
import { WalkHub } from "../services";
import { ConfigureWalksDto, GoOnInWalksDto, LetGoWalksDto, OpenWalksDto, PutWalkDto, SayWalkAgainDto } from "../dto";
import type { PutWalkAnswer, WalkSnapshot } from "../../../contracts";

export class WalkController {
  constructor(private readonly hub: WalkHub) {}

  @Validate()
  async open(payload: OpenWalksDto): Promise<WalkSnapshot> {
    return this.hub.open(payload.directory, payload.config);
  }

  @Validate()
  async configure(payload: ConfigureWalksDto): Promise<void> {
    this.hub.configure(payload.config);
  }

  async state(): Promise<WalkSnapshot | null> {
    return this.hub.snapshot();
  }

  @Validate()
  async put(payload: PutWalkDto): Promise<PutWalkAnswer | null> {
    return this.hub.put(payload);
  }

  async stop(): Promise<void> {
    this.hub.stop();
  }

  @Validate()
  async sayAgain(payload: SayWalkAgainDto): Promise<void> {
    this.hub.sayAgain(payload.said);
  }

  async fresh(): Promise<void> {
    this.hub.fresh();
  }

  @Validate()
  async goOnIn(payload: GoOnInWalksDto): Promise<void> {
    this.hub.goOnIn(payload.runId);
  }

  @Validate()
  async letGo(payload: LetGoWalksDto): Promise<void> {
    this.hub.letGo(payload.runId);
  }
}
