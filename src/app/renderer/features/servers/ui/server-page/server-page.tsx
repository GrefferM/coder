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

/** One server on a page of its own, with the way back in its head; nothing folds. */
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
  /** When it last answered, on the app's freshness scale; nothing for a server that has not answered. */
  const answered = useFresh(look?.answeredAt ?? null);
  /** When its list last changed, by this machine's memory. */
  const updated = useFresh(look?.changedAt ?? null);
  const freshness = freshnessLine(look, answered, updated);

  // Escape leaves this step as it leaves an opened grant; the tab stays.
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
