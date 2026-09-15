import { DELETED_PLACE_BORDER_COLOR, DELETED_PLACE_SIZE_PX } from "./constants";
import type { DeletedPlaceProps } from "./interfaces";

/** The deleted sphere's place, held open while the undo line stands. */
export function DeletedPlace({ at }: DeletedPlaceProps) {
  return (
    <span
      style={{
        position: "absolute",
        left: at.x,
        top: at.y,
        transform: "translate(-50%, -50%)",
        width: DELETED_PLACE_SIZE_PX,
        height: DELETED_PLACE_SIZE_PX,
        borderRadius: "50%",
        border: `1px dashed ${DELETED_PLACE_BORDER_COLOR}`,
      }}
    />
  );
}
