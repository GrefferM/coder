/**
 * A renderer asks one server what it hands over. The answer is never a file's: the server is reached
 * and asked each time, which is why the catalogue can say what changed after an update.
 */
export const LOOK_MCP_SERVER_CHANNEL = "mcp:look";

/** «ЗАПУСТИТИ» on a fallen server, and the same door after an update: let it go so it starts afresh. */
export const CLOSE_MCP_SERVER_CHANNEL = "mcp:close";

/**
 * A server was deleted, so this machine writes down that its keys are owed a sweep. The keys do not go
 * yet — the undo has thirty seconds — and this row is what lets the sweep finish the job even if the app closes.
 */
export const DROP_MCP_SERVER_CHANNEL = "mcp:dropped";

/**
 * The keys of every server this machine dropped and the project no longer names, once the undo's
 * thirty seconds have passed. Called when a project opens, and again when a deletion's own timer runs out.
 */
export const SWEEP_MCP_KEYS_CHANNEL = "mcp:sweep";

/** The page was opened, so «34 → 33» has been read — the news goes out, the memory of it stays. */
export const SEEN_MCP_SERVER_CHANNEL = "mcp:seen";

/** The token typed into one field goes to this machine's keychain; an empty value takes it away. */
export const SAVE_MCP_TOKEN_CHANNEL = "mcp:save-token";

/** One environment variable's value, by the server and the variable's own name; empty takes it away. */
export const SAVE_MCP_ENV_VALUE_CHANNEL = "mcp:save-env-value";

/** What this machine holds for one server — whether a token is in, and which names have values. */
export const MCP_SECRETS_HELD_CHANNEL = "mcp:secrets-held";
