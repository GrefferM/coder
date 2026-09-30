import type { DataSource } from "typeorm";

/** A test's own database: its location, its connection and the two ways to dispose of it. */
export interface TestDatabase {
  folder: string;
  dataSource: DataSource;
  reopen: () => Promise<DataSource>;
  close: (source?: DataSource) => Promise<void>;
}
