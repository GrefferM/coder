import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createDataSource } from "../../modules/data-source";
import type { DataSource } from "typeorm";
import type { TestDatabase } from "./interfaces";

/** Real SQLite and real migrations in a private folder, discarded after the test; never the app's database. */
export async function openTestDatabase(): Promise<TestDatabase> {
  const folder = await mkdtemp(path.join(os.tmpdir(), "coder-test-"));
  const dataSource = createDataSource(folder);

  await dataSource.initialize();
  await dataSource.runMigrations();

  return {
    folder,
    dataSource,
    /** Reopens the same folder, proving data is in the file, not the process. */
    reopen: async (): Promise<DataSource> => {
      await dataSource.destroy();

      const reopened = createDataSource(folder);

      await reopened.initialize();

      return reopened;
    },
    close: async (source?: DataSource) => {
      const standing = source ?? dataSource;

      if (standing.isInitialized) {
        await standing.destroy();
      }

      await rm(folder, {
        recursive: true,
        force: true,
      });
    },
  };
}
