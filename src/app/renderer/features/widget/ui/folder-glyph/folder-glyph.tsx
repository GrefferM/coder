import type { FolderGlyphProps } from "../../interfaces";

/** The folder of a project, as 30a draws it on «Відкрити папку». */
export function FolderGlyph({ sizePx, color }: FolderGlyphProps) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <path d="M3 6h6l2 2h10v11H3z" />
    </svg>
  );
}
