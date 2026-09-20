import { describe, expect, it } from "vitest";
import { fellNote } from "./fell-note";
import { CHAT_FAILED_NOTE } from "../constants";

describe("fellNote", () => {
  it("says the app's word and the provider's sentence after it", () => {
    expect(fellNote("404 page not found")).toBe(`${CHAT_FAILED_NOTE} · 404 page not found`);
  });

  it("says the word alone where nothing came back, since a separator would promise a reason twice", () => {
    expect(fellNote("")).toBe(CHAT_FAILED_NOTE);
  });

  it("takes one line of a sentence printed over several", () => {
    expect(fellNote("Error: connect ECONNREFUSED\n    at TCPConnectWrap.afterConnect")).toBe(
      `${CHAT_FAILED_NOTE} · Error: connect ECONNREFUSED at TCPConnectWrap.afterConnect`,
    );
  });

  it("stops where the words stop and the markup begins, as the catalogue does with a server's", () => {
    expect(fellNote("Oops, something went wrong <html><body><svg>…</svg></body></html>")).toBe(
      `${CHAT_FAILED_NOTE} · Oops, something went wrong`,
    );
  });

  it("cuts a sentence that runs long rather than making the rule a paragraph", () => {
    const note = fellNote("б".repeat(400));

    expect(note.endsWith("…")).toBe(true);
    expect(note.length).toBeLessThan(`${CHAT_FAILED_NOTE} · `.length + 210);
  });
});
