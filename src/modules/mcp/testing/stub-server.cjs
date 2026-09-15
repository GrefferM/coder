// A stand-in MCP server for the client's tests: newline-delimited JSON-RPC over stdio and nothing else, so what
// the tests hold is the wire the client speaks, not the library on the other side of it. It takes one argument —
// a file it appends a line to every time it starts — which is how a test sees whether the process was started
// twice or held open. A second argument names an environment variable, and then the line carries its value too,
// which is how a test sees what the process was actually started with (36c).
const { appendFileSync } = require("node:fs");

const [, , startsFile, echoName] = process.argv;

if (startsFile !== undefined) {
  appendFileSync(startsFile, echoName === undefined ? "start\n" : `start ${process.env[echoName] ?? ""}\n`);
}

const TOOLS = [
  {
    name: "read_file",
    description: "Читає файл.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
        },
      },
      required: ["path"],
    },
  },
  {
    // A server need not describe a function.
    name: "list_roots",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

function say(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function answer(request) {
  if (request.method === "initialize") {
    return {
      // Whatever version the client asked for is the version this stand-in speaks.
      protocolVersion: request.params.protocolVersion,
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "stub",
        version: "1.0.0",
      },
    };
  }

  if (request.method === "tools/list") {
    return {
      tools: TOOLS,
    };
  }

  if (request.method === "tools/call") {
    return called(request.params);
  }

  return null;
}

// Every answer the tests need out of a call, chosen by the name that was called.
function called(params) {
  if (params.name === "read_file") {
    return {
      content: [
        {
          type: "text",
          text: `read ${params.arguments.path}`,
        },
      ],
    };
  }

  if (params.name === "list_roots") {
    return {
      content: [
        {
          type: "text",
          text: "one",
        },
        {
          type: "image",
          data: "iVBORw0KGgo=",
          mimeType: "image/png",
        },
        {
          type: "text",
          text: "two",
        },
      ],
    };
  }

  if (params.name === "says_nothing") {
    return {
      content: [],
    };
  }

  if (params.name === "goes_wrong") {
    return {
      content: [
        {
          type: "text",
          text: "немає такого файлу",
        },
      ],
      isError: true,
    };
  }

  if (params.name === "falls") {
    // The server dies mid-call, which is how a fallen one is seen from this side.
    process.exit(1);
  }

  return null;
}

let standing = "";

process.stdin.on("data", (chunk) => {
  standing += chunk.toString("utf8");

  const lines = standing.split("\n");

  standing = lines.pop() ?? "";

  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }

    const request = JSON.parse(line);

    // A notification has no id and is answered with nothing.
    if (request.id === undefined) {
      continue;
    }

    const result = answer(request);

    say(
      result === null
        ? {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`,
            },
          }
        : {
            jsonrpc: "2.0",
            id: request.id,
            result,
          },
    );
  }
});
