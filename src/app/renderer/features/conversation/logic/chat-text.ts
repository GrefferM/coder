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
  CHAT_EXPORT_FILE_EXTENSION,
  CHAT_EXPORT_FILE_PREFIX,
  CHAT_EXPORT_FOLDER_SUFFIX,
  CHAT_EXPORT_HANDOFF_ARROW,
  CHAT_EXPORT_HANDOFF_PREFIX,
  CHAT_EXPORT_HEADING,
  CHAT_EXPORT_NOT_SENT_PREFIX,
  CHAT_EXPORT_PERSON,
  CHAT_EXPORT_RULE,
  CHAT_EXPORT_SUPPLIER_SUFFIX,
} from "../constants";
import { timeLabel } from "../../../utils/dates";
import type { AttachedFile, ChatMessage } from "../interfaces";
import type { NamedAgent, TurnCall } from "../../../interfaces";

/**
 * The stream as a plain-text transcript: each turn's speaker and time, words, attached files, and tool calls with input
 * and output; no tokens, price or step.
 */
export function chatText(messages: ChatMessage[], agents: NamedAgent[]): string {
  const nameOf = (agentId: string | null): string => agents.find((agent) => agent.id === agentId)?.name ?? "";
  const blocks = messages.map((message) => turnBlock(message, nameOf)).filter((block) => block !== null);
  const head = `${CHAT_EXPORT_HEADING} · ${dateStamp(new Date())}`;

  return [head, CHAT_EXPORT_RULE, "", ...join(blocks)].join("\n");
}

/** The save chooser's default name, «розмова-РРРР-ММ-ДД.txt», for the day written. */
export function chatFileName(at: Date = new Date()): string {
  return `${CHAT_EXPORT_FILE_PREFIX}-${isoDay(at)}${CHAT_EXPORT_FILE_EXTENSION}`;
}

/** One turn as lines, or null when it has nothing worth reading. */
function turnBlock(message: ChatMessage, nameOf: (agentId: string | null) => string): string | null {
  const at = timeLabel(new Date(message.at));

  if (message.from === "handoff") {
    return `[${at}] ${CHAT_EXPORT_HANDOFF_PREFIX}${nameOf(message.agentId)}${CHAT_EXPORT_HANDOFF_ARROW}${nameOf(
      message.otherAgentId,
    )}`;
  }

  if (message.from === "notSent") {
    return `[${at}] ${CHAT_EXPORT_NOT_SENT_PREFIX}${nameOf(message.otherAgentId)}`;
  }

  const lines: string[] = [`[${at}] ${authorOf(message, nameOf)}:`];
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

  // An agent beat that neither spoke, attached nor called.
  if (lines.length === 1) {
    return null;
  }

  return lines.join("\n");
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
