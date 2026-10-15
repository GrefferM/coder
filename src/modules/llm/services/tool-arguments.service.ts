import {
  TOOL_BOOL_WORDS,
  TOOL_COMPLAINT_BOOL,
  TOOL_COMPLAINT_ENUM,
  TOOL_COMPLAINT_ENUM_CLOSE,
  TOOL_COMPLAINT_ENUM_OPEN,
  TOOL_COMPLAINT_GOT,
  TOOL_COMPLAINT_MISSING,
  TOOL_COMPLAINT_NAME_JOIN,
  TOOL_COMPLAINT_NUMBER,
  TOOL_COMPLAINT_QUOTE_CLOSE,
  TOOL_COMPLAINT_QUOTE_OPEN,
  TOOL_COMPLAINT_SEPARATOR,
  TOOL_COMPLAINT_VALUES_SEPARATOR,
  TOOL_NOT_RUN_CLOSE,
  TOOL_NOT_RUN_MIDDLE,
  TOOL_NOT_RUN_OPEN,
  TOOL_REFUSED_MIDDLE,
  TOOL_REFUSED_SEPARATOR,
} from "../constants";
import type { AgentCommandTool, AgentToolParameter, ToolComplaint } from "../interfaces";

/** The model's arguments against the types a command declared; only commands are checked, not a server's schema. */
export class ToolArguments {
  complaints(tool: AgentCommandTool, given: Record<string, string>): ToolComplaint[] {
    return tool.parameters.flatMap((parameter) => this.complaintsOf(parameter, given));
  }

  /** What the model is handed in place of a run. */
  notRunNote(toolName: string, complaints: ToolComplaint[]): string {
    const said = complaints.map((complaint) => this.said(complaint) + complaint.told);

    return `${TOOL_NOT_RUN_OPEN}${toolName}${TOOL_NOT_RUN_MIDDLE}${said.join(TOOL_COMPLAINT_SEPARATOR)}${TOOL_NOT_RUN_CLOSE}`;
  }

  /** The same refusal for the person: names as written, the app's words. */
  refusedLine(toolName: string, complaints: ToolComplaint[]): string {
    const said = complaints.map(
      (complaint) => `${complaint.name}${TOOL_COMPLAINT_NAME_JOIN}${complaint.wrong.toUpperCase()}`,
    );

    return `${toolName}${TOOL_REFUSED_MIDDLE}${said.join(TOOL_REFUSED_SEPARATOR)}`;
  }

  private complaintsOf(parameter: AgentToolParameter, given: Record<string, string>): ToolComplaint[] {
    if (!Object.hasOwn(given, parameter.name)) {
      return parameter.isRequired
        ? [
            {
              name: parameter.name,
              wrong: TOOL_COMPLAINT_MISSING,
              told: "",
            },
          ]
        : [];
    }

    const wrong = this.wrongIn(parameter, given[parameter.name]);

    return wrong === null ? [] : [wrong];
  }

  /** `null` where the value holds or its type checks nothing. */
  private wrongIn(parameter: AgentToolParameter, value: string): ToolComplaint | null {
    if (parameter.type === "number" && !this.isNumber(value)) {
      return {
        name: parameter.name,
        wrong: TOOL_COMPLAINT_NUMBER,
        told: this.got(value),
      };
    }

    if (parameter.type === "bool" && !TOOL_BOOL_WORDS.includes(value)) {
      return {
        name: parameter.name,
        wrong: TOOL_COMPLAINT_BOOL,
        told: this.got(value),
      };
    }

    // An enum with no values has nothing to check against.
    if (parameter.type === "enum" && parameter.values.length > 0 && !parameter.values.includes(value)) {
      const list = parameter.values.join(TOOL_COMPLAINT_VALUES_SEPARATOR);

      return {
        name: parameter.name,
        wrong: TOOL_COMPLAINT_ENUM,
        told: `${TOOL_COMPLAINT_ENUM_OPEN}${list}${TOOL_COMPLAINT_ENUM_CLOSE}${this.got(value)}`,
      };
    }

    return null;
  }

  private isNumber(value: string): boolean {
    return value.trim() !== "" && Number.isFinite(Number(value));
  }

  private said(complaint: ToolComplaint): string {
    return `${complaint.name}${TOOL_COMPLAINT_NAME_JOIN}${complaint.wrong}`;
  }

  private got(value: string): string {
    return `${TOOL_COMPLAINT_GOT}${TOOL_COMPLAINT_QUOTE_OPEN}${value}${TOOL_COMPLAINT_QUOTE_CLOSE}`;
  }
}
