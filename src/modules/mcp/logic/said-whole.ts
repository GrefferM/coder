import { MCP_EMPTY_OUTPUT_NOTE, MCP_KIND_SLOT, MCP_NOT_TEXT_NOTE } from "../constants";
import { withoutColors } from "./without-colors";

/** What a server answered, as the one string a model can be handed. */
export function saidWhole(content: unknown): string {
  if (!Array.isArray(content)) {
    return MCP_EMPTY_OUTPUT_NOTE;
  }

  const parts = (<Record<string, unknown>[]>content).map((part) =>
    part.type === "text" ? String(part.text) : MCP_NOT_TEXT_NOTE.replace(MCP_KIND_SLOT, String(part.type)),
  );
  const said = withoutColors(parts.join("\n")).trim();

  return said === "" ? MCP_EMPTY_OUTPUT_NOTE : said;
}
