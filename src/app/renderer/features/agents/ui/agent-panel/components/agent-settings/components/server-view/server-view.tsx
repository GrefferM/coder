import { namesFunction } from "../../../../../../../../interfaces";
import { useState } from "react";
import { ActionButton, StepHead } from "../../../../../../../../components";
import { useStandingStep, useWindowKeydown } from "../../../../../../../../hooks";
import { FunctionOption } from "../servers-section/components";
import { heldLabel } from "../../../../../../words";
import { AGENT_SETTINGS_FOOTER_BORDER_COLOR, SETTINGS_BACK_LABEL } from "../../constants";
import {
  SERVER_VIEW_BODY_GAP_PX,
  SERVER_VIEW_BODY_PADDING_PX,
  SERVER_VIEW_COUNT_COLOR,
  SERVER_VIEW_COUNT_FONT_SIZE_PX,
  SERVER_VIEW_COUNT_LETTER_SPACING_PX,
  SERVER_VIEW_FOOTER_GAP_PX,
  SERVER_VIEW_FOOTER_PADDING_PX,
  SERVER_VIEW_FOUND_SEPARATOR,
  SERVER_VIEW_LIST_GAP_PX,
  SERVER_VIEW_NONE_FOUND,
  SERVER_VIEW_ROW_TEXT_GAP_PX,
  SERVER_VIEW_SAID_COLOR,
  SERVER_VIEW_SAID_FONT_SIZE_PX,
  SERVER_VIEW_SAID_LINE_HEIGHT,
  SERVER_VIEW_SAVE_LABEL,
  SERVER_VIEW_SEARCH_BACKGROUND_COLOR,
  SERVER_VIEW_SEARCH_BORDER_COLOR,
  SERVER_VIEW_SEARCH_COLOR,
  SERVER_VIEW_SEARCH_FONT_SIZE_PX,
  SERVER_VIEW_SEARCH_GAP_PX,
  SERVER_VIEW_SEARCH_PADDING,
  SERVER_VIEW_SEARCH_PLACEHOLDER,
  SERVER_VIEW_SEARCH_RADIUS_PX,
  SERVER_VIEW_TITLE_COLOR,
  SERVER_VIEW_TITLE_FONT_SIZE_PX,
} from "./constants";
import { quietly } from "../../../../../../../../utils/writes";
import type { ServerViewProps } from "./interfaces";

/**
 * One server's functions as a step of the tab, like an opened grant: own head with the way back, own body, the tab's
 * «Зберегти» under it; single functions are let in or out here.
 */
export function ServerView({ agentName, server, functions, grants, onToggle, onBack, onSave }: ServerViewProps) {
  const [typed, setTyped] = useState("");

  // Escape leaves this step as it leaves an opened grant; draft changes stay.
  useStandingStep(true);
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  });

  const wanted = typed.trim().toLowerCase();
  const found =
    wanted === ""
      ? functions
      : functions.filter(
          (one) => one.name.toLowerCase().includes(wanted) || one.description.toLowerCase().includes(wanted),
        );
  const isHeld = (name: string) => grants.some((grant) => namesFunction(grant, server.id, name));
  const held = functions.filter((one) => isHeld(one.name)).length;

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <StepHead whose={agentName} name={server.name} backLabel={SETTINGS_BACK_LABEL} onBack={onBack} />

      <div
        className="d-flex flex-column flex-fill"
        style={{
          padding: SERVER_VIEW_BODY_PADDING_PX,
          gap: SERVER_VIEW_BODY_GAP_PX,
          overflowY: "auto",
        }}
      >
        <span
          style={{
            fontSize: SERVER_VIEW_TITLE_FONT_SIZE_PX,
            color: SERVER_VIEW_TITLE_COLOR,
          }}
        >
          {server.name}
        </span>
        <div
          className="d-flex align-items-center"
          style={{
            gap: SERVER_VIEW_SEARCH_GAP_PX,
            padding: SERVER_VIEW_SEARCH_PADDING,
            borderRadius: SERVER_VIEW_SEARCH_RADIUS_PX,
            border: `1px solid ${SERVER_VIEW_SEARCH_BORDER_COLOR}`,
            background: SERVER_VIEW_SEARCH_BACKGROUND_COLOR,
          }}
        >
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={SERVER_VIEW_SEARCH_PLACEHOLDER}
            aria-label={SERVER_VIEW_SEARCH_PLACEHOLDER}
            className="font-monospace flex-fill"
            style={{
              minWidth: 0,
              padding: 0,
              fontSize: SERVER_VIEW_SEARCH_FONT_SIZE_PX,
              color: SERVER_VIEW_SEARCH_COLOR,
              background: "transparent",
              border: "none",
              outline: "none",
            }}
          />
          <span
            className="font-monospace flex-shrink-0"
            style={{
              fontSize: SERVER_VIEW_COUNT_FONT_SIZE_PX,
              letterSpacing: SERVER_VIEW_COUNT_LETTER_SPACING_PX,
              color: SERVER_VIEW_COUNT_COLOR,
            }}
          >
            {`${found.length}${SERVER_VIEW_FOUND_SEPARATOR}${functions.length}`}
          </span>
        </div>
        {found.length === 0 ? (
          <span
            style={{
              fontSize: SERVER_VIEW_SAID_FONT_SIZE_PX,
              lineHeight: SERVER_VIEW_SAID_LINE_HEIGHT,
              color: SERVER_VIEW_SAID_COLOR,
            }}
          >
            {SERVER_VIEW_NONE_FOUND}
          </span>
        ) : (
          <div
            className="d-flex flex-column"
            style={{
              gap: SERVER_VIEW_LIST_GAP_PX,
            }}
          >
            {found.map((one) => (
              <FunctionOption
                key={one.name}
                name={one.name}
                said={one.description}
                isHeld={isHeld(one.name)}
                textGapPx={SERVER_VIEW_ROW_TEXT_GAP_PX}
                onToggle={() => onToggle(one.name)}
              />
            ))}
          </div>
        )}
        <span
          className="font-monospace"
          style={{
            fontSize: SERVER_VIEW_COUNT_FONT_SIZE_PX,
            letterSpacing: SERVER_VIEW_COUNT_LETTER_SPACING_PX,
            color: SERVER_VIEW_COUNT_COLOR,
          }}
        >
          {heldLabel(held, functions.length)}
        </span>
      </div>

      <div
        data-foot
        className="d-flex flex-shrink-0"
        style={{
          padding: SERVER_VIEW_FOOTER_PADDING_PX,
          gap: SERVER_VIEW_FOOTER_GAP_PX,
          borderTop: `1px solid ${AGENT_SETTINGS_FOOTER_BORDER_COLOR}`,
        }}
      >
        <ActionButton variant="save" label={SERVER_VIEW_SAVE_LABEL} onClick={() => quietly(onSave)} />
      </div>
    </div>
  );
}
