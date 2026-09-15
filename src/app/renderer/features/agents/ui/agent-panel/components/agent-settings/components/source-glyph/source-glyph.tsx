import { TOOLS_GROUP_ICON_SIZE_PX, TOOLS_GROUP_LABEL_COLOR } from "../tools-section/constants";
import type { SourceGlyphProps } from "./interfaces";

/**
 * The glyph that says where a function came from — the terminal prompt for the project's own commands,
 * the plug for a server. It stands in two places now, over the section and over a group inside its list, and it is
 * one drawing so that the two cannot drift apart.
 */
export function SourceGlyph({ isCommand }: SourceGlyphProps) {
  return (
    <svg
      aria-hidden
      width={TOOLS_GROUP_ICON_SIZE_PX}
      height={TOOLS_GROUP_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      stroke={TOOLS_GROUP_LABEL_COLOR}
      strokeWidth={isCommand ? "2" : "1.8"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      {isCommand ? (
        <path d="m5 8 4 4-4 4M12 16h7" />
      ) : (
        <>
          <path d="M9 3v5M15 3v5" />
          <path d="M6 8h12v3a6 6 0 0 1-12 0Z" />
          <path d="M12 17v4" />
        </>
      )}
    </svg>
  );
}
