import {
  CHAT_EXPORT_ATTACHED_LABEL,
  CHAT_EXPORT_ATTACHED_SEPARATOR,
  CHAT_EXPORT_CALL_ARGS_LABEL,
  CHAT_EXPORT_CALL_ARG_PREFIX,
  CHAT_EXPORT_CALL_ARG_SEPARATOR,
  CHAT_EXPORT_CALL_BODY_PREFIX,
  CHAT_EXPORT_CALL_FAILED_LABEL,
  CHAT_EXPORT_CALL_LINE_LABEL,
  CHAT_EXPORT_CALL_PREFIX,
  CHAT_EXPORT_CALL_REFUSED_LABEL,
  CHAT_EXPORT_CALL_RESULT_LABEL,
  CHAT_EXPORT_FAILED_SUFFIX,
  CHAT_EXPORT_FILE_EXTENSION,
  CHAT_EXPORT_FILE_PREFIX,
  CHAT_EXPORT_FOLDER_SUFFIX,
  CHAT_EXPORT_HANDOFF_ARROW,
  CHAT_EXPORT_HANDOFF_PREFIX,
  CHAT_EXPORT_HEADING,
  CHAT_EXPORT_NOT_HANDED_PREFIX,
  CHAT_EXPORT_NOT_SENT_PREFIX,
  CHAT_EXPORT_NOT_STARTED_SUFFIX,
  CHAT_EXPORT_NOTE_PREFIX,
  CHAT_EXPORT_PERSON,
  CHAT_EXPORT_REASON_CLOSE,
  CHAT_EXPORT_REASON_OPEN,
  CHAT_EXPORT_RULE,
  CHAT_EXPORT_SUPPLIER_SUFFIX,
  CHAT_STOP_REASON_LABELS,
} from "../constants";
import { breakWords, saysBreak } from "./step-break";
import { timeLabel } from "../../../utils/dates";
import type { AttachedFile, ChatMessage } from "../interfaces";
import type { NamedAgent, TurnCall } from "../../../interfaces";

/**
 * The stream as a plain-text transcript: each turn's speaker and time, words, attached files, and tool calls with input
 * and output, what broke and why; no tokens, price or step.
 */
export function chatText(messages: ChatMessage[], agents: NamedAgent[]): string {
  const nameOf = (agentId: string | null): string => agents.find((agent) => agent.id === agentId)?.name ?? "";
  const blocks = messages
    .map((message, at) => turnBlock(message, wordsOf(messages, at), nameOf))
    .filter((block) => block !== null);
  const head = `${CHAT_EXPORT_HEADING} · ${dateStamp(new Date())}`;

  return [head, CHAT_EXPORT_RULE, "", ...join(blocks)].join("\n");
}

/** The save chooser's default name, «розмова-РРРР-ММ-ДД.txt», for the day written. */
export function chatFileName(at: Date = new Date()): string {
  return `${CHAT_EXPORT_FILE_PREFIX}-${isoDay(at)}${CHAT_EXPORT_FILE_EXTENSION}`;
}

/** The app's word under a turn, said once for turns that broke together, as the stream says it. */
function wordsOf(messages: ChatMessage[], at: number): string | null {
  if (messages[at].note === null || !saysBreak(messages, at)) {
    return null;
  }

  return breakWords(messages, at);
}

/** One turn as lines, or null when it has nothing worth reading. */
function turnBlock(
  message: ChatMessage,
  words: string | null,
  nameOf: (agentId: string | null) => string,
): string | null {
  const at = timeLabel(new Date(message.at));

  if (message.from === "handoff") {
    return handoffLine(message, at, nameOf);
  }

  if (message.from === "notSent") {
    return `[${at}] ${CHAT_EXPORT_NOT_SENT_PREFIX}${nameOf(message.otherAgentId)}`;
  }

  const lines: string[] = [];
  const text = message.text.trim();

  if (text !== "") {
    lines.push(text);
  }

  const attached = attachedLine(message.attached);

  if (attached !== null) {
    lines.push(attached);
  }

  for (const call of message.calls) {
    lines.push(...callLines(call));
  }

  if (words !== null) {
    lines.push(`${CHAT_EXPORT_NOTE_PREFIX}${words}`);
  }

  // An agent beat that neither spoke, attached, called nor broke.
  if (lines.length === 0) {
    return null;
  }

  return [`[${at}] ${authorOf(message, nameOf)}${markOf(message)}:`, ...lines].join("\n");
}

