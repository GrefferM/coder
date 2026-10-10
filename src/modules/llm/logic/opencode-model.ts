import {
  OPENCODE_CHAT,
  OPENCODE_MESSAGES,
  OPENCODE_MESSAGE_PREFIXES,
  OPENCODE_MODEL_PREFIXES,
  OPENCODE_RESPONSES,
  OPENCODE_RESPONSE_PREFIXES,
} from "../constants";

/** The name a request carries: the model as written, without the provider the console puts in front of it. */
export function opencodeModelName(model: string): string {
  const prefix = OPENCODE_MODEL_PREFIXES.find((one) => model.startsWith(one));

  return prefix === undefined ? model : model.slice(prefix.length);
}

/** The protocol a model is reached by; a name not known goes by chat completions, as most are. */
export function opencodeProtocolOf(model: string): string {
  const name = opencodeModelName(model).toLowerCase();

  if (OPENCODE_MESSAGE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
    return OPENCODE_MESSAGES;
  }

  return OPENCODE_RESPONSE_PREFIXES.some((prefix) => name.startsWith(prefix)) ? OPENCODE_RESPONSES : OPENCODE_CHAT;
}
