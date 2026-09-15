import { StateCard } from "./components";
import { StepHead } from "../../../../components";
import { failureLine } from "../../words";
import { ServerFoot, ServerFunctions } from "../servers-panel/components/server-row/components";
import { useFresh, useStandingStep, useWindowKeydown } from "../../../../hooks";
import { freshnessLine } from "../../words";
import {
  SERVER_ROW_FAILURE_COLOR,
  SERVER_ROW_FAILURE_FONT_SIZE_PX,
  SERVER_ROW_FAILURE_LINE_HEIGHT,
} from "../servers-panel/components/server-row/constants";
import {
  SERVER_PAGE_BACK_LABEL,
  SERVER_PAGE_BODY_GAP_PX,
  SERVER_PAGE_BODY_PADDING_PX,
  SERVER_PAGE_HEAD_LABEL,
} from "./constants";
import type { ServerPageProps } from "./interfaces";

/**
 * One server on a page of its own — the same shape every step inside a tab takes: its own head with the way
 * back, and its body under it. A page and not a card inside the row, because a list of twenty-five functions
 * folded into one row of a list leaves the catalogue unreadable and every other row a screen away.
 *
 * Nothing here folds: how the server is reached, what it said when it fell, everything it hands over, and the foot
 * where it is changed all stand at once.
 */
export function ServerPage({
  server,
  look,
  rows,
  isAsking,
  agentCount,
  onRestart,
  onAskAgain,
  onBack,
  onEdit,
  onDelete,
}: ServerPageProps) {
  const failure = !isAsking && look !== null && !look.isUp ? look.failure : null;
  /**
   * When it last answered, on the app's one scale of freshness and re-read by that scale's
   * own beat. A server that has not answered has nothing here — a dash would say «уже не дізнатись», and
   * we have simply not been told yet.
   */
  const answered = useFresh(look?.answeredAt ?? null);
  /** When its list last changed, and what it was before — both from the memory of this machine. */
  const updated = useFresh(look?.changedAt ?? null);
  const freshness = freshnessLine(look, answered, updated);

  // Escape leaves this step exactly as it leaves an opened grant, and the tab stays where it is.
  useStandingStep(true);
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  });

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <StepHead whose={SERVER_PAGE_HEAD_LABEL} name={server.name} backLabel={SERVER_PAGE_BACK_LABEL} onBack={onBack} />
      <div
        className="d-flex flex-column flex-fill overflow-auto"
        style={{
          gap: SERVER_PAGE_BODY_GAP_PX,
          padding: SERVER_PAGE_BODY_PADDING_PX,
          minHeight: 0,
        }}
      >
        <StateCard
          server={server}
          look={look}
          isAsking={isAsking}
          agentCount={agentCount}
          freshness={freshness}
          onRestart={onRestart}
          onAskAgain={onAskAgain}
        />
        {failure !== null && (
          <span
            style={{
              color: SERVER_ROW_FAILURE_COLOR,
              fontSize: SERVER_ROW_FAILURE_FONT_SIZE_PX,
              lineHeight: SERVER_ROW_FAILURE_LINE_HEIGHT,
              overflowWrap: "anywhere",
            }}
          >
            {failureLine(failure)}
          </span>
        )}
        {rows.length > 0 && <ServerFunctions rows={rows} />}
        <ServerFoot onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
