import { RunController } from "./controllers";
import { RunKeeper, RunReader, RunSearch, RunWriter } from "./services";
import { TypeormRunStore, runTablesOf } from "./stores";
import type { DataSource } from "typeorm";
import type { RunModule } from "./interfaces";

export function createRunModule(dataSource: DataSource): RunModule {
  // All services share one store.
  const store = new TypeormRunStore(runTablesOf(dataSource));
  const keeper = new RunKeeper(store);
  const reader = new RunReader(store);

  return {
    controller: new RunController(new RunWriter(store), reader, new RunSearch(store), keeper),
    keeper,
    reader,
  };
}
