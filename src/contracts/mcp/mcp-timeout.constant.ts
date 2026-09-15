/**
 * How long a server is given to answer the handshake before it is taken as fallen.
 *
 * Generous on purpose: `npx some-server@latest` downloads the package before a word of the protocol is said, and
 * a minute of that is ordinary. A wrong line does not wait it out — a program that is not there fails at once.
 *
 * It stands in the contract because the screen says the number out loud — «СПИНИМО ЧЕРЕЗ 2 ХВ» — and a screen
 * naming a ceiling from its own copy is one edit away from lying.
 */
export const MCP_CONNECT_TIMEOUT_MS = 120_000;
