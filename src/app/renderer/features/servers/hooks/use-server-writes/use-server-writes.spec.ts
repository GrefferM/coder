import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useServerWrites } from "./use-server-writes";
import { MCP_CONSENT_CHANNEL } from "../../../../../../contracts";
import { aConfig, standInBridge } from "../../../../testing";
import type { OpenProject, ProjectConfig, ProjectMcpServer } from "../../../../interfaces";
import type { ProjectWrite } from "../../../project";
import type { ServerFormValues } from "../../interfaces";

const SERVER: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "exa-mcp",
  isLocal: true,
  run: "npx -y exa-mcp-server",
  address: "",
  signIn: "none",
  env: [],
};

const VALUES: ServerFormValues = {
  name: "exa-mcp",
  isLocal: true,
  run: "npx -y exa-mcp-server@2",
  address: "",
  signIn: "none",
  env: [],
};

/** The bridge, recording every channel it was asked over and what with. */
function machine() {
  const asked: { channel: string; payload: unknown }[] = [];

  standInBridge({
    invoke: vi.fn(async (channel: string, payload: unknown) => {
      asked.push({
        channel,
        payload,
      });
    }),
  });

  return asked;
}

/** A project holding one server, and the writer that records what it was given. */
function standing(saved: ProjectConfig[]): { project: OpenProject; write: ProjectWrite } {
  const write: ProjectWrite = {
    save: async (config) => {
      saved.push(config);
    },
    defer: async () => undefined,
    writeNote: null,
    retryWrite: async () => undefined,
    sayNote: () => undefined,
    dismissWriteNote: () => undefined,
    undoOffers: [],
    undoOffer: async () => undefined,
    undoDelete: async () => undefined,
    restoreDeletion: async () => undefined,
  };

  return {
    project: {
      directory: "/tmp/coder",
      config: aConfig({
        servers: [SERVER],
      }),
      print: "print",
      view: null,
    },
    write,
  };
}

describe("useServerWrites", () => {
  it("agrees to the line written in the form, as the file will hold it", async () => {
    const asked = machine();
    const saved: ProjectConfig[] = [];
    const { project, write } = standing(saved);
    const { result } = renderHook(() => useServerWrites(project, write));

    await act(async () => {
      await result.current.saveServer(SERVER.id, VALUES);
    });

    const consent = asked.find((one) => one.channel === MCP_CONSENT_CHANNEL);

    expect(consent?.payload).toEqual({
      server: {
        ...SERVER,
        run: "npx -y exa-mcp-server@2",
      },
    });
    expect(saved[0].servers).toEqual([
      {
        ...SERVER,
        run: "npx -y exa-mcp-server@2",
      },
    ]);
  });

  it("agrees to a server declared for the first time under the id it is written with", async () => {
    const asked = machine();
    const saved: ProjectConfig[] = [];
    const { project, write } = standing(saved);
    const { result } = renderHook(() => useServerWrites(project, write));
    let id = "";

    await act(async () => {
      id = await result.current.saveServer(null, {
        ...VALUES,
        name: "shop-db",
      });
    });

    const consent = asked.find((one) => one.channel === MCP_CONSENT_CHANNEL);

    expect((<{ server: ProjectMcpServer }>consent?.payload).server.id).toBe(id);
    expect(saved[0].servers.at(-1)?.id).toBe(id);
  });
});
