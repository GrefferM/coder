// Points `createDataSource` at a local `.data/` directory for the `migration:*` npm scripts.
import path from "node:path";
import { createDataSource } from "./data-source";

const CLI_DATABASE_DIRECTORY = path.join(process.cwd(), ".data");

export default createDataSource(CLI_DATABASE_DIRECTORY);
