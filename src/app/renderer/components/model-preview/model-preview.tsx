import { QuietLine } from "../field-slot";
import { FIELD_LABEL_COLOR, FIELD_LABEL_FONT_SIZE_PX, FIELD_LABEL_GAP_PX } from "../field/constants";
import {
  MODEL_PREVIEW_BACKGROUND_COLOR,
  MODEL_PREVIEW_BORDER_COLOR,
  MODEL_PREVIEW_BORDER_RADIUS_PX,
  MODEL_PREVIEW_DESCRIPTION_COLOR,
  MODEL_PREVIEW_DESCRIPTION_GAP_PX,
  MODEL_PREVIEW_FONT_SIZE_PX,
  MODEL_PREVIEW_INDENT_PX,
  MODEL_PREVIEW_LABEL,
  MODEL_PREVIEW_LINE_HEIGHT,
  MODEL_PREVIEW_NAME_COLOR,
  MODEL_PREVIEW_OPTIONAL_MARK,
  MODEL_PREVIEW_PADDING,
  MODEL_PREVIEW_PARAMETER_COLOR,
  MODEL_PREVIEW_TYPE_COLOR,
} from "./constants";
import type { ModelPreviewProps } from "./interfaces";

/** The command as the model sees it — as declared, or per-agent with fixed parameters removed. */
export function ModelPreview({ name, description, parameters, note }: ModelPreviewProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: FIELD_LABEL_GAP_PX,
      }}
    >
      <span
        className="text-uppercase font-monospace"
        style={{
          color: FIELD_LABEL_COLOR,
          fontSize: FIELD_LABEL_FONT_SIZE_PX,
        }}
      >
        {MODEL_PREVIEW_LABEL}
      </span>
      <div
        className="font-monospace"
        style={{
          padding: MODEL_PREVIEW_PADDING,
          borderRadius: MODEL_PREVIEW_BORDER_RADIUS_PX,
          border: `1px solid ${MODEL_PREVIEW_BORDER_COLOR}`,
          background: MODEL_PREVIEW_BACKGROUND_COLOR,
          fontSize: MODEL_PREVIEW_FONT_SIZE_PX,
          lineHeight: MODEL_PREVIEW_LINE_HEIGHT,
        }}
      >
        <div
          style={{
            color: MODEL_PREVIEW_NAME_COLOR,
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: MODEL_PREVIEW_DESCRIPTION_COLOR,
            paddingBottom: MODEL_PREVIEW_DESCRIPTION_GAP_PX,
          }}
        >
          {description}
        </div>
        {parameters.map((parameter) => (
          <div key={parameter.id}>
            <div>
              <span
                style={{
                  color: MODEL_PREVIEW_PARAMETER_COLOR,
                }}
              >
                {parameter.name}
              </span>{" "}
              <span
                style={{
                  color: MODEL_PREVIEW_TYPE_COLOR,
                }}
              >
                {`${parameter.type}${parameter.isRequired ? "" : MODEL_PREVIEW_OPTIONAL_MARK}`}
              </span>
            </div>
            <div
              style={{
                paddingLeft: MODEL_PREVIEW_INDENT_PX,
                color: MODEL_PREVIEW_DESCRIPTION_COLOR,
              }}
            >
              {parameter.description}
            </div>
          </div>
        ))}
      </div>
      <QuietLine>{note}</QuietLine>
    </div>
  );
}
