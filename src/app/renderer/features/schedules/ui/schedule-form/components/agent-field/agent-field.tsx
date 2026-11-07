import { Dot, FieldSlot, PickerShell } from "../../../../../../components";
import {
  PICKER_DOT_SIZE_PX,
  PICKER_NAME_COLOR,
  PICKER_NAME_FONT_SIZE_PX,
  PICKER_PLACEHOLDER_COLOR,
  PICKER_ROW_BORDER_RADIUS_PX,
  PICKER_ROW_CHOSEN_BACKGROUND_COLOR,
  PICKER_ROW_GAP_PX,
  PICKER_ROW_PADDING,
  PICKER_VALUE_COLOR,
} from "../../../../../../components/picker-shell/constants";
import {
  AGENT_FIELD_GAP_PX,
  AGENT_FIELD_GONE_COLOR,
  AGENT_FIELD_GONE_FONT_SIZE_PX,
  AGENT_FIELD_GONE_LABEL,
  AGENT_FIELD_GONE_LETTER_SPACING_PX,
  AGENT_FIELD_GONE_NOTE,
  AGENT_FIELD_GONE_NOTE_LINE_HEIGHT,
  AGENT_FIELD_OFF_FONT_SIZE_PX,
  AGENT_FIELD_OFF_GROUP,
  AGENT_FIELD_OFF_LABEL,
  AGENT_FIELD_OFF_LABEL_COLOR,
  AGENT_FIELD_OFF_LETTER_SPACING_PX,
  AGENT_FIELD_OFF_PADDING,
  AGENT_FIELD_ON_GROUP,
} from "./constants";
import type { AgentFieldProps } from "./interfaces";

/** Whom the task is put to: the project's agents by colour and name, a gone one named as gone. */
export function AgentField({ label, agents, agentId, placeholder, isInvalid, onChange }: AgentFieldProps) {
  const chosen = agents.find((agent) => agent.id === agentId) ?? null;
  const isGone = agentId !== null && chosen === null;
  const offered = [...agents.filter((agent) => agent.isActive), ...agents.filter((agent) => !agent.isActive)];

  return (
    <FieldSlot label={label}>
      <PickerShell
        field={
          <span
            className="d-flex align-items-center flex-fill"
            style={{
              gap: AGENT_FIELD_GAP_PX,
              minWidth: 0,
            }}
          >
            {chosen !== null && <Dot color={chosen.color} size={PICKER_DOT_SIZE_PX} className="flex-shrink-0" />}
            <span
              className={`flex-fill text-truncate${isGone ? " font-monospace" : ""}`}
              style={
                isGone
                  ? {
                      color: AGENT_FIELD_GONE_COLOR,
                      fontSize: AGENT_FIELD_GONE_FONT_SIZE_PX,
                      letterSpacing: AGENT_FIELD_GONE_LETTER_SPACING_PX,
                    }
                  : undefined
              }
            >
              {isGone ? AGENT_FIELD_GONE_LABEL : (chosen?.name ?? placeholder)}
            </span>
          </span>
        }
        fieldColor={chosen === null ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
        isInvalid={isInvalid || isGone}
        items={offered}
        matches={(agent, query) => agent.name.toLowerCase().includes(query)}
        groupOf={(agent) => (agent.isActive ? AGENT_FIELD_ON_GROUP : AGENT_FIELD_OFF_GROUP)}
        head={(group) =>
          group === AGENT_FIELD_OFF_GROUP ? (
            <span
              className="font-monospace"
              style={{
                padding: AGENT_FIELD_OFF_PADDING,
                color: AGENT_FIELD_OFF_LABEL_COLOR,
                fontSize: AGENT_FIELD_OFF_FONT_SIZE_PX,
                letterSpacing: AGENT_FIELD_OFF_LETTER_SPACING_PX,
              }}
            >
              {AGENT_FIELD_OFF_LABEL}
            </span>
          ) : null
        }
        choose={(agent, close) => {
          onChange(agent.id);
          close();
        }}
        row={(agent, close) => (
          <button
            key={agent.id}
            type="button"
            role="option"
            aria-selected={agent.id === agentId}
            onClick={() => {
              onChange(agent.id);
              close();
            }}
            className="d-flex align-items-center text-start"
            style={{
              padding: PICKER_ROW_PADDING,
              gap: PICKER_ROW_GAP_PX,
              border: "none",
              borderRadius: PICKER_ROW_BORDER_RADIUS_PX,
              background: agent.id === agentId ? PICKER_ROW_CHOSEN_BACKGROUND_COLOR : "transparent",
              cursor: "pointer",
            }}
          >
            <Dot color={agent.color} size={PICKER_DOT_SIZE_PX} className="flex-shrink-0" />
            <span
              className="font-monospace text-truncate"
              style={{
                fontSize: PICKER_NAME_FONT_SIZE_PX,
                color: PICKER_NAME_COLOR,
              }}
            >
              {agent.name}
            </span>
          </button>
        )}
      />
      {isGone && (
        <span
          style={{
            color: AGENT_FIELD_GONE_COLOR,
            fontSize: AGENT_FIELD_GONE_FONT_SIZE_PX,
            lineHeight: AGENT_FIELD_GONE_NOTE_LINE_HEIGHT,
          }}
        >
          {AGENT_FIELD_GONE_NOTE}
        </span>
      )}
    </FieldSlot>
  );
}
