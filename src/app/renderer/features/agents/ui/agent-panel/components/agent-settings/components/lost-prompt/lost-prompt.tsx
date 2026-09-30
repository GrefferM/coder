import { LostRow, LostTie } from "../../../../../../../../components";
import { LOST_PROMPT_NOTE, LOST_PROMPT_REMOVE_LABEL } from "./constants";
import { AGENT_LOST_PROMPT_NAME } from "../../../../../../constants";
import type { LostPromptProps } from "./interfaces";

/** The agent's prompt file is gone; the tie stays, struck through, until taken off. */
export function LostPrompt({ onRemove }: LostPromptProps) {
  return (
    <LostTie note={LOST_PROMPT_NOTE} removeLabel={LOST_PROMPT_REMOVE_LABEL} onRemove={onRemove}>
      <LostRow name={AGENT_LOST_PROMPT_NAME} />
    </LostTie>
  );
}
