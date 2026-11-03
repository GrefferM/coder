import {
  CLOSE_MCP_SERVER_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
  MCP_CONSENTED_CHANNEL,
  MCP_CONSENT_CHANNEL,
  MCP_SECRETS_HELD_CHANNEL,
  NO_MCP_CALLS,
  SAVE_MCP_ENV_VALUE_CHANNEL,
  SAVE_MCP_TOKEN_CHANNEL,
  SEEN_MCP_SERVER_CHANNEL,
  DROP_MCP_SERVER_CHANNEL,
  SWEEP_MCP_KEYS_CHANNEL,
} from "../../../../../contracts";
import { NOTHING_HELD } from "../constants";
import type { McpLook, McpSecretsHeld, ProjectMcpServer } from "../../../interfaces";

/**
 * Asks one server what it hands over. An unanswering server is not a failure here (the look says so); only an
 * unreachable machine falls through.
 */
export async function lookServer(directory: string, server: ProjectMcpServer): Promise<McpLook> {
  try {
    return await window.electronApi.invoke(LOOK_MCP_SERVER_CHANNEL, {
      directory,
      server,
    });
  } catch (failure) {
    return {
      serverId: server.id,
      isUp: false,
      functions: [],
      answeredAt: null,
      failure: String(failure),
      // A look that never reached the main process knows nothing of the calls.
      changedAt: null,
      wasCount: null,
      calls: NO_MCP_CALLS,
    };
  }
}

/** Whether this machine agreed to start the server's run line as it stands; an unreachable machine has not. */
export async function isServerConsented(server: ProjectMcpServer): Promise<boolean> {
  try {
    return await window.electronApi.invoke(MCP_CONSENTED_CHANNEL, {
      server,
    });
  } catch {
    return false;
  }
}

/** «Запустити» in the consent window, or a line written by hand in the form: this machine agrees to it. */
export async function consentServer(server: ProjectMcpServer): Promise<void> {
  await window.electronApi.invoke(MCP_CONSENT_CHANNEL, {
    server,
  });
}

/** «ЗАПУСТИТИ»: lets a server go, so the next look starts it afresh. */
export async function closeServer(serverId: string): Promise<void> {
  try {
    await window.electronApi.invoke(CLOSE_MCP_SERVER_CHANNEL, {
      id: serverId,
    });
  } catch {
    // Nothing to let go of is nothing to answer for.
  }
}

/** Marks the page as opened, so the «34 → 33» arrow goes out for good. */
export async function seenServer(serverId: string): Promise<void> {
  try {
    await window.electronApi.invoke(SEEN_MCP_SERVER_CHANNEL, {
      id: serverId,
    });
  } catch {
    // A failed write loses only the news; the row is right either way.
  }
}

/**
 * Records that a server was deleted, so its keys are owed a sweep. The keys stay for the thirty-second undo, and the
 * record lets the sweep finish even if the app closes.
 */
export async function dropServer(serverId: string): Promise<void> {
  try {
    await window.electronApi.invoke(DROP_MCP_SERVER_CHANNEL, {
      id: serverId,
    });
  } catch {
    // A failed write leaves a key behind and does not stop the screen.
  }
}

/** Removes from this machine the keys of dropped servers the project does not name. */
export async function sweepServerKeys(serverIds: string[]): Promise<void> {
  try {
    await window.electronApi.invoke(SWEEP_MCP_KEYS_CHANNEL, {
      serverIds,
    });
  } catch {
    // The sweep is not urgent: the next opening of the project asks again.
  }
}

/** Writes the token from the one field; an empty value removes it from this machine. */
export async function saveServerToken(serverId: string, value: string): Promise<void> {
  await window.electronApi.invoke(SAVE_MCP_TOKEN_CHANNEL, {
    serverId,
    value,
  });
}

/** Writes one environment variable's value; the name stays in the file, the value here. */
export async function saveServerEnvValue(serverId: string, name: string, value: string): Promise<void> {
  await window.electronApi.invoke(SAVE_MCP_ENV_VALUE_CHANNEL, {
    serverId,
    name,
    value,
  });
}

/**
 * What this machine holds for one server: only whether secrets are there, never their values. If the machine cannot be
 * asked, it counts as holding nothing.
 */
export async function serverSecretsHeld(serverId: string): Promise<McpSecretsHeld> {
  try {
    return await window.electronApi.invoke(MCP_SECRETS_HELD_CHANNEL, {
      serverId,
    });
  } catch {
    return NOTHING_HELD;
  }
}
