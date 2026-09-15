import type { CommandToolGrant, PinnedArgument } from "../../../interfaces";

/** Pins a parameter with an empty value; what it is worth is typed on the row afterwards. */
export function withPinned(grant: CommandToolGrant, parameterId: string, id: string): CommandToolGrant {
  const pinned: PinnedArgument = {
    id,
    parameterId,
    value: "",
  };

  return {
    ...grant,
    pinned: [...grant.pinned, pinned],
  };
}

/** Unpins the parameter; its value is discarded, since the model fills it in itself again. */
export function withoutPinned(grant: CommandToolGrant, pinnedId: string): CommandToolGrant {
  return {
    ...grant,
    pinned: grant.pinned.filter((pinned) => pinned.id !== pinnedId),
  };
}

/** What one pinned parameter is worth, by its own id — the others stand as they were. */
export function withPinnedValue(grant: CommandToolGrant, pinnedId: string, value: string): CommandToolGrant {
  return {
    ...grant,
    pinned: grant.pinned.map((pinned) =>
      pinned.id === pinnedId
        ? {
            ...pinned,
            value,
          }
        : pinned,
    ),
  };
}
