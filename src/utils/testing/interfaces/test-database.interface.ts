import type { DataSource } from "typeorm";

/** A test's own database: where it stands, the connection to it, and the two ways to be done with it. */
export interface TestDatabase {
  folder: string;
  dataSource: DataSource;
  reopen: () => Promise<DataSource>;
  close: (source?: DataSource) => Promise<void>;
}
