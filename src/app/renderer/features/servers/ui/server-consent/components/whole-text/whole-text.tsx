import {
  SERVER_CONSENT_TEXT_BACKGROUND_COLOR,
  SERVER_CONSENT_TEXT_COLOR,
  SERVER_CONSENT_TEXT_FONT_SIZE_PX,
  SERVER_CONSENT_TEXT_LINE_HEIGHT,
  SERVER_CONSENT_TEXT_PADDING,
  SERVER_CONSENT_TEXT_RADIUS_PX,
} from "../../constants";
import type { WholeTextProps } from "./interfaces";

/** A run line or a folder in mono, word for word: never cut, wrapped anywhere, in its own case. */
export function WholeText({ children }: WholeTextProps) {
  return (
    <div
      className="font-monospace"
      style={{
        background: SERVER_CONSENT_TEXT_BACKGROUND_COLOR,
        borderRadius: SERVER_CONSENT_TEXT_RADIUS_PX,
        padding: SERVER_CONSENT_TEXT_PADDING,
        fontSize: SERVER_CONSENT_TEXT_FONT_SIZE_PX,
        color: SERVER_CONSENT_TEXT_COLOR,
        lineHeight: SERVER_CONSENT_TEXT_LINE_HEIGHT,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {children}
    </div>
  );
}
