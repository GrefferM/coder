import { ActionButton, Field, Mark } from "../../../../components";
import {
  PROJECT_FORM_ACTIONS_GAP_PX,
  PROJECT_FORM_BLOCK_BACKGROUND_COLOR,
  PROJECT_FORM_BLOCK_BORDER_COLOR,
  PROJECT_FORM_BLOCK_BORDER_RADIUS_PX,
  PROJECT_FORM_BLOCK_GAP_PX,
  PROJECT_FORM_BLOCK_PADDING,
  PROJECT_FORM_CANCEL_LABEL,
  PROJECT_FORM_CHOOSE_LABEL,
  PROJECT_FORM_APPEARING,
  PROJECT_FORM_CREATE_LABEL,
  PROJECT_FORM_DIRECTORY_GAP_PX,
  PROJECT_FORM_DIRECTORY_LABEL,
  PROJECT_FORM_FILE_COLOR,
  PROJECT_FORM_FILE_FONT_SIZE_PX,
  PROJECT_FORM_GAP_PX,
  PROJECT_FORM_NAME_LABEL,
  PROJECT_FORM_NAME_NOTE,
  PROJECT_FORM_PLACE_NOTE,
  PROJECT_FORM_QUIET_COLOR,
  PROJECT_FORM_QUIET_FONT_SIZE_PX,
  PROJECT_FORM_TITLE,
  PROJECT_FORM_TITLE_COLOR,
  PROJECT_FORM_TITLE_FONT_SIZE_PX,
  PROJECT_FORM_WIDTH_PX,
  PROJECT_FORM_WILL_APPEAR_LABEL,
} from "./constants";
import type { ProjectFormProps } from "./interfaces";

/**
 * Names a folder with no project yet and lists what will appear in it. A folder already holding a project never reaches
 * here; it opens directly.
 */
export function ProjectForm({
  directory,
  name,
  onNameChange,
  onChooseDirectory,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        width: PROJECT_FORM_WIDTH_PX,
        gap: PROJECT_FORM_GAP_PX,
      }}
    >
      <span
        style={{
          fontSize: PROJECT_FORM_TITLE_FONT_SIZE_PX,
          color: PROJECT_FORM_TITLE_COLOR,
        }}
      >
        {PROJECT_FORM_TITLE}
      </span>

      <div
        className="d-flex align-items-end"
        style={{
          gap: PROJECT_FORM_DIRECTORY_GAP_PX,
        }}
      >
        <div className="flex-fill">
          <Field label={PROJECT_FORM_DIRECTORY_LABEL} value={directory} isMono onChange={() => {}} />
        </div>
        <ActionButton variant="cancel" label={PROJECT_FORM_CHOOSE_LABEL} onClick={onChooseDirectory} />
      </div>

      <Field label={PROJECT_FORM_NAME_LABEL} value={name} note={PROJECT_FORM_NAME_NOTE} onChange={onNameChange} />

      <div
        className="d-flex flex-column"
        style={{
          padding: PROJECT_FORM_BLOCK_PADDING,
          gap: PROJECT_FORM_BLOCK_GAP_PX,
          borderRadius: PROJECT_FORM_BLOCK_BORDER_RADIUS_PX,
          border: `1px solid ${PROJECT_FORM_BLOCK_BORDER_COLOR}`,
          background: PROJECT_FORM_BLOCK_BACKGROUND_COLOR,
        }}
      >
        <Mark>{PROJECT_FORM_WILL_APPEAR_LABEL}</Mark>

        {PROJECT_FORM_APPEARING.map(({ name, note }) => (
          <span
            key={name}
            className="d-flex align-items-baseline font-monospace"
            style={{
              gap: PROJECT_FORM_BLOCK_GAP_PX,
              color: PROJECT_FORM_FILE_COLOR,
              fontSize: PROJECT_FORM_FILE_FONT_SIZE_PX,
            }}
          >
            {name}
            {note !== null && (
              <span
                style={{
                  color: PROJECT_FORM_QUIET_COLOR,
                  fontSize: PROJECT_FORM_QUIET_FONT_SIZE_PX,
                }}
              >
                {note}
              </span>
            )}
          </span>
        ))}

        <span
          style={{
            color: PROJECT_FORM_QUIET_COLOR,
            fontSize: PROJECT_FORM_QUIET_FONT_SIZE_PX,
          }}
        >
          {PROJECT_FORM_PLACE_NOTE}
        </span>
      </div>

      <div
        data-foot
        className="d-flex justify-content-end"
        style={{
          gap: PROJECT_FORM_ACTIONS_GAP_PX,
        }}
      >
        <ActionButton variant="cancel" label={PROJECT_FORM_CANCEL_LABEL} onClick={onCancel} />
        <ActionButton
          variant="save"
          label={PROJECT_FORM_CREATE_LABEL}
          isDisabled={name.trim() === ""}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}