/** One line for work handed on, or for a line it did not go down and why. */
function handoffLine(message: ChatMessage, at: string, nameOf: (agentId: string | null) => string): string {
  const from = nameOf(message.agentId);
  const to = nameOf(message.otherAgentId);

  if (message.stopReason === null) {
    return `[${at}] ${CHAT_EXPORT_HANDOFF_PREFIX}${from}${CHAT_EXPORT_HANDOFF_ARROW}${to}`;
  }

  const reason = CHAT_STOP_REASON_LABELS[message.stopReason];

  return `[${at}] ${CHAT_EXPORT_NOT_HANDED_PREFIX}${from}${CHAT_EXPORT_HANDOFF_ARROW}${to}${CHAT_EXPORT_REASON_OPEN}${reason}${CHAT_EXPORT_REASON_CLOSE}`;
}

/** What is said after the speaker: that the turn fell, or never began. */
function markOf(message: ChatMessage): string {
  if (message.notStarted !== null) {
    return CHAT_EXPORT_NOT_STARTED_SUFFIX;
  }

  return message.isFailure ? CHAT_EXPORT_FAILED_SUFFIX : "";
}

/** Who the turn is from: the person, the agent whose turn it is, or the neighbour the work came from. */
function authorOf(message: ChatMessage, nameOf: (agentId: string | null) => string): string {
  if (message.from === "person") {
    return CHAT_EXPORT_PERSON;
  }

  if (message.from === "supplier") {
    return `${nameOf(message.otherAgentId)}${CHAT_EXPORT_SUPPLIER_SUFFIX}`;
  }

  return nameOf(message.agentId);
}

/** The «Прикріплено:» line under a question, or null when nothing was attached. */
function attachedLine(attached: AttachedFile[]): string | null {
  if (attached.length === 0) {
    return null;
  }

  const named = attached.map((one) => (one.kind === "folder" ? `${one.name}${CHAT_EXPORT_FOLDER_SUFFIX}` : one.name));

  return `${CHAT_EXPORT_ATTACHED_LABEL}${named.join(CHAT_EXPORT_ATTACHED_SEPARATOR)}`;
}

/** One call: its name, its line where it ran one, input, and output. */
function callLines(call: TurnCall): string[] {
  const lines: string[] = [`${CHAT_EXPORT_CALL_PREFIX}${call.name}`];

  if (call.line !== "") {
    lines.push(`${CHAT_EXPORT_CALL_LINE_LABEL}${call.line}`);
  }

  const args = Object.entries(call.arguments);

  if (args.length > 0) {
    lines.push(CHAT_EXPORT_CALL_ARGS_LABEL);
    lines.push(
      ...args.map(([key, value]) => `${CHAT_EXPORT_CALL_ARG_PREFIX}${key}${CHAT_EXPORT_CALL_ARG_SEPARATOR}${value}`),
    );
  }

  const back = call.refusal !== "" ? call.refusal : call.output;

  if (back.trim() !== "") {
    lines.push(call.refusal !== "" ? CHAT_EXPORT_CALL_REFUSED_LABEL : CHAT_EXPORT_CALL_RESULT_LABEL);
    lines.push(
      ...back
        .trimEnd()
        .split("\n")
        .map((row) => `${CHAT_EXPORT_CALL_BODY_PREFIX}${row}`),
    );
  } else if (call.isFailed) {
    lines.push(CHAT_EXPORT_CALL_FAILED_LABEL);
  }

  return lines;
}

/** A blank line stands between one turn and the next. */
function join(blocks: string[]): string[] {
  return blocks.flatMap((block, index) => (index === 0 ? [block] : ["", block]));
}

/** «27.09.2026» for the transcript's own head. */
function dateStamp(at: Date): string {
  return `${two(at.getDate())}.${two(at.getMonth() + 1)}.${at.getFullYear()}`;
}

/** «2026-09-27» for a file name that sorts by day. */
function isoDay(at: Date): string {
  return `${at.getFullYear()}-${two(at.getMonth() + 1)}-${two(at.getDate())}`;
}

function two(value: number): string {
  return String(value).padStart(2, "0");
}
