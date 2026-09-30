import type { AttachGlyphProps } from "./interfaces";

/** The mark of an attachment, a folder or a single file, drawn the same wherever an attachment is named. */
export function AttachGlyph({ kind, size, color }: AttachGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
      }}
    >
      {kind === "folder" ? (
        <path d="M3 6h6l2 2h10v11H3z" />
      ) : (
        <>
          <path d="M14 3H6v18h12V7z" />
          <path d="M14 3v4h4" />
        </>
      )}
    </svg>
  );
}
