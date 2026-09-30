import type { CommandToolGrant, PinnedArgument } from "../../../interfaces";

/** Pins a parameter with an empty value. */
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

/** Unpins the parameter and discards its value. */
export function withoutPinned(grant: CommandToolGrant, pinnedId: string): CommandToolGrant {
  return {
    ...grant,
    pinned: grant.pinned.filter((pinned) => pinned.id !== pinnedId),
  };
}

/** Sets one pinned parameter's value by id. */
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
