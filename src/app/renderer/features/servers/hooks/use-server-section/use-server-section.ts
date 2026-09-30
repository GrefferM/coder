import { useEffect, useState } from "react";
import { nameTaken } from "../../../../logic";
import { NAME_TAKEN_COMMAND_NOTE } from "../../../../constants";
import { NOTHING_HELD } from "../../constants";
import { saveServerEnvValue, saveServerToken, serverSecretsHeld } from "../../api";
import { serverBlocker, serverChanges, serverFormValues } from "../../logic";
import type { McpSecretsHeld, OpenProject, UnsavedWork } from "../../../../interfaces";
import type { ServerBurden, ServerFormValues } from "../../interfaces";
import type { ServerSection } from "./interfaces";
import type { ServerWrites } from "../use-server-writes";

import { pointsAt } from "../../../../interfaces";
/** The one form of the MCP section, opened on a server or on nothing for a new one. */
export function useServerSection(project: OpenProject, writes: ServerWrites): ServerSection {
  const [openServerId, setOpenServerId] = useState<string | "new" | null>(null);
  const [edits, setEdits] = useState<Partial<ServerFormValues> | null>(null);
  // What was typed into the secret fields this time; the token is under the empty key.
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<McpSecretsHeld>(NOTHING_HELD);
  // The server a question stands over, and what this machine holds for it.
  const [armedServerId, setArmedServerId] = useState<string | null>(null);
  const [armedHeld, setArmedHeld] = useState<McpSecretsHeld>(NOTHING_HELD);

  /**
   * What this machine holds for the open server; asked once when the form opens, as it answers whether and not what.
   */
  useEffect(() => {
    if (openServerId === null || openServerId === "new") {
      setHeld(NOTHING_HELD);

      return;
    }

    let isStanding = true;

    void serverSecretsHeld(openServerId).then((answer) => {
      if (isStanding) {
        setHeld(answer);
      }
    });

    return () => {
      isStanding = false;
    };
  }, [openServerId]);

  const openServer = project.config.servers.find((server) => server.id === openServerId) ?? null;
  const saved = openServerId === null ? null : serverFormValues(openServer);
  const form =
    saved === null
      ? null
      : {
          ...saved,
          ...edits,
        };
  const changes = saved === null || form === null ? [] : serverChanges(saved, form);
  const isNameTaken =
    form !== null &&
    nameTaken(
      form.name,
      project.config.servers.filter((server) => server.id !== openServerId).map((server) => server.name),
    );
  // A new declaration becomes unsaved work at the first keystroke.
  const unsaved: UnsavedWork | null =
    changes.length === 0 || form === null
      ? null
      : {
          name: openServer?.name ?? form.name,
          changes,
          blocked: serverBlocker(form),
          blockedNote: isNameTaken ? NAME_TAKEN_COMMAND_NOTE : null,
          save: saveForm,
          discard: () => setEdits(null),
        };

  const armedServer = project.config.servers.find((server) => server.id === armedServerId) ?? null;
  const armedGrants = project.config.agents.flatMap((agent) =>
    agent.tools.filter((grant) => armedServerId !== null && pointsAt(grant, armedServerId)),
  );
  const armedBurden: ServerBurden = {
    grants: armedGrants.length,
    agents: project.config.agents.filter((agent) =>
      agent.tools.some((grant) => armedServerId !== null && pointsAt(grant, armedServerId)),
    ).length,
    hasToken: armedHeld.token !== null,
    // Counts only the names the file still declares.
    values: (armedServer?.env ?? []).filter((name) => armedHeld.env[name] !== undefined).length,
  };

  /** Asks what is held as the server is armed, since the question says what leaves this machine. */
  useEffect(() => {
    if (armedServerId === null) {
      setArmedHeld(NOTHING_HELD);

      return;
    }

    let isStanding = true;

    void serverSecretsHeld(armedServerId).then((answer) => {
      if (isStanding) {
        setArmedHeld(answer);
      }
    });

    return () => {
      isStanding = false;
    };
  }, [armedServerId]);

  /** Yes: the server goes with its grants and, thirty seconds later, its keys. */
  function confirmDelete() {
    const leaving = armedServerId;

    setArmedServerId(null);

    if (leaving !== null) {
      void writes.deleteServer(leaving);
    }
  }

  /** Opens the form on a server, or empty for a new declaration. */
  function openForm(serverId: string | "new" | null) {
    setOpenServerId(serverId);
    setEdits(null);
    // Typed secrets belong to their form and go with it.
    setSecrets({});
  }

  /** One name per variable, or the empty string for the token; an emptied field removes the value. */
  function editSecret(name: string, value: string) {
    setSecrets((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function editForm(patch: Partial<ServerFormValues>) {
    setEdits((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  /** Writes the form and closes it, new declarations included. */
  async function saveForm() {
    // Blocked by the same rules as the button in the form's foot.
    if (form === null || serverBlocker(form).length > 0 || isNameTaken) {
      return;
    }

    const serverId = await writes.saveServer(openServer?.id ?? null, form);

    /**
     * The file first, then this machine. Only touched fields are written, an emptied one included (it removes the value
     * from this machine); untouched fields survive a save.
     */
    await Promise.all(
      Object.entries(secrets).map(([name, value]) =>
        name === "" ? saveServerToken(serverId, value) : saveServerEnvValue(serverId, name, value),
      ),
    );

    setEdits(null);
    setSecrets({});
    setOpenServerId(null);
  }

  return {
    openServerId,
    openServer,
    form,
    held,
    secrets,
    editSecret,
    armedServer,
    armedBurden,
    arm: setArmedServerId,
    confirmDelete,
    dismissDelete: () => setArmedServerId(null),
    isDirty: changes.length > 0,
    unsaved,
    openForm,
    editForm,
    saveForm,
  };
}
