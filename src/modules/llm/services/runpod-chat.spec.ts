import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunPodChat } from "./runpod-chat.service";

const ADDRESS = "https://api.runpod.ai/v2/z5x8c1v4b7n2m6";

/** One asked turn, as the endpoint's own answer comes back: a list with the answer first. */
function answered(content: string) {
  return {
    status: "COMPLETED",
    output: [
      {
        choices: [
          {
            finish_reason: "stop",
            message: {
              role: "assistant",
              content,
            },
          },
        ],
        usage: {
          prompt_tokens: 34,
          completion_tokens: 16,
          total_tokens: 50,
        },
      },
    ],
  };
}

/** The queue, standing in for the real one: every ask is written down, and the answers are handed out in turn. */
function queue(answers: unknown[]) {
  const asked: { url: string; method: string; body: unknown }[] = [];
  let stood = 0;

  globalThis.fetch = (async (url: string, sent: RequestInit) => {
    asked.push({
      url: String(url),
      method: String(sent.method),
      body: sent.body === undefined ? null : JSON.parse(String(sent.body)),
    });

    const said = answers[Math.min(stood, answers.length - 1)];

    stood += 1;

    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(said),
    };
  }) as unknown as typeof fetch;

  return asked;
}

function opened() {
  return new RunPodChat({
    address: ADDRESS,
    key: "rpa_test",
    temperature: 0.3,
    answerTokens: 4_096,
  });
}

describe("RunPodChat", () => {
  afterEach(() => {
    globalThis.fetch = undefined as unknown as typeof fetch;
  });

  it("throws the conversation into the queue with the turn's own two numbers", async () => {
    const asked = queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      answered("Готово."),
    ]);

    await opened().invoke([new SystemMessage("Ти правиш код."), new HumanMessage("Прогони тести")]);

    assert.equal(asked[0].url, `${ADDRESS}/run`);
    assert.equal(asked[0].method, "POST");
    assert.deepEqual(asked[0].body, {
      input: {
        messages: [
          {
            role: "system",
            content: "Ти правиш код.",
          },
          {
            role: "user",
            content: "Прогони тести",
          },
        ],
        sampling_params: {
          max_tokens: 4_096,
          temperature: 0.3,
        },
      },
    });
  });

  it("asks the job about itself until it is over, and brings back what it said", async () => {
    const asked = queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      answered("Готово."),
    ]);
    const said = await opened().invoke([new HumanMessage("Прогони тести")]);

    assert.equal(said.content, "Готово.");
    assert.equal(asked[1].url, `${ADDRESS}/status/job-1`);
    assert.equal(asked[1].method, "GET");
  });

  it("brings the token counts back with the answer, which is why the whole answer is waited for", async () => {
    queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      answered("Готово."),
    ]);

    const said = await opened().invoke([new HumanMessage("Прогони тести")]);

    assert.deepEqual(said.usage_metadata, {
      input_tokens: 34,
      output_tokens: 16,
      total_tokens: 50,
    });
  });

  it("says the ceiling's own word under the name every other provider says it by", async () => {
    const cut = answered("Готово");

    cut.output[0].choices[0].finish_reason = "length";
    queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      cut,
    ]);

    const said = await opened().invoke([new HumanMessage("Прогони тести")]);

    assert.equal(said.response_metadata.finish_reason, "length");
  });

  it("falls with the worker's own words where the job ended in anything but an answer", async () => {
    queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      {
        id: "job-1",
        status: "FAILED",
        error: "CUDA out of memory",
      },
    ]);

    await assert.rejects(opened().invoke([new HumanMessage("Прогони тести")]), /CUDA out of memory/);
  });

  it("falls with what the worker wrote where the job finished carrying no answer at all", async () => {
    // The endpoint's own insides can refuse the ask — the job is over and done, and holds their words instead.
    queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      {
        id: "job-1",
        status: "COMPLETED",
        output: [
          {
            error: "This model's maximum context length is 8192 tokens.",
          },
        ],
      },
    ]);

    await assert.rejects(opened().invoke([new HumanMessage("Прогони тести")]), /maximum context length/);
  });

  it("falls with the queue's own status where the queue itself refused the ask", async () => {
    globalThis.fetch = (async () => ({
      ok: false,
      status: 401,
      text: async () => '{"error":"Unauthorized"}',
    })) as unknown as typeof fetch;

    await assert.rejects(opened().invoke([new HumanMessage("Прогони тести")]), /401/);
  });

  it("takes the job off the queue when the hand stops the turn, so nobody pays for an answer nobody waits for", async () => {
    const asked = queue([
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
      {
        id: "job-1",
        status: "IN_QUEUE",
      },
    ]);
    const stopping = new AbortController();
    const turn = opened().invoke([new HumanMessage("Прогони тести")], {
      signal: stopping.signal,
    });

    stopping.abort();

    await assert.rejects(turn);
    assert.equal(
      asked.some((ask) => ask.url === `${ADDRESS}/cancel/job-1` && ask.method === "POST"),
      true,
    );
  });
});
