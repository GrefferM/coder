import { tidyAnswer } from "../../../../../../utils/text";
import { AnswerCard } from "../answer-card";
import { WorkCard } from "../work-card";
import { useLiveAnswer } from "../../../../hooks";
import { AGENT_CHAT_LIST_GAP_PX } from "../../constants";
import type { WorkingTurnProps } from "./interfaces";

/**
 * One turn still out: what it has said so far, in its agent's name and colour, with the pill counting seconds.
 * The words arrive here and nowhere else — this card redraws token by token while the stream stands still.
 */
export function WorkingTurn({ turn, agents, agentName, agentColor, openCalls }: WorkingTurnProps) {
  const spoke = agents.find((agent) => agent.id === turn.agentId) ?? null;
  const color = spoke?.color ?? agentColor;
  const live = useLiveAnswer(turn.turnId);

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: AGENT_CHAT_LIST_GAP_PX,
      }}
    >
      {live.text !== "" && (
        <AnswerCard
          agentName={spoke?.name ?? agentName}
          agentColor={color}
          text={tidyAnswer(live.text)}
          cost={null}
          isCounting
        />
      )}
      <WorkCard agentColor={color} startedAt={turn.startedAt} calls={live.calls} openCalls={openCalls} />
    </div>
  );
}
