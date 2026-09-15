import { Chip, TextAction } from "../../../../../../../../../../components";
import {
  OPEN_ROW_GAP_PX,
  OPEN_ROW_NAME_COLOR,
  OPEN_ROW_NAME_FONT_SIZE_PX,
  OPEN_ROW_PIN_LABEL,
  OPEN_ROW_TYPE_BACKGROUND_COLOR,
  OPEN_ROW_TYPE_COLOR,
} from "./constants";
import type { OpenRowProps } from "./interfaces";

/** A model-decided parameter and its allowed type. */
export function OpenRow({ parameter, onPin }: OpenRowProps) {
  return (
    <div
      className="d-flex align-items-center"
      style={{
        gap: OPEN_ROW_GAP_PX,
      }}
    >
      <span
        className="font-monospace text-truncate"
        style={{
          color: OPEN_ROW_NAME_COLOR,
          fontSize: OPEN_ROW_NAME_FONT_SIZE_PX,
        }}
      >
        {parameter.name}
      </span>
      <Chip color={OPEN_ROW_TYPE_COLOR} background={OPEN_ROW_TYPE_BACKGROUND_COLOR}>
        {parameter.type}
      </Chip>
      <span className="flex-fill" />
      <TextAction isQuiet label={OPEN_ROW_PIN_LABEL} onClick={onPin} />
    </div>
  );
}
