import { TOOLS_GROUP_ICON_SIZE_PX, TOOLS_GROUP_LABEL_COLOR } from "../tools-section/constants";
import type { SourceGlyphProps } from "./interfaces";

/** Where a function came from: terminal prompt for commands, plug for a server, two linked nodes for an agent. */
export function SourceGlyph({ source }: SourceGlyphProps) {
  return (
    <svg
      aria-hidden
      width={TOOLS_GROUP_ICON_SIZE_PX}
      height={TOOLS_GROUP_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={TOOLS_GROUP_LABEL_COLOR}
      strokeWidth={source === "command" ? "2" : "1.8"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      {source === "command" && <path d="m5 8 4 4-4 4M12 16h7" />}
      {source === "mcp" && (
        <>
          <path d="M9 3v5M15 3v5" />
          <path d="M6 8h12v3a6 6 0 0 1-12 0Z" />
          <path d="M12 17v4" />
        </>
      )}
      {source === "agent" && (
        <>
          <circle cx="6.5" cy="12" r="3" />
          <circle cx="17.5" cy="12" r="3" />
          <path d="M9.5 12h5" />
        </>
      )}
    </svg>
  );
}
