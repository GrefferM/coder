import { createDataSource } from "../../modules";
import { createCommandsModule } from "../../modules/commands";
import { createLlmModule } from "../../modules/llm";
import { createMcpModule } from "../../modules/mcp";
import { createProjectModule } from "../../modules/projects";
import { createProvidersModule } from "../../modules/providers";
import { createRunModule } from "../../modules/runs";
import { createSchedulesModule } from "../../modules/schedules";
import { createSecretsModule } from "../../modules/secrets";
import { createSpeechModule } from "../../modules/speech";
import { createWidgetModule } from "../../modules/widget";
import { RunRecordStore, createWalksModule } from "../../modules/walks";
import type { Backend, BackendGround } from "./interfaces";

/**
 * Opens the SQLite database in the user-data folder, applies pending migrations and wires every domain. The window's
 * app and a command line build it the same way; only who is spoken to differs.
 */
export async function createBackend({ userDataPath, cipher, voices, hearingAppPath }: BackendGround): Promise<Backend> {
  const dataSource = createDataSource(userDataPath);

  await dataSource.initialize();
  await dataSource.runMigrations();

  const {
    controller: projectController,
    deletionController,
    watch,
    finder,
  } = createProjectModule(dataSource, voices.project);
  const { service: secretService } = createSecretsModule(cipher, userDataPath);
  const { controller: providerController, service: providerService } = createProvidersModule(
    secretService,
    userDataPath,
  );
  const { controller: speechController } = createSpeechModule(providerService, userDataPath, hearingAppPath);
  const { controller: runController, keeper, reader: runReader, writer: runWriter } = createRunModule(dataSource);
  const { runner: commandRunner } = createCommandsModule();
  // A local server is a process this backend started, so this backend stops it.
  const { controller: mcpController, client } = createMcpModule(secretService, dataSource);
  const { service: llmService } = createLlmModule(providerService, voices.agent, commandRunner, client, runReader);
  const {
    controller: walkController,
    widgetController: widgetWalkController,
    hub,
    scheduled,
  } = createWalksModule({
    record: new RunRecordStore(runWriter, runReader),
    llm: llmService,
    providers: providerService,
    servers: client,
    voice: voices.walk,
    widget: voices.widget,
  });
  const { controller: scheduleController, clock } = createSchedulesModule(scheduled);
  const { controller: widgetController, settings: widgetSettings } = createWidgetModule(userDataPath);

  return {
    projectController,
    deletionController,
    providerController,
    speechController,
    mcpController,
    runController,
    walkController,
    scheduleController,
    widgetController,
    widgetWalkController,
    widgetSettings,
    watch,
    finder,
    hub,
    keeper,
    stopServers: () => client.closeAll(),
    stopSchedules: () => clock.stop(),
  };
}
