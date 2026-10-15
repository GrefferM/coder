/**
 * OpenCode Go: one address, three protocols. Each model is served on the one its maker's API speaks, so the client
 * is chosen by the model's name. The Anthropic client appends `/v1/messages` to the root itself.
 */
export const OPENCODE_ROOT = "https://opencode.ai/zen/go";
export const OPENCODE_PROTOCOL_ROOT = `${OPENCODE_ROOT}/v1`;

/** Headers a client of Go sends: the conversation, so a gateway can route and cache by it, and who is asking. */
export const OPENCODE_SESSION_HEADER = "x-opencode-session";
export const OPENCODE_USER_AGENT = "coder-app/1.0";

export const OPENCODE_MESSAGES = "messages";
export const OPENCODE_RESPONSES = "responses";
export const OPENCODE_CHAT = "chat";

/** The name's beginning that picks the protocol; any other name goes by chat completions. */
export const OPENCODE_MESSAGE_PREFIXES = ["claude", "minimax", "qwen"];
export const OPENCODE_RESPONSE_PREFIXES = ["gpt", "grok", "muse"];

/** How the console and the CLI write a model's name: the provider first, then the name the request carries. */
export const OPENCODE_MODEL_PREFIXES = ["opencode-go/", "opencode/"];
