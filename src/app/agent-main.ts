import { app } from "electron";
import { createBackend } from "./backend";
import { QuietVoice, SafeStorageCipher } from "./services";
import {
  AGENT_CLI_EXIT_FELL,
  AGENT_CLI_EXIT_NOT_ASKED,
  AGENT_CLI_EXIT_WHOLE,
  parseAgentArgs,
  sayTo,
} from "./agent-cli";
import { APP_NAME } from "./constants";
import { AgentAsk } from "../modules/walks";

// The same name as the window's app, so the database, the runs and the keys are the ones the window holds.
app.setName(APP_NAME);
// A command line needs no Dock icon.
app.dock?.hide();

/** One question from the command line, walked to its end; the conversation goes to the output, the exit code says how. */
async function run(): Promise<number> {
  const asked = parseAgentArgs(process.argv.slice(2));
  const quiet = new QuietVoice();
  const backend = await createBackend(app.getPath("userData"), new SafeStorageCipher(), {
    project: quiet,
    agent: quiet,
    walk: quiet,
  });

  try {
    const answered = await new AgentAsk(backend.hub, backend.finder).run(asked);

    await sayTo(process.stdout, answered.text);

    return answered.hasFallen ? AGENT_CLI_EXIT_FELL : AGENT_CLI_EXIT_WHOLE;
  } finally {
    await backend.stopServers();
  }
}

app
  .whenReady()
  .then(run)
  .then(
    (code) => app.exit(code),
    async (failure: unknown) => {
      await sayTo(process.stderr, failure instanceof Error ? failure.message : String(failure));
      app.exit(AGENT_CLI_EXIT_NOT_ASKED);
    },
  );
