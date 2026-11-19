import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSharedProject } from "./use-shared-project";
import {
  OPEN_PROJECT_CHANNEL,
  PROJECT_VIEW_CHANNEL,
  SAVE_WIDGET_CHANNEL,
  WIDGET_SETTINGS_CHANGED_CHANNEL,
  WIDGET_SETTINGS_CHANNEL,
} from "../../../../../../contracts";
import { aConfig, standInBridge } from "../../../../testing";
import type { WidgetSettings } from "../../../../../../contracts";
import type { OpenProject } from "../../../../interfaces";

const SETTINGS: WidgetSettings = {
  directory: "/work/english",
  chosen: {},
};

/** A machine whose widget names `SETTINGS`' project, keeping the listener it is subscribed with. */
function machine() {
  const pushes: ((settings: WidgetSettings) => void)[] = [];
  const invoke = vi.fn(async (channel: string) => {
    if (channel === WIDGET_SETTINGS_CHANNEL) {
      return SETTINGS;
    }

    if (channel === OPEN_PROJECT_CHANNEL) {
      return {
        config: aConfig(),
        print: "print-1",
      };
    }

    return channel === PROJECT_VIEW_CHANNEL ? null : undefined;
  });

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

describe("useSharedProject", () => {
  it("opens the project the widget names, and closes when the widget closes it", async () => {
    const { pushes } = machine();
    const onOpened = vi.fn();

    renderHook(() =>
      useSharedProject({
        project: null,
        onOpened,
      }),
    );

    await waitFor(() =>
      expect(onOpened).toHaveBeenCalledWith(
        expect.objectContaining({
          directory: "/work/english",
        }),
      ),
    );

    act(() =>
      pushes.forEach((push) =>
        push({
          ...SETTINGS,
          directory: null,
        }),
      ),
    );

    expect(onOpened).toHaveBeenLastCalledWith(null);
  });

  it("names a project this window opens to the widget, and not the one the widget named", async () => {
    const { invoke } = machine();
    const opened = (directory: string): OpenProject => ({
      directory,
      config: aConfig(),
      print: "print-1",
      view: null,
    });
    const onOpened = vi.fn();
    const { rerender } = renderHook(
      ({ project }) =>
        useSharedProject({
          project,
          onOpened,
        }),
      {
        initialProps: {
          project: null as OpenProject | null,
        },
      },
    );

    await waitFor(() => expect(onOpened).toHaveBeenCalled());
    rerender({
      project: opened("/work/english"),
    });
    rerender({
      project: opened("/work/other"),
    });

    expect(invoke.mock.calls.filter(([channel]) => channel === SAVE_WIDGET_CHANNEL)).toEqual([
      [
        SAVE_WIDGET_CHANNEL,
        {
          directory: "/work/other",
        },
      ],
    ]);
  });
});
