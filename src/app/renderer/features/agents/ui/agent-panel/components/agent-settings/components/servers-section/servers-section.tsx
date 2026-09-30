import { isServerGrant, namesFunction } from "../../../../../../../../interfaces";
import { FieldSlot, PickerShell, Words } from "../../../../../../../../components";
import {
  PICKER_PLACEHOLDER_COLOR,
  PICKER_VALUE_COLOR,
} from "../../../../../../../../components/picker-shell/constants";
import { HeldServer } from "./components";
import { LostGrants } from "../lost-grants";
import { SourceGlyph } from "../source-glyph";
import { ToolOption } from "../tool-option";
import { brokenGrants } from "../../logic";
import { connectedTo, withServer } from "../../../../../../logic";
import { connectedLabel } from "../../../../../../words";
import {
  SERVERS_SECTION_CHOOSE_LABEL,
  SERVERS_SECTION_LOCKED_NOTE,
  SERVERS_SECTION_COUNT_SEPARATOR,
  SERVERS_SECTION_GAP_PX,
  SERVERS_SECTION_LABEL,
  SERVERS_SECTION_LIST_MAX_HEIGHT_PX,
} from "./constants";
import type { ServersSectionProps } from "./interfaces";

/** The tools' lower half: whole servers, connected or not; commands keep their own field above. */
export function ServersSection({
  servers,
  looks,
  grants,
  wasValue,
  isLocked,
  onGrantsChange,
  onOpenServer,
}: ServersSectionProps) {
  const connected = servers.filter((server) => connectedTo(server.id, grants));
  const heldIn = (serverId: string) =>
    (looks[serverId]?.functions ?? []).filter((one) => grants.some((grant) => namesFunction(grant, serverId, one.name)))
      .length;
  // Only server grants; the commands' field is neither counted nor mended here.
  const mine = grants.filter(isServerGrant);
  // A grant can outlive its function or server; a broken one is counted nowhere.
  const broken = brokenGrants(mine, {
    commands: [],
    servers,
    looks,
    agents: [],
  });
  const brokenIds = new Set(broken.flatMap((group) => group.rows.map((row) => row.id)));

  return (
    <FieldSlot
      label={
        <>
          <SourceGlyph source="mcp" />
          {`${SERVERS_SECTION_LABEL}${SERVERS_SECTION_COUNT_SEPARATOR}${connected.length}`}
        </>
      }
      wasValue={wasValue}
    >
      <div
        className="d-flex flex-column"
        style={{
          gap: SERVERS_SECTION_GAP_PX,
        }}
      >
        {isLocked ? (
          <Words isQuiet>{SERVERS_SECTION_LOCKED_NOTE}</Words>
        ) : (
          <PickerShell
            field={
              <span className="flex-fill text-truncate">
                {connected.length === 0
                  ? SERVERS_SECTION_CHOOSE_LABEL
                  : connectedLabel(connected.length, servers.length)}
              </span>
            }
            fieldColor={connected.length === 0 ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
            listMaxHeightPx={SERVERS_SECTION_LIST_MAX_HEIGHT_PX}
            isChanged={wasValue !== null}
            items={servers}
            matches={(server, query) => server.name.toLowerCase().includes(query)}
            choose={(server) => onGrantsChange(withServer(server, looks[server.id] ?? null, grants))}
            row={(server) => (
              <ToolOption
                key={server.id}
                name={server.name}
                isGranted={connectedTo(server.id, grants)}
                onToggle={() => onGrantsChange(withServer(server, looks[server.id] ?? null, grants))}
              />
            )}
          />
        )}

        {connected.map((server) => (
          <HeldServer
            key={server.id}
            name={server.name}
            held={heldIn(server.id)}
            functions={looks[server.id]?.functions.length ?? 0}
            onOpen={() => onOpenServer(server.id)}
          />
        ))}

        {broken.length > 0 && (
          <LostGrants
            groups={broken}
            onRemove={() => onGrantsChange(grants.filter((grant) => !brokenIds.has(grant.id)))}
          />
        )}
      </div>
    </FieldSlot>
  );
}
