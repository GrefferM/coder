import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { openTestDatabase } from "../../../utils/testing";
import { McpConsents } from "./mcp-consents.service";
import { McpServerConsentEntity } from "../entities";
import { TypeormMcpConsentStore } from "../stores";
import type { ProjectMcpServer } from "../interfaces";
import type { TestDatabase } from "../../../utils/testing";

const LOCAL: ProjectMcpServer = {
  id: "99999999-9999-4999-8999-999999999999",
  name: "exa-mcp",
  isLocal: true,
  run: "npx -y exa-mcp-server",
  address: "",
  signIn: "none",
  env: ["EXA_API_KEY"],
};

const OTHER: ProjectMcpServer = {
  ...LOCAL,
  id: "88888888-8888-4888-8888-888888888888",
  name: "shop-db",
};

const REMOTE: ProjectMcpServer = {
  id: "77777777-7777-4777-8777-777777777777",
  name: "github",
  isLocal: false,
  run: "",
  address: "https://api.githubcopilot.com/mcp/",
  signIn: "token",
  env: [],
};

describe("McpConsents", () => {
  let record: TestDatabase;
  let consents: McpConsents;

  beforeEach(async () => {
    // A real database, since the consent is a row of the app's own schema.
    record = await openTestDatabase();

    const store = new TypeormMcpConsentStore(record.dataSource.getRepository(McpServerConsentEntity));

    consents = new McpConsents(store);
  });

  afterEach(async () => {
    await record.close();
  });

  it("knows no consent for a local server nobody has agreed to", async () => {
    assert.equal(await consents.isGiven(LOCAL), false);
  });

  it("holds the consent once given, and after the database is opened again", async () => {
    await consents.give(LOCAL);

    assert.equal(await consents.isGiven(LOCAL), true);

    const reopened = await record.reopen();
    const store = new TypeormMcpConsentStore(reopened.getRepository(McpServerConsentEntity));
    const again = new McpConsents(store);

    assert.equal(await again.isGiven(LOCAL), true);
    await record.close(reopened);
  });

  it("knows no consent for the same server once its run line differs by a single character", async () => {
    await consents.give(LOCAL);

    assert.equal(
      await consents.isGiven({
        ...LOCAL,
        run: "npx -y exa-mcp-server ",
      }),
      false,
    );
  });

  it("agrees to the new line and no longer to the old one", async () => {
    const changed: ProjectMcpServer = {
      ...LOCAL,
      run: "npx -y exa-mcp-server@2",
    };

    await consents.give(LOCAL);
    await consents.give(changed);

    assert.equal(await consents.isGiven(changed), true);
    assert.equal(await consents.isGiven(LOCAL), false);
  });

  it("knows no consent for another server running the very same line", async () => {
    await consents.give(LOCAL);

    assert.equal(await consents.isGiven(OTHER), false);
  });

  it("asks no consent of a remote server and writes none for it", async () => {
    await consents.give(REMOTE);

    assert.equal(await consents.isGiven(REMOTE), true);
    assert.equal(await record.dataSource.getRepository(McpServerConsentEntity).count(), 0);
  });
});
