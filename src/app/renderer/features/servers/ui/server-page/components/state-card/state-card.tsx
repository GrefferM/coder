import { BoxedAction } from "../../../../../../components";
import { RowDot } from "../../../servers-panel/components/server-row/components";
import { pageDeed, serverTrouble } from "../../../../logic";
import { serverFacts } from "../../../../words";
import { SERVER_ASK_AGAIN_LABEL, SERVER_RESTART_ALIVE_LABEL, SERVER_RESTART_LABEL } from "../../../../constants";
import {
  SERVER_ROW_FACTS_COLOR,
  SERVER_ROW_FACTS_FONT_SIZE_PX,
  SERVER_ROW_FACTS_LETTER_SPACING_PX,
  SERVER_ROW_REACH_COLOR,
  SERVER_ROW_REACH_FONT_SIZE_PX,
  SERVER_ROW_REACH_LINE_HEIGHT,
} from "../../../servers-panel/components/server-row/constants";
import {
  SERVER_PAGE_ANSWERED_COLOR,
  SERVER_PAGE_ANSWERED_FONT_SIZE_PX,
  SERVER_PAGE_ANSWERED_LETTER_SPACING_PX,
  SERVER_PAGE_ANSWERED_LINE_HEIGHT,
  SERVER_PAGE_STATE_BACKGROUND_COLOR,
  SERVER_PAGE_STATE_BORDER_COLOR,
  SERVER_PAGE_STATE_BORDER_RADIUS_PX,
  SERVER_PAGE_STATE_GAP_PX,
  SERVER_PAGE_STATE_PADDING,
  SERVER_PAGE_STATE_ROW_GAP_PX,
} from "../../constants";
import type { StateCardProps } from "./interfaces";

/**
 * The head of a server's page — its dot and facts, the one action about its **process**, how it is
 * reached, and how fresh its answer is. Boxed, because it is the state of the thing and the rest of the page is
 * what the thing hands over.
 *
 * The word of the action comes from the kind, because the kind decides the thing: a local server is our own
 * process and is put down and raised afresh; a remote one is a connection, and one only asks it again. Nothing
 * here stops a server: «ЗУПИНИТИ» is nowhere — a server stopped by hand is a declaration with nothing behind it.
 */
export function StateCard({ server, look, isAsking, agentCount, freshness, onRestart, onAskAgain }: StateCardProps) {
  const deed = pageDeed(look, server.isLocal, isAsking);
  const trouble = isAsking ? null : serverTrouble(look);
  const isUp = !isAsking && look !== null && look.isUp;
  const reach = server.isLocal ? server.run : server.address;
  const action =
    deed === null
      ? null
      : {
          raise: {
            label: SERVER_RESTART_LABEL,
            onPress: onRestart,
          },
          raiseAgain: {
            label: SERVER_RESTART_ALIVE_LABEL,
            onPress: onRestart,
          },
          askAgain: {
            label: SERVER_ASK_AGAIN_LABEL,
            onPress: onAskAgain,
          },
        }[deed];

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: SERVER_PAGE_STATE_GAP_PX,
        padding: SERVER_PAGE_STATE_PADDING,
        borderRadius: SERVER_PAGE_STATE_BORDER_RADIUS_PX,
        border: `1px solid ${SERVER_PAGE_STATE_BORDER_COLOR}`,
        background: SERVER_PAGE_STATE_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: SERVER_PAGE_STATE_ROW_GAP_PX,
        }}
      >
        <RowDot
          isAsking={isAsking}
          isEmpty={look === null || trouble?.kind === "tokenMissing"}
          hasFallen={!isAsking && look !== null && !look.isUp}
          isUp={isUp}
        />
        <span
          className="font-monospace text-truncate flex-fill"
          style={{
            fontSize: SERVER_ROW_FACTS_FONT_SIZE_PX,
            letterSpacing: SERVER_ROW_FACTS_LETTER_SPACING_PX,
            color: SERVER_ROW_FACTS_COLOR,
            minWidth: 0,
          }}
        >
          {serverFacts(server, {
            look,
            clock: null,
            functionCount: look?.functions.length ?? 0,
            agentCount,
          })}
        </span>
        {action !== null && <BoxedAction label={action.label} onPress={action.onPress} />}
      </div>
      {reach !== "" && (
        <span
          className="font-monospace"
          style={{
            color: SERVER_ROW_REACH_COLOR,
            fontSize: SERVER_ROW_REACH_FONT_SIZE_PX,
            lineHeight: SERVER_ROW_REACH_LINE_HEIGHT,
            overflowWrap: "anywhere",
          }}
        >
          {reach}
        </span>
      )}
      {freshness !== null && (
        <span
          className="font-monospace text-uppercase"
          style={{
            color: SERVER_PAGE_ANSWERED_COLOR,
            fontSize: SERVER_PAGE_ANSWERED_FONT_SIZE_PX,
            letterSpacing: SERVER_PAGE_ANSWERED_LETTER_SPACING_PX,
            lineHeight: SERVER_PAGE_ANSWERED_LINE_HEIGHT,
          }}
        >
          {freshness}
        </span>
      )}
    </div>
  );
}
