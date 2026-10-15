import type { RunController } from "../controllers";
import type { RunKeeper, RunReader, RunWriter } from "../services";

export interface RunModule {
  controller: RunController;
  keeper: RunKeeper;
  reader: RunReader;
  writer: RunWriter;
}
