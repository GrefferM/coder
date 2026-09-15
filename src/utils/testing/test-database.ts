import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createDataSource } from "../../modules/data-source";
import type { DataSource } from "typeorm";
import type { TestDatabase } from "./interfaces";

/**
 * The real SQLite and the real migrations, in a folder of its own, thrown away when the test lets it go. Nothing
 * here goes near the database a person's app keeps.
 */
export async function openTestDatabase(): Promise<TestDatabase> {
  const folder = await mkdtemp(path.join(os.tmpdir(), "coder-test-"));
  const dataSource = createDataSource(folder);

  await dataSource.initialize();
  await dataSource.runMigrations();

  return {
    folder,
    dataSource,
    /** The same folder read again, so a test can prove that what it wrote is in the file and not in a process. */
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
