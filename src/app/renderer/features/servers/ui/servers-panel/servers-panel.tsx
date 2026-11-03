import { SERVERS_SECTION_GAP_PX, SERVERS_SECTION_PADDING_PX } from "../../constants";
import { useEffect, useState } from "react";
import { functionRows } from "../../logic";
import { CatalogueAction, Words } from "../../../../components";
import { ServerForm } from "../server-form";
import { ServerPage } from "../server-page";
import { ServerRow } from "./components";
import { ServersIcon } from "../servers-icon";
import {
  SERVERS_PANEL_EMPTY_GAP_PX,
  SERVERS_PANEL_EMPTY_ICON_COLOR,
  SERVERS_PANEL_EMPTY_ICON_SIZE_PX,
  SERVERS_PANEL_EMPTY_LABEL,
  SERVERS_PANEL_EMPTY_PADDING_PX,
  SERVERS_PANEL_FOOTER_BORDER_COLOR,
  SERVERS_PANEL_NEW_LABEL,
  SERVERS_PANEL_NOTE,
  SERVERS_PANEL_NOTE_COLOR,
  SERVERS_PANEL_NOTE_FONT_SIZE_PX,
  SERVERS_PANEL_NOTE_LINE_HEIGHT,
} from "./constants";
import type { ServersPanelProps } from "./interfaces";

import { pointsAt } from "../../../../interfaces";
/** The catalogue of MCP servers, each with its connection state and what it hands over. */
export function ServersPanel({ catalogue, declaring, serverActs, declaringActs }: ServersPanelProps) {
  const { servers, looks, askingSince, agents } = catalogue;
  const { openServerId, form, held, secrets } = declaring;
  const { onRestart, onStop, onCancel, onAskAgain, onSeen, onShowCall, onArm } = serverActs;
  const { onSecretChange, onOpenForm, onFormChange, onSaveForm, onCancelForm } = declaringActs;
  /** Which server's own page stands over the list. */
  const [shownServerId, setShownServerId] = useState<string | null>(null);
  const shown = servers.find((server) => server.id === shownServerId) ?? null;

  // The arrow is news: opening the page reads it, mending the trouble does not.
  useEffect(() => {
    if (shownServerId !== null) {
      onSeen(shownServerId);
    }
  }, [shownServerId, onSeen]);

  // A server that goes takes its page with it, so ⌘Z after a delete lands on the catalogue.
  useEffect(() => {
    if (shownServerId !== null && shown === null) {
      setShownServerId(null);
    }
  }, [shown, shownServerId]);
  // «5 АГЕНТІВ»: agents holding any function of this server, by server id.
  const agentsOn = (serverId: string) =>
    agents.filter((agent) => agent.tools.some((grant) => pointsAt(grant, serverId))).length;

  if (form === null && shown !== null) {
    return (
      <ServerPage
        server={shown}
        look={looks[shown.id] ?? null}
        rows={functionRows(shown.id, looks[shown.id] ?? null, agents)}
        isAsking={askingSince[shown.id] !== undefined}
        agentCount={agentsOn(shown.id)}
        onRestart={() => onRestart(shown.id)}
        onAskAgain={() => onAskAgain(shown.id)}
        onBack={() => setShownServerId(null)}
        onEdit={() => onOpenForm(shown.id)}
        onDelete={() => onArm(shown.id)}
      />
    );
  }

  if (form !== null) {
    return (
      <ServerForm
        values={form}
        isNew={openServerId === "new"}
        takenNames={servers.filter((server) => server.id !== openServerId).map((server) => server.name)}
        held={held}
        secrets={secrets}
        onChange={onFormChange}
        onSecretChange={onSecretChange}
        onSave={onSaveForm}
        onCancel={onCancelForm}
      />
    );
  }

  // An empty section puts the one action in its middle and drops the footer.
  if (servers.length === 0) {
    return (
      <div
        className="d-flex flex-column flex-fill align-items-center justify-content-center text-center"
        style={{
          gap: SERVERS_PANEL_EMPTY_GAP_PX,
          padding: SERVERS_PANEL_EMPTY_PADDING_PX,
        }}
      >
        <span
          aria-hidden
          style={{
            color: SERVERS_PANEL_EMPTY_ICON_COLOR,
            width: SERVERS_PANEL_EMPTY_ICON_SIZE_PX,
            height: SERVERS_PANEL_EMPTY_ICON_SIZE_PX,
          }}
        >
          <ServersIcon />
        </span>
        <Words isQuiet>{SERVERS_PANEL_EMPTY_LABEL}</Words>
        <CatalogueAction label={SERVERS_PANEL_NEW_LABEL} isFilled onClick={() => onOpenForm("new")} />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="d-flex flex-column flex-fill overflow-auto"
        style={{
          gap: SERVERS_SECTION_GAP_PX,
          padding: SERVERS_SECTION_PADDING_PX,
          minHeight: 0,
        }}
      >
        {servers.map((server) => (
          <ServerRow
            key={server.id}
            server={server}
            look={looks[server.id] ?? null}
            askingSince={askingSince[server.id] ?? null}
            agentCount={agentsOn(server.id)}
            onOpen={() => setShownServerId(server.id)}
            onRestart={() => onRestart(server.id)}
            onStop={() => onStop(server.id)}
            onCancel={() => onCancel(server.id)}
            onFill={() => onOpenForm(server.id)}
            onShowCall={onShowCall}
          />
        ))}
        <span
          style={{
            color: SERVERS_PANEL_NOTE_COLOR,
            fontSize: SERVERS_PANEL_NOTE_FONT_SIZE_PX,
            lineHeight: SERVERS_PANEL_NOTE_LINE_HEIGHT,
          }}
        >
          {SERVERS_PANEL_NOTE}
        </span>
      </div>
      <div
        className="d-flex flex-shrink-0"
        style={{
          padding: SERVERS_SECTION_PADDING_PX,
          borderTop: `1px solid ${SERVERS_PANEL_FOOTER_BORDER_COLOR}`,
        }}
      >
        {/* No store exists, so no «З магазину» door beside it. */}
        <CatalogueAction label={SERVERS_PANEL_NEW_LABEL} onClick={() => onOpenForm("new")} />
      </div>
    </div>
  );
}
