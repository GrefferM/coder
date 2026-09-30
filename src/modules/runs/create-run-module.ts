import { RunController } from "./controllers";
import { RunKeeper, RunReader, RunSearch, RunWriter } from "./services";
import { TypeormRunStore, runTablesOf } from "./stores";
import type { DataSource } from "typeorm";
import type { RunModule } from "./interfaces";

export function createRunModule(dataSource: DataSource): RunModule {
  // All services share one store.
  const store = new TypeormRunStore(runTablesOf(dataSource));
  const keeper = new RunKeeper(store);

  return {
    controller: new RunController(new RunWriter(store), new RunReader(store), new RunSearch(store), keeper),
    keeper,
  };
}
