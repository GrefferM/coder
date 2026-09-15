import {
  CLOSE_MCP_SERVER_CHANNEL,
  LOOK_MCP_SERVER_CHANNEL,
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
 * Asks one server what it hands over. A server that will not answer is not a failure to this screen —
 * the main process says so in the look itself — so nothing here throws; only an unreachable machine falls through.
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
      // The main process says what the calls came to; a look that never reached it knows nothing of them.
      changedAt: null,
      wasCount: null,
      calls: NO_MCP_CALLS,
    };
  }
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

/** The page was opened, so «34 → 33» has been read — the arrow goes out and does not come back. */
export async function seenServer(serverId: string): Promise<void> {
  try {
    await window.electronApi.invoke(SEEN_MCP_SERVER_CHANNEL, {
      id: serverId,
    });
  } catch {
    // News nobody could write down is news nobody will be shown twice; the row is right either way.
  }
}

/**
 * Says a server was deleted here, so its keys are owed a sweep. They do not go yet — the undo has
 * thirty seconds — and this is what lets the sweep finish the job even if the app closes in between.
 */
export async function dropServer(serverId: string): Promise<void> {
  try {
    await window.electronApi.invoke(DROP_MCP_SERVER_CHANNEL, {
      id: serverId,
    });
  } catch {
    // A debt nobody could write down is a key left behind, not a screen that should stop.
  }
}

/** Takes off this machine the keys of every server dropped here that the project no longer names. */
export async function sweepServerKeys(serverIds: string[]): Promise<void> {
  try {
    await window.electronApi.invoke(SWEEP_MCP_KEYS_CHANNEL, {
      serverIds,
    });
  } catch {
    // The sweep is owed, not urgent: the next opening of the project asks again.
  }
}

/** Writes the token typed into the one field; an empty value takes it off this machine. */
export async function saveServerToken(serverId: string, value: string): Promise<void> {
  await window.electronApi.invoke(SAVE_MCP_TOKEN_CHANNEL, {
    serverId,
    value,
  });
}

/** Writes one environment variable's value; the name rides in the file, the value stays here. */
export async function saveServerEnvValue(serverId: string, name: string, value: string): Promise<void> {
  await window.electronApi.invoke(SAVE_MCP_ENV_VALUE_CHANNEL, {
    serverId,
    name,
    value,
  });
}

/**
 * What this machine holds for one server — never the secrets, only whether they are there.
 * A machine that cannot be asked holds nothing as far as the screen knows, and the screen then says what the
 * project says: the names are declared and the values are not here.
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
