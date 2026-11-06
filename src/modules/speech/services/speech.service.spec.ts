import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { SPEECH_FILE_NAME } from "../constants";
import { SPEECH_HEARING_FAILED, SPEECH_NOT_SET } from "../interfaces";
import { SpeechService } from "./speech.service";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { HeardSound, SpeechReach } from "../interfaces";

interface HeardRequest {
  url: string;
  authorization: string;
  body: string;
}

interface StandIn {
  server: Server;
  address: string;
  heard: HeardRequest[];
}

/** A provider that answers every recording with the status and body it is given. */
async function providerAnswering(status: number, body: string): Promise<StandIn> {
  const heard: HeardRequest[] = [];
  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      heard.push({
        url: request.url ?? "",
        authorization: request.headers.authorization ?? "",
        body: Buffer.concat(chunks).toString("latin1"),
      });
      response.writeHead(status, {
        "Content-Type": "application/json",
      });
      response.end(body);
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  const { port } = <AddressInfo>server.address();

  return {
    server,
    address: `http://127.0.0.1:${port}`,
    heard,
  };
}

function reachOf(key: string | null, address: string | null): SpeechReach {
  return {
    keyOf: async () => key,
    addressOf: async () => address,
  };
}

/** A recording to the provider and model the project hears with. */
function soundFor(providerId: string, model: string): HeardSound {
  return {
    audio: new Uint8Array([1, 2, 3]),
    mimeType: "audio/webm",
    providerId,
    model,
  };
}

describe("SpeechService", () => {
  let directory: string;
  let standIn: StandIn | null;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), "coder-speech-"));
    standIn = null;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      if (standIn === null) {
        resolve();

        return;
      }

      standIn.server.close(() => resolve());
    });
  });

  it("reads no voice where nothing was written", async () => {
    const speechService = new SpeechService(reachOf(null, null), directory);

    assert.deepEqual(await speechService.settings(), {
      voiceName: null,
    });
  });

  it("reads a voice held as something else as none, and leaves out what is not this machine's", async () => {
    const speechService = new SpeechService(reachOf(null, null), directory);

    await writeFile(
      path.join(directory, SPEECH_FILE_NAME),
      JSON.stringify({
        listenProviderId: "openai",
        voiceName: 7,
      }),
    );

    assert.deepEqual(await speechService.settings(), {
      voiceName: null,
    });
  });

  it("gives back the voice it saved", async () => {
    const speechService = new SpeechService(reachOf(null, null), directory);

    await speechService.save({
      voiceName: "Lesya",
    });

    assert.deepEqual(await speechService.settings(), {
      voiceName: "Lesya",
    });
  });

  it("refuses to hear while the provider holds no key", async () => {
    const speechService = new SpeechService(reachOf(null, null), directory);

    await assert.rejects(speechService.hear(soundFor("openai", "whisper-1")), {
      code: SPEECH_NOT_SET,
    });
  });

  it("refuses to hear while RunPod's card holds no address", async () => {
    const speechService = new SpeechService(reachOf("rpa-1", null), directory);

    await assert.rejects(speechService.hear(soundFor("runpod-openai", "whisper")), {
      code: SPEECH_NOT_SET,
    });
  });

  it("puts the recording to RunPod's endpoint under the OpenAI protocol, with the key and the recording's model", async () => {
    standIn = await providerAnswering(
      200,
      JSON.stringify({
        text: "  Подивись, чому падає вихід. ",
      }),
    );

    const speechService = new SpeechService(reachOf("rpa-1", standIn.address), directory);
    const words = await speechService.hear(soundFor("runpod-openai", "whisper-large"));
    const [request] = standIn.heard;

    assert.equal(words, "Подивись, чому падає вихід.");
    assert.equal(request.url, "/openai/v1/audio/transcriptions");
    assert.equal(request.authorization, "Bearer rpa-1");
    assert.match(request.body, /name="model"\r\n\r\nwhisper-large/);
    assert.match(request.body, /filename="speech\.webm"/);
  });

  it("hands on the provider's own sentence when it refuses", async () => {
    standIn = await providerAnswering(
      401,
      JSON.stringify({
        error: {
          message: "Incorrect API key provided",
        },
      }),
    );

    const speechService = new SpeechService(reachOf("rpa-1", standIn.address), directory);

    await assert.rejects(speechService.hear(soundFor("runpod-openai", "whisper-large")), {
      code: SPEECH_HEARING_FAILED,
      said: "Incorrect API key provided",
    });
  });

  it("hands on the status where the provider says nothing", async () => {
    standIn = await providerAnswering(503, "");

    const speechService = new SpeechService(reachOf("rpa-1", standIn.address), directory);

    await assert.rejects(speechService.hear(soundFor("runpod-openai", "whisper-large")), {
      code: SPEECH_HEARING_FAILED,
      said: "503",
    });
  });
});
