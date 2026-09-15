import type { McpFunction, McpLookMemory, McpLookStore } from "../interfaces";

/** What the memory says about the look just taken — the halves of the row's closing line a look cannot know. */
export interface McpRemembered {
  changedAt: number | null;
  wasCount: number | null;
}

const NOTHING_REMEMBERED: McpRemembered = {
  changedAt: null,
  wasCount: null,
};

/**
 * The memory of the last look — «оновлено вчора · 34 → 33».
 *
 * Written **only for a server that answered**: a fallen one hands over nothing, and writing that down would say
 * the list went to zero. The first look writes the list and says nothing about it — a change needs two looks.
 */
export class McpMemory {
  constructor(private readonly store: McpLookStore) {}

  async after(serverId: string, functions: McpFunction[]): Promise<McpRemembered> {
    const names = functions.map((held) => held.name);
    const held = await this.store.of(serverId);

    if (held === null) {
      await this.store.put({
        serverId,
        names,
        changedAt: null,
        wasCount: null,
      });

      return NOTHING_REMEMBERED;
    }

    if (isSameList(held.names, names)) {
      return {
        changedAt: held.changedAt,
        wasCount: held.wasCount,
      };
    }

    // The count before the change is the news; a second change before anybody looked keeps the **first** number,
    // because the arrow answers «what did it use to be», not «what was it an hour ago».
    const changed: McpLookMemory = {
      serverId,
      names,
      changedAt: Date.now(),
      wasCount: held.wasCount ?? held.names.length,
    };

    await this.store.put(changed);

    return {
      changedAt: changed.changedAt,
      wasCount: changed.wasCount,
    };
  }

  /** The page was opened, so the news has been read. What changed and when stays; only the arrow goes. */
  async seen(serverId: string): Promise<void> {
    const held = await this.store.of(serverId);

    if (held === null || held.wasCount === null) {
      return;
    }

    await this.store.put({
      ...held,
      wasCount: null,
    });
  }
}

/** Order is the server's own and means nothing to us: two lists are the same list when they hold the same names. */
function isSameList(held: string[], now: string[]): boolean {
  if (held.length !== now.length) {
    return false;
  }

  const there = new Set(held);

  return now.every((name) => there.has(name));
}
