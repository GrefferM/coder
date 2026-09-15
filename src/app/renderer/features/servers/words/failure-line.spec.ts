import { describe, expect, it } from "vitest";
import { failureLine } from "./failure-line";

describe("failureLine", () => {
  it("keeps a short failure exactly as the server said it", () => {
    expect(failureLine("Error: spawn npx ENOENT")).toBe("Error: spawn npx ENOENT");
  });

  it("stops where the server stops talking and starts sending a web page", () => {
    // An address that is not a server answers with html, and the transport hands the whole page over word for word.
    expect(
      failureLine('Error: Streamable HTTP error: Error POSTing to endpoint: <html lang="uk-UA"><head><title>Oops'),
    ).toBe("Error: Streamable HTTP error: Error POSTing to endpoint:");
  });

  it("says the whole of it cut short when the page begins at the first character", () => {
    expect(failureLine("<html><body>Something went wrong</body></html>")).toBe(
      "<html><body>Something went wrong</body></html>",
    );
  });

  it("puts a failure printed over many lines onto one", () => {
    expect(failureLine("Error: connect ECONNREFUSED\n    at TCPConnectWrap.afterConnect")).toBe(
      "Error: connect ECONNREFUSED at TCPConnectWrap.afterConnect",
    );
  });

  it("cuts a failure that runs long and says it was cut", () => {
    const said = failureLine(`Error: ${"дуже довге пояснення ".repeat(40)}`);

    expect(said.length).toBeLessThanOrEqual(201);
    expect(said.endsWith("…")).toBe(true);
  });
});
