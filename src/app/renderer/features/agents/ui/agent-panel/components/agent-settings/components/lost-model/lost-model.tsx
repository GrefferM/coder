import { LostRow, LostTie } from "../../../../../../../../components";
import { AGENT_LOST_MODEL_NAME } from "../../../../../../constants";
import { LOST_MODEL_NOTE } from "./constants";

/** The agent's model file is gone; the tie stays until another model is chosen. */
export function LostModel() {
  return (
    <LostTie note={LOST_MODEL_NOTE}>
      <LostRow name={AGENT_LOST_MODEL_NAME} />
    </LostTie>
  );
}
