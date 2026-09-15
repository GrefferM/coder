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
/** The one form of the MCP section — opened on a server, or on nothing for a new one. */
export function useServerSection(project: OpenProject, writes: ServerWrites): ServerSection {
  const [openServerId, setOpenServerId] = useState<string | "new" | null>(null);
  const [edits, setEdits] = useState<Partial<ServerFormValues> | null>(null);
  // What was typed into the secret fields this time; the token lives under the empty key.
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<McpSecretsHeld>(NOTHING_HELD);
  // The server a question stands over, and what this machine holds for it while the question stands.
  const [armedServerId, setArmedServerId] = useState<string | null>(null);
  const [armedHeld, setArmedHeld] = useState<McpSecretsHeld>(NOTHING_HELD);

  /**
   * What this machine already holds for the open server. Asked when the form opens and never again: the answer
   * says whether, not what, so nothing here can go stale in a way anybody would see.
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
  // A new declaration becomes unsaved work at the first keystroke, exactly as a command's does.
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
    // Only the names the file still declares are counted: a value under a name nobody names is not this server's.
    values: (armedServer?.env ?? []).filter((name) => armedHeld.env[name] !== undefined).length,
  };

  /** The question says what leaves this machine, so what is held is asked for as the server is armed. */
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

  /** The question's yes: the server goes, and with it the grants and — thirty seconds later — its keys. */
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
    // What was typed into a secret field belongs to the form it was typed in, and goes with it.
    setSecrets({});
  }

  /** One name for one variable, or the empty string for the token; an emptied field takes the value off. */
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
     * The file first, then this machine. A new server is named by the write above, and its secrets are held under
     * that name alone — so there is nothing to write them under until it exists.
     *
     * Only the fields somebody **touched** are written, an emptied one included: emptying is how a value is taken
     * off this machine. A field nobody touched is not in here at all, so what was typed in long ago lives
     * through a save that was about the name or the line. And emptying is a thing done on purpose — the cross in
     * the field — rather than the accident of leaving a field alone, which is what nobody could guess.
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
