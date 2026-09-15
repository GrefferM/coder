import { useState } from "react";
import { CatalogueAction, Words } from "../../../../components";
import { CommandForm, CommandRow } from "./components";
import {
  COMMANDS_PANEL_EMPTY_GAP_PX,
  COMMANDS_PANEL_EMPTY_ICON_COLOR,
  COMMANDS_PANEL_EMPTY_ICON_SIZE_PX,
  COMMANDS_PANEL_EMPTY_LABEL,
  COMMANDS_PANEL_EMPTY_PADDING_PX,
  COMMANDS_PANEL_FOOTER_BORDER_COLOR,
  COMMANDS_PANEL_GAP_PX,
  COMMANDS_PANEL_NEW_LABEL,
  COMMANDS_PANEL_NOTE,
  COMMANDS_PANEL_NOTE_COLOR,
  COMMANDS_PANEL_NOTE_FONT_SIZE_PX,
  COMMANDS_PANEL_NOTE_LINE_HEIGHT,
  COMMANDS_PANEL_PADDING_PX,
} from "./constants";
import type { CommandsPanelProps } from "./interfaces";

/** The catalogue of declared commands. */
export function CommandsPanel({
  commands,
  openCommandId,
  form,
  onOpenForm,
  onFormChange,
  onSaveForm,
  onCancelForm,
  onArmedCommandIdChange,
}: CommandsPanelProps) {
  const [chosenCommandId, setChosenCommandId] = useState<string | null>(null);

  if (form !== null) {
    return (
      <CommandForm
        values={form}
        isNew={openCommandId === "new"}
        takenNames={commands.filter((command) => command.id !== openCommandId).map((command) => command.name)}
        onChange={onFormChange}
        onSave={onSaveForm}
        onCancel={onCancelForm}
      />
    );
  }

  // An empty section lifts the one action out of the footer into its middle, and the footer goes with it.
  if (commands.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center justify-content-center text-center"
        style={{
          gap: COMMANDS_PANEL_EMPTY_GAP_PX,
          padding: COMMANDS_PANEL_EMPTY_PADDING_PX,
        }}
      >
        <svg
          width={COMMANDS_PANEL_EMPTY_ICON_SIZE_PX}
          height={COMMANDS_PANEL_EMPTY_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={COMMANDS_PANEL_EMPTY_ICON_COLOR}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m7 10 3 2.5-3 2.5M13 15h4" />
        </svg>
        <Words isQuiet>{COMMANDS_PANEL_EMPTY_LABEL}</Words>
        <CatalogueAction label={COMMANDS_PANEL_NEW_LABEL} isFilled onClick={() => onOpenForm("new")} />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="d-flex flex-column flex-fill"
        style={{
          gap: COMMANDS_PANEL_GAP_PX,
          padding: COMMANDS_PANEL_PADDING_PX,
          overflowY: "auto",
        }}
      >
        {commands.map((command) => (
          <CommandRow
            key={command.id}
            command={command}
            isOpen={command.id === chosenCommandId}
            onOpen={() => setChosenCommandId(command.id === chosenCommandId ? null : command.id)}
            onEdit={() => onOpenForm(command.id)}
            onDelete={() => onArmedCommandIdChange(command.id)}
          />
        ))}
        <span
          style={{
            color: COMMANDS_PANEL_NOTE_COLOR,
            fontSize: COMMANDS_PANEL_NOTE_FONT_SIZE_PX,
            lineHeight: COMMANDS_PANEL_NOTE_LINE_HEIGHT,
          }}
        >
          {COMMANDS_PANEL_NOTE}
        </span>
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: COMMANDS_PANEL_PADDING_PX,
          borderTop: `1px solid ${COMMANDS_PANEL_FOOTER_BORDER_COLOR}`,
        }}
      >
        <CatalogueAction label={COMMANDS_PANEL_NEW_LABEL} onClick={() => onOpenForm("new")} />
      </div>
    </div>
  );
}
