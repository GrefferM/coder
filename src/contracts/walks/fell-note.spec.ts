import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fellNote } from "./fell-note";
import { CHAT_FAILED_NOTE } from "./chat-notes.constant";

describe("fellNote", () => {
  it("says the app's word and the provider's sentence after it", () => {
    assert.equal(fellNote("404 page not found"), `${CHAT_FAILED_NOTE} · 404 page not found`);
  });

  it("says the word alone where nothing came back, since a separator would promise a reason twice", () => {
    assert.equal(fellNote(""), CHAT_FAILED_NOTE);
  });

  it("takes one line of a sentence printed over several", () => {
    assert.equal(
      fellNote("Error: connect ECONNREFUSED\n    at TCPConnectWrap.afterConnect"),
      `${CHAT_FAILED_NOTE} · Error: connect ECONNREFUSED at TCPConnectWrap.afterConnect`,
    );
  });

  it("stops where the words stop and the markup begins, as the catalogue does with a server's", () => {
    assert.equal(
      fellNote("Oops, something went wrong <html><body><svg>…</svg></body></html>"),
      `${CHAT_FAILED_NOTE} · Oops, something went wrong`,
    );
  });

  it("keeps a long sentence whole: the reason is what the rule is for", () => {
    const said = "б".repeat(400);

    assert.equal(fellNote(said), `${CHAT_FAILED_NOTE} · ${said}`);
  });
});
