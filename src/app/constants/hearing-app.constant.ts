import * as path from "node:path";

/** Coder Hearing as `npm run build:mac` lays it among the built app's resources. */
export const HEARING_APP_NAME = "CoderHearing.app";

/** Coder Hearing as `npm run dev:app` builds it, under the repository's build/. */
export const DEV_HEARING_APP_PATH = path.join(__dirname, "..", "..", "..", "build", HEARING_APP_NAME);
