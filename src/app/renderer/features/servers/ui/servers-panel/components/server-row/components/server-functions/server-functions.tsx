import { useState } from "react";
import { agentsOn } from "../../../../../../words";
import { foundFunctions } from "../../../../../../logic";
import {
  SERVER_FUNCTIONS_DOT_SIZE_PX,
  SERVER_FUNCTIONS_DOT_TOP_PX,
  SERVER_FUNCTIONS_FOUND_COLOR,
  SERVER_FUNCTIONS_FOUND_FONT_SIZE_PX,
  SERVER_FUNCTIONS_FOUND_LETTER_SPACING_PX,
  SERVER_FUNCTIONS_FOUND_SEPARATOR,
  SERVER_FUNCTIONS_GAP_PX,
  SERVER_FUNCTIONS_LIST_GAP_PX,
  SERVER_FUNCTIONS_NAME_COLOR,
  SERVER_FUNCTIONS_NAME_FONT_SIZE_PX,
  SERVER_FUNCTIONS_NONE_FOUND,
  SERVER_FUNCTIONS_ROW_GAP_PX,
  SERVER_FUNCTIONS_SAID_COLOR,
  SERVER_FUNCTIONS_SAID_FONT_SIZE_PX,
  SERVER_FUNCTIONS_SAID_LINE_HEIGHT,
  SERVER_FUNCTIONS_SEARCH_BACKGROUND_COLOR,
  SERVER_FUNCTIONS_SEARCH_BORDER_COLOR,
  SERVER_FUNCTIONS_SEARCH_COLOR,
  SERVER_FUNCTIONS_SEARCH_FONT_SIZE_PX,
  SERVER_FUNCTIONS_SEARCH_GAP_PX,
  SERVER_FUNCTIONS_SEARCH_ICON_COLOR,
  SERVER_FUNCTIONS_SEARCH_ICON_SIZE_PX,
  SERVER_FUNCTIONS_SEARCH_PADDING,
  SERVER_FUNCTIONS_SEARCH_PLACEHOLDER,
  SERVER_FUNCTIONS_SEARCH_RADIUS_PX,
  SERVER_FUNCTIONS_TEXT_GAP_PX,
  SERVER_UP_COLOR,
} from "../../../../../../constants";
import type { ServerFunctionsProps } from "./interfaces";

/**
 * The opened card of a server: search over what it hands over, and the list. «2 АГ.» beside a function counts the
 * agents holding it; the tick lives in the agent's own tab.
 */
export function ServerFunctions({ rows }: ServerFunctionsProps) {
  const [typed, setTyped] = useState("");
  const found = foundFunctions(rows, typed);

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: SERVER_FUNCTIONS_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: SERVER_FUNCTIONS_SEARCH_GAP_PX,
          padding: SERVER_FUNCTIONS_SEARCH_PADDING,
          borderRadius: SERVER_FUNCTIONS_SEARCH_RADIUS_PX,
          border: `1px solid ${SERVER_FUNCTIONS_SEARCH_BORDER_COLOR}`,
          background: SERVER_FUNCTIONS_SEARCH_BACKGROUND_COLOR,
        }}
      >
        <svg
          aria-hidden
          width={SERVER_FUNCTIONS_SEARCH_ICON_SIZE_PX}
          height={SERVER_FUNCTIONS_SEARCH_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={SERVER_FUNCTIONS_SEARCH_ICON_COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            flexShrink: 0,
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={SERVER_FUNCTIONS_SEARCH_PLACEHOLDER}
          aria-label={SERVER_FUNCTIONS_SEARCH_PLACEHOLDER}
          className="font-monospace flex-fill"
          style={{
            minWidth: 0,
            padding: 0,
            fontSize: SERVER_FUNCTIONS_SEARCH_FONT_SIZE_PX,
            color: SERVER_FUNCTIONS_SEARCH_COLOR,
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
        <span
          className="font-monospace"
          style={{
            flexShrink: 0,
            fontSize: SERVER_FUNCTIONS_FOUND_FONT_SIZE_PX,
            letterSpacing: SERVER_FUNCTIONS_FOUND_LETTER_SPACING_PX,
            color: SERVER_FUNCTIONS_FOUND_COLOR,
          }}
        >
          {`${found.length}${SERVER_FUNCTIONS_FOUND_SEPARATOR}${rows.length}`}
        </span>
      </div>
      {found.length === 0 ? (
        <span
          style={{
            fontSize: SERVER_FUNCTIONS_SAID_FONT_SIZE_PX,
            lineHeight: SERVER_FUNCTIONS_SAID_LINE_HEIGHT,
            color: SERVER_FUNCTIONS_SAID_COLOR,
          }}
        >
          {SERVER_FUNCTIONS_NONE_FOUND}
        </span>
      ) : (
        <div
          className="d-flex flex-column"
          style={{
            gap: SERVER_FUNCTIONS_LIST_GAP_PX,
          }}
        >
          {found.map((row) => (
            <div
              key={row.name}
              className="d-flex align-items-start"
              style={{
                gap: SERVER_FUNCTIONS_ROW_GAP_PX,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: SERVER_FUNCTIONS_DOT_SIZE_PX,
                  height: SERVER_FUNCTIONS_DOT_SIZE_PX,
                  marginTop: SERVER_FUNCTIONS_DOT_TOP_PX,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: SERVER_UP_COLOR,
                }}
              />
              <div
                className="d-flex flex-column flex-fill"
                style={{
                  gap: SERVER_FUNCTIONS_TEXT_GAP_PX,
                  minWidth: 0,
                }}
              >
                <span
                  className="font-monospace"
                  style={{
                    fontSize: SERVER_FUNCTIONS_NAME_FONT_SIZE_PX,
                    color: SERVER_FUNCTIONS_NAME_COLOR,
                    overflowWrap: "anywhere",
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    fontSize: SERVER_FUNCTIONS_SAID_FONT_SIZE_PX,
                    lineHeight: SERVER_FUNCTIONS_SAID_LINE_HEIGHT,
                    color: SERVER_FUNCTIONS_SAID_COLOR,
                  }}
                >
                  {row.description}
                </span>
              </div>
              <span
                className="font-monospace"
                style={{
                  flexShrink: 0,
                  fontSize: SERVER_FUNCTIONS_FOUND_FONT_SIZE_PX,
                  color: SERVER_FUNCTIONS_FOUND_COLOR,
                }}
              >
                {agentsOn(row.agents)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
