import { WalkedRow } from "../../../../../../components";
import { ListAction } from "../list-action";
import { ProjectRow } from "../project-row";
import {
  SWITCHER_BUTTON_BACKGROUND_COLOR,
  SWITCHER_BUTTON_PATH_COLOR,
  SWITCHER_CLOSE_LABEL,
  SWITCHER_LIST_BORDER_COLOR,
  SWITCHER_LIST_BORDER_RADIUS_PX,
  SWITCHER_LIST_LABEL,
  SWITCHER_LIST_LABEL_FONT_SIZE_PX,
  SWITCHER_LIST_LABEL_LETTER_SPACING_PX,
  SWITCHER_LIST_LABEL_PADDING,
  SWITCHER_LIST_MAX_HEIGHT_PX,
  SWITCHER_LIST_PADDING_PX,
  SWITCHER_LIST_WIDTH_PX,
  SWITCHER_NEW_PROJECT_LABEL,
  SWITCHER_OPEN_FOLDER_LABEL,
  SWITCHER_REVEAL_COLOR,
  SWITCHER_REVEAL_FONT_SIZE_PX,
  SWITCHER_REVEAL_LABEL,
  SWITCHER_REVEAL_PADDING,
  SWITCHER_ROW_BORDER_RADIUS_PX,
} from "../../constants";
import type { SwitcherListProps } from "./interfaces";

/** The switcher's list: this project, the others, and the other actions. */
export function SwitcherList({
  project,
  others,
  walk,
  onSwitch,
  onForget,
  onChooseFolder,
  onStartProject,
  onReveal,
  onClose,
}: SwitcherListProps) {
  return (
    <div
      role="menu"
      className="d-flex flex-column"
      // Only the list's own rows close it.
      onClick={(event) => event.stopPropagation()}
      style={{
        width: SWITCHER_LIST_WIDTH_PX,
        padding: SWITCHER_LIST_PADDING_PX,
        borderRadius: SWITCHER_LIST_BORDER_RADIUS_PX,
        border: `1px solid ${SWITCHER_LIST_BORDER_COLOR}`,
        background: SWITCHER_BUTTON_BACKGROUND_COLOR,
      }}
    >
      <span
        className="text-uppercase font-monospace"
        style={{
          padding: SWITCHER_LIST_LABEL_PADDING,
          fontSize: SWITCHER_LIST_LABEL_FONT_SIZE_PX,
          letterSpacing: SWITCHER_LIST_LABEL_LETTER_SPACING_PX,
          color: SWITCHER_BUTTON_PATH_COLOR,
        }}
      >
        {SWITCHER_LIST_LABEL}
      </span>

      <div
        className="d-flex flex-column"
        style={{
          maxHeight: SWITCHER_LIST_MAX_HEIGHT_PX,
          overflowY: "auto",
        }}
      >
        <ProjectRow
          name={project.config.name}
          directory={project.directory}
          agentCount={project.config.agents.length}
          isCurrent
        />
        {others.map((entry, index) => (
          <WalkedRow key={entry.directory} walk={walk} index={index} borderRadius={SWITCHER_ROW_BORDER_RADIUS_PX}>
            <ProjectRow
              name={entry.name}
              directory={entry.directory}
              agentCount={entry.agentCount}
              exists={entry.exists}
              onSelect={() => onSwitch(entry.directory)}
              onForget={() => onForget(entry.directory)}
            />
          </WalkedRow>
        ))}
      </div>

      <div
        className="d-flex flex-column"
        style={{
          borderTop: `1px solid ${SWITCHER_LIST_BORDER_COLOR}`,
          marginTop: SWITCHER_LIST_PADDING_PX,
          paddingTop: SWITCHER_LIST_PADDING_PX,
        }}
      >
        <WalkedRow walk={walk} index={others.length} borderRadius={SWITCHER_ROW_BORDER_RADIUS_PX}>
          <ListAction label={SWITCHER_OPEN_FOLDER_LABEL} onSelect={() => onChooseFolder()} />
        </WalkedRow>
        <WalkedRow walk={walk} index={others.length + 1} borderRadius={SWITCHER_ROW_BORDER_RADIUS_PX}>
          <ListAction label={SWITCHER_NEW_PROJECT_LABEL} onSelect={() => onStartProject()} />
        </WalkedRow>
        <WalkedRow walk={walk} index={others.length + 2} borderRadius={SWITCHER_ROW_BORDER_RADIUS_PX}>
          <ListAction label={SWITCHER_CLOSE_LABEL} onSelect={onClose} />
        </WalkedRow>
      </div>

      <div
        style={{
          borderTop: `1px solid ${SWITCHER_LIST_BORDER_COLOR}`,
          marginTop: SWITCHER_LIST_PADDING_PX,
          paddingTop: SWITCHER_LIST_PADDING_PX,
        }}
      >
        <WalkedRow walk={walk} index={others.length + 3} borderRadius={SWITCHER_ROW_BORDER_RADIUS_PX}>
          <ListAction
            label={SWITCHER_REVEAL_LABEL}
            onSelect={() => onReveal()}
            padding={SWITCHER_REVEAL_PADDING}
            fontSize={SWITCHER_REVEAL_FONT_SIZE_PX}
            color={SWITCHER_REVEAL_COLOR}
          />
        </WalkedRow>
      </div>
    </div>
  );
}
