import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSharedSphere } from "./use-shared-sphere";
import {
  SAVE_WIDGET_CHANNEL,
  WIDGET_SETTINGS_CHANGED_CHANNEL,
  WIDGET_SETTINGS_CHANNEL,
} from "../../../../../../contracts";
import { standInBridge } from "../../../../testing";
import type { WidgetSettings } from "../../../../../../contracts";

const SETTINGS: WidgetSettings = {
  directory: "/work/english",
  place: null,
  chosen: {
    "/work/english": "agent-a",
  },
};

/** A machine holding the settings, keeping the listener it is subscribed with. */
function machine() {
  const pushes: ((settings: WidgetSettings) => void)[] = [];
  const invoke = vi.fn(async (channel: string) => (channel === WIDGET_SETTINGS_CHANNEL ? SETTINGS : undefined));

  standInBridge<WidgetSettings>({
    invoke,
    subscribe: (channel, listener) => {
      if (channel === WIDGET_SETTINGS_CHANGED_CHANNEL) {
        pushes.push(listener);
      }

      return () => undefined;
    },
  });

  return {
    invoke,
    pushes,
  };
}

describe("useSharedSphere", () => {
  it("aims the chat at the sphere the widget chose, at the start and when it chooses another", async () => {
    const { pushes } = machine();
    const aim = vi.fn();

    renderHook(() =>
      useSharedSphere({
        directory: "/work/english",
        aimedAgentId: null,
        aim,
      }),
    );

    await waitFor(() => expect(aim).toHaveBeenCalledWith("agent-a"));

    act(() =>
      pushes.forEach((push) =>
        push({
          ...SETTINGS,
          chosen: {
            "/work/english": "agent-b",
          },
        }),
      ),
    );

    expect(aim).toHaveBeenLastCalledWith("agent-b");
  });

  it("names the agent the chat aims at to the widget, and not the one it already holds", async () => {
    const { invoke } = machine();
    const aim = vi.fn();
    const { rerender } = renderHook(
      ({ aimedAgentId }) =>
        useSharedSphere({
          directory: "/work/english",
          aimedAgentId,
          aim,
        }),
      {
        initialProps: {
          aimedAgentId: "agent-a" as string | null,
        },
      },
    );

    await waitFor(() => expect(aim).toHaveBeenCalledWith("agent-a"));
    rerender({
      aimedAgentId: "agent-c",
    });

    expect(invoke).toHaveBeenCalledWith(SAVE_WIDGET_CHANNEL, {
      chosen: {
        "/work/english": "agent-c",
      },
    });
    expect(invoke.mock.calls.filter(([channel]) => channel === SAVE_WIDGET_CHANNEL)).toHaveLength(1);
  });
});
