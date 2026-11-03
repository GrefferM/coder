/** The renderer asks one server what it offers; the server is queried each time, never read from a file. */
export const LOOK_MCP_SERVER_CHANNEL = "mcp:look";

/** «ЗАПУСТИТИ» on a fallen server, and after an update: releases it so it restarts. */
export const CLOSE_MCP_SERVER_CHANNEL = "mcp:close";

/**
 * A server was deleted: records that its keys are owed a sweep, which waits out the undo's thirty seconds and survives
 * an app close.
 */
export const DROP_MCP_SERVER_CHANNEL = "mcp:dropped";

/**
 * Sweeps the keys of dropped servers the project no longer names, once the undo has lapsed. Runs on project open and
 * when a deletion's timer ends.
 */
export const SWEEP_MCP_KEYS_CHANNEL = "mcp:sweep";

/** The page was opened, so «34 → 33» is read: the news clears, its memory stays. */
export const SEEN_MCP_SERVER_CHANNEL = "mcp:seen";

/** Saves the token typed into a field to this machine's keychain; an empty value removes it. */
export const SAVE_MCP_TOKEN_CHANNEL = "mcp:save-token";

/** One environment variable's value, by server and variable name; empty removes it. */
export const SAVE_MCP_ENV_VALUE_CHANNEL = "mcp:save-env-value";

/** What this machine holds for one server: whether a token is set and which names have values. */
export const MCP_SECRETS_HELD_CHANNEL = "mcp:secrets-held";

/** Whether this machine agreed to start a local server's run line as it stands now (36k). */
export const MCP_CONSENTED_CHANNEL = "mcp:consented";

/** «Запустити» in the window of 36k: this machine agrees to start the server's run line as it stands now. */
export const MCP_CONSENT_CHANNEL = "mcp:consent";
