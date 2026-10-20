import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1789371935222 implements MigrationInterface {
  name = "Initial1789371935222";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "project_entries" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "directory" varchar NOT NULL, "openedAt" datetime NOT NULL, "view" text, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "deletedAt" datetime, CONSTRAINT "UQ_4ee7286b584e45976f671b70aea" UNIQUE ("directory"))',
    );
    await queryRunner.query(
      'CREATE TABLE "deletions" ("id" varchar PRIMARY KEY NOT NULL, "directory" varchar NOT NULL, "kind" varchar NOT NULL, "name" varchar NOT NULL, "body" text NOT NULL, "takenAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')))',
    );
    await queryRunner.query(
      'CREATE TABLE "mcp_dropped_servers" ("serverId" varchar PRIMARY KEY NOT NULL, "droppedAt" integer NOT NULL)',
    );
    await queryRunner.query(
      'CREATE TABLE "mcp_server_looks" ("serverId" varchar PRIMARY KEY NOT NULL, "names" text NOT NULL, "changedAt" integer, "wasCount" integer, "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')))',
    );
    await queryRunner.query(
      'CREATE TABLE "run_handoffs" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "toAgentId" varchar NOT NULL, "stopReason" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar)',
    );
    await queryRunner.query('CREATE INDEX "IDX_503cb5169ad98f938167fbffb1" ON "run_handoffs" ("stepId") ');
    await queryRunner.query(
      'CREATE TABLE "runs" ("id" varchar PRIMARY KEY NOT NULL, "directory" varchar NOT NULL, "startedByAgentId" varchar NOT NULL, "startedByAgentName" varchar NOT NULL, "startedByAgentColor" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')))',
    );
    await queryRunner.query('CREATE INDEX "IDX_ae857110534ca2ea2030dd23be" ON "runs" ("directory") ');
    await queryRunner.query(
      'CREATE TABLE "run_questions" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "asked" text NOT NULL, "askedAt" datetime NOT NULL, "askedAgentId" varchar, "askedAgentName" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar)',
    );
    await queryRunner.query('CREATE INDEX "IDX_d6362a6951182a1457278e4e44" ON "run_questions" ("runId") ');
    await queryRunner.query(
      'CREATE TABLE "run_step_agents" ("id" varchar PRIMARY KEY NOT NULL, "agentId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_b95c266b940dc60fa2d93c423a" UNIQUE ("stepId"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_b95c266b940dc60fa2d93c423a" ON "run_step_agents" ("stepId") ');
    await queryRunner.query(
      'CREATE TABLE "run_step_models" ("id" varchar PRIMARY KEY NOT NULL, "modelId" varchar NOT NULL, "title" varchar NOT NULL, "providerId" varchar NOT NULL, "inputPrice" float, "outputPrice" float, "contextCeiling" integer, "answerCeiling" integer, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_fc7b06d0a8855678193a348747" UNIQUE ("stepId"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_fc7b06d0a8855678193a348747" ON "run_step_models" ("stepId") ');
    await queryRunner.query(
      'CREATE TABLE "run_step_settings" ("id" varchar PRIMARY KEY NOT NULL, "promptId" varchar, "prompt" text NOT NULL, "temperature" float, "maxCalls" integer, "memoryLength" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_f078fa3ee6872cc45392ebf230" UNIQUE ("stepId"))',
    );
    await queryRunner.query('CREATE INDEX "IDX_f078fa3ee6872cc45392ebf230" ON "run_step_settings" ("stepId") ');
    await queryRunner.query(
      'CREATE TABLE "run_step_feeds" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, "fromId" varchar)',
    );
    await queryRunner.query('CREATE INDEX "IDX_6be615901fab9c96fdf02a30d1" ON "run_step_feeds" ("stepId") ');
    await queryRunner.query('CREATE INDEX "IDX_76df172e90320c34210fc2cb2d" ON "run_step_feeds" ("fromId") ');
    await queryRunner.query(
      'CREATE TABLE "run_steps" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "walkId" varchar NOT NULL, "asked" text NOT NULL, "said" text NOT NULL, "state" varchar NOT NULL, "inputTokens" integer NOT NULL, "outputTokens" integer NOT NULL, "money" float, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar, "questionId" varchar)',
    );
    await queryRunner.query('CREATE INDEX "IDX_a7151a8ecac7a6aab97019ce51" ON "run_steps" ("runId") ');
    await queryRunner.query('CREATE INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7" ON "run_steps" ("questionId") ');
    await queryRunner.query(
      'CREATE TABLE "run_calls" ("id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "place" integer NOT NULL, "name" varchar NOT NULL, "arguments" text NOT NULL, "pinned" text NOT NULL, "line" text NOT NULL, "output" text NOT NULL, "refusal" text NOT NULL, "exitCode" integer, "serverId" varchar, "serverName" varchar, "end" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar)',
    );
    await queryRunner.query('CREATE INDEX "IDX_a272800cd4cd6b0ea2262db21e" ON "run_calls" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_503cb5169ad98f938167fbffb1"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_handoffs" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "toAgentId" varchar NOT NULL, "stopReason" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "FK_503cb5169ad98f938167fbffb11" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_handoffs"("id", "place", "toAgentId", "stopReason", "createdAt", "updatedAt", "stepId") SELECT "id", "place", "toAgentId", "stopReason", "createdAt", "updatedAt", "stepId" FROM "run_handoffs"',
    );
    await queryRunner.query('DROP TABLE "run_handoffs"');
    await queryRunner.query('ALTER TABLE "temporary_run_handoffs" RENAME TO "run_handoffs"');
    await queryRunner.query('CREATE INDEX "IDX_503cb5169ad98f938167fbffb1" ON "run_handoffs" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_d6362a6951182a1457278e4e44"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_questions" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "asked" text NOT NULL, "askedAt" datetime NOT NULL, "askedAgentId" varchar, "askedAgentName" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar, CONSTRAINT "FK_d6362a6951182a1457278e4e443" FOREIGN KEY ("runId") REFERENCES "runs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_questions"("id", "place", "asked", "askedAt", "askedAgentId", "askedAgentName", "createdAt", "updatedAt", "runId") SELECT "id", "place", "asked", "askedAt", "askedAgentId", "askedAgentName", "createdAt", "updatedAt", "runId" FROM "run_questions"',
    );
    await queryRunner.query('DROP TABLE "run_questions"');
    await queryRunner.query('ALTER TABLE "temporary_run_questions" RENAME TO "run_questions"');
    await queryRunner.query('CREATE INDEX "IDX_d6362a6951182a1457278e4e44" ON "run_questions" ("runId") ');
    await queryRunner.query('DROP INDEX "IDX_b95c266b940dc60fa2d93c423a"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_step_agents" ("id" varchar PRIMARY KEY NOT NULL, "agentId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_b95c266b940dc60fa2d93c423a" UNIQUE ("stepId"), CONSTRAINT "FK_b95c266b940dc60fa2d93c423a0" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_step_agents"("id", "agentId", "name", "color", "createdAt", "updatedAt", "stepId") SELECT "id", "agentId", "name", "color", "createdAt", "updatedAt", "stepId" FROM "run_step_agents"',
    );
    await queryRunner.query('DROP TABLE "run_step_agents"');
    await queryRunner.query('ALTER TABLE "temporary_run_step_agents" RENAME TO "run_step_agents"');
    await queryRunner.query('CREATE INDEX "IDX_b95c266b940dc60fa2d93c423a" ON "run_step_agents" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_fc7b06d0a8855678193a348747"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_step_models" ("id" varchar PRIMARY KEY NOT NULL, "modelId" varchar NOT NULL, "title" varchar NOT NULL, "providerId" varchar NOT NULL, "inputPrice" float, "outputPrice" float, "contextCeiling" integer, "answerCeiling" integer, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_fc7b06d0a8855678193a348747" UNIQUE ("stepId"), CONSTRAINT "FK_fc7b06d0a8855678193a3487472" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_step_models"("id", "modelId", "title", "providerId", "inputPrice", "outputPrice", "contextCeiling", "answerCeiling", "createdAt", "updatedAt", "stepId") SELECT "id", "modelId", "title", "providerId", "inputPrice", "outputPrice", "contextCeiling", "answerCeiling", "createdAt", "updatedAt", "stepId" FROM "run_step_models"',
    );
    await queryRunner.query('DROP TABLE "run_step_models"');
    await queryRunner.query('ALTER TABLE "temporary_run_step_models" RENAME TO "run_step_models"');
    await queryRunner.query('CREATE INDEX "IDX_fc7b06d0a8855678193a348747" ON "run_step_models" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_f078fa3ee6872cc45392ebf230"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_step_settings" ("id" varchar PRIMARY KEY NOT NULL, "promptId" varchar, "prompt" text NOT NULL, "temperature" float, "maxCalls" integer, "memoryLength" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_f078fa3ee6872cc45392ebf230" UNIQUE ("stepId"), CONSTRAINT "FK_f078fa3ee6872cc45392ebf2302" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_step_settings"("id", "promptId", "prompt", "temperature", "maxCalls", "memoryLength", "createdAt", "updatedAt", "stepId") SELECT "id", "promptId", "prompt", "temperature", "maxCalls", "memoryLength", "createdAt", "updatedAt", "stepId" FROM "run_step_settings"',
    );
    await queryRunner.query('DROP TABLE "run_step_settings"');
    await queryRunner.query('ALTER TABLE "temporary_run_step_settings" RENAME TO "run_step_settings"');
    await queryRunner.query('CREATE INDEX "IDX_f078fa3ee6872cc45392ebf230" ON "run_step_settings" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_6be615901fab9c96fdf02a30d1"');
    await queryRunner.query('DROP INDEX "IDX_76df172e90320c34210fc2cb2d"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_step_feeds" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, "fromId" varchar, CONSTRAINT "FK_6be615901fab9c96fdf02a30d19" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_76df172e90320c34210fc2cb2dc" FOREIGN KEY ("fromId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_step_feeds"("id", "place", "createdAt", "updatedAt", "stepId", "fromId") SELECT "id", "place", "createdAt", "updatedAt", "stepId", "fromId" FROM "run_step_feeds"',
    );
    await queryRunner.query('DROP TABLE "run_step_feeds"');
    await queryRunner.query('ALTER TABLE "temporary_run_step_feeds" RENAME TO "run_step_feeds"');
    await queryRunner.query('CREATE INDEX "IDX_6be615901fab9c96fdf02a30d1" ON "run_step_feeds" ("stepId") ');
    await queryRunner.query('CREATE INDEX "IDX_76df172e90320c34210fc2cb2d" ON "run_step_feeds" ("fromId") ');
    await queryRunner.query('DROP INDEX "IDX_a7151a8ecac7a6aab97019ce51"');
    await queryRunner.query('DROP INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_steps" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "walkId" varchar NOT NULL, "asked" text NOT NULL, "said" text NOT NULL, "state" varchar NOT NULL, "inputTokens" integer NOT NULL, "outputTokens" integer NOT NULL, "money" float, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar, "questionId" varchar, CONSTRAINT "FK_a7151a8ecac7a6aab97019ce518" FOREIGN KEY ("runId") REFERENCES "runs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_0d0c3758c0c7b7c5000c25e5d77" FOREIGN KEY ("questionId") REFERENCES "run_questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_steps"("id", "place", "walkId", "asked", "said", "state", "inputTokens", "outputTokens", "money", "startedAt", "endedAt", "createdAt", "updatedAt", "runId", "questionId") SELECT "id", "place", "walkId", "asked", "said", "state", "inputTokens", "outputTokens", "money", "startedAt", "endedAt", "createdAt", "updatedAt", "runId", "questionId" FROM "run_steps"',
    );
    await queryRunner.query('DROP TABLE "run_steps"');
    await queryRunner.query('ALTER TABLE "temporary_run_steps" RENAME TO "run_steps"');
    await queryRunner.query('CREATE INDEX "IDX_a7151a8ecac7a6aab97019ce51" ON "run_steps" ("runId") ');
    await queryRunner.query('CREATE INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7" ON "run_steps" ("questionId") ');
    await queryRunner.query('DROP INDEX "IDX_a272800cd4cd6b0ea2262db21e"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_calls" ("id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "place" integer NOT NULL, "name" varchar NOT NULL, "arguments" text NOT NULL, "pinned" text NOT NULL, "line" text NOT NULL, "output" text NOT NULL, "refusal" text NOT NULL, "exitCode" integer, "serverId" varchar, "serverName" varchar, "end" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "FK_a272800cd4cd6b0ea2262db21e3" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_calls"("id", "source", "place", "name", "arguments", "pinned", "line", "output", "refusal", "exitCode", "serverId", "serverName", "end", "startedAt", "endedAt", "createdAt", "updatedAt", "stepId") SELECT "id", "source", "place", "name", "arguments", "pinned", "line", "output", "refusal", "exitCode", "serverId", "serverName", "end", "startedAt", "endedAt", "createdAt", "updatedAt", "stepId" FROM "run_calls"',
    );
    await queryRunner.query('DROP TABLE "run_calls"');
    await queryRunner.query('ALTER TABLE "temporary_run_calls" RENAME TO "run_calls"');
    await queryRunner.query('CREATE INDEX "IDX_a272800cd4cd6b0ea2262db21e" ON "run_calls" ("stepId") ');
    await queryRunner.query(
      'CREATE TABLE "run_question_attachments" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "path" text NOT NULL, "name" varchar NOT NULL, "kind" varchar NOT NULL, "text" text NOT NULL, "binaries" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "questionId" varchar, CONSTRAINT "FK_27e55be18041d68addb473e5345" FOREIGN KEY ("questionId") REFERENCES "run_questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_27e55be18041d68addb473e534" ON "run_question_attachments" ("questionId") ',
    );
    await queryRunner.query(
      'CREATE TABLE "run_memories" ("id" varchar PRIMARY KEY NOT NULL, "agentId" varchar NOT NULL, "coversPlace" integer NOT NULL, "text" text NOT NULL, "lengthBefore" integer NOT NULL, "lengthAfter" integer NOT NULL, "compressAt" integer NOT NULL, "compressTo" integer NOT NULL, "inputTokens" integer NOT NULL, "outputTokens" integer NOT NULL, "money" float, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar, "questionId" varchar, "stepId" varchar, CONSTRAINT "FK_48943a80562423f216988372a99" FOREIGN KEY ("runId") REFERENCES "runs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ed6fe8cdbc0593e9d34e6ddd142" FOREIGN KEY ("questionId") REFERENCES "run_questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_926120e9297f9fd01eef7949368" FOREIGN KEY ("stepId") REFERENCES "run_steps" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query('CREATE INDEX "IDX_48943a80562423f216988372a9" ON "run_memories" ("runId") ');
    await queryRunner.query('CREATE INDEX "IDX_ed6fe8cdbc0593e9d34e6ddd14" ON "run_memories" ("questionId") ');
    await queryRunner.query('CREATE INDEX "IDX_926120e9297f9fd01eef794936" ON "run_memories" ("stepId") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_926120e9297f9fd01eef794936"');
    await queryRunner.query('DROP INDEX "IDX_ed6fe8cdbc0593e9d34e6ddd14"');
    await queryRunner.query('DROP INDEX "IDX_48943a80562423f216988372a9"');
    await queryRunner.query('DROP TABLE "run_memories"');
    await queryRunner.query('DROP INDEX "IDX_27e55be18041d68addb473e534"');
    await queryRunner.query('DROP TABLE "run_question_attachments"');
    await queryRunner.query('DROP INDEX "IDX_a272800cd4cd6b0ea2262db21e"');
    await queryRunner.query('ALTER TABLE "run_calls" RENAME TO "temporary_run_calls"');
    await queryRunner.query(
      'CREATE TABLE "run_calls" ("id" varchar PRIMARY KEY NOT NULL, "source" varchar NOT NULL, "place" integer NOT NULL, "name" varchar NOT NULL, "arguments" text NOT NULL, "pinned" text NOT NULL, "line" text NOT NULL, "output" text NOT NULL, "refusal" text NOT NULL, "exitCode" integer, "serverId" varchar, "serverName" varchar, "end" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_calls"("id", "source", "place", "name", "arguments", "pinned", "line", "output", "refusal", "exitCode", "serverId", "serverName", "end", "startedAt", "endedAt", "createdAt", "updatedAt", "stepId") SELECT "id", "source", "place", "name", "arguments", "pinned", "line", "output", "refusal", "exitCode", "serverId", "serverName", "end", "startedAt", "endedAt", "createdAt", "updatedAt", "stepId" FROM "temporary_run_calls"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_calls"');
    await queryRunner.query('CREATE INDEX "IDX_a272800cd4cd6b0ea2262db21e" ON "run_calls" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7"');
    await queryRunner.query('DROP INDEX "IDX_a7151a8ecac7a6aab97019ce51"');
    await queryRunner.query('ALTER TABLE "run_steps" RENAME TO "temporary_run_steps"');
    await queryRunner.query(
      'CREATE TABLE "run_steps" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "walkId" varchar NOT NULL, "asked" text NOT NULL, "said" text NOT NULL, "state" varchar NOT NULL, "inputTokens" integer NOT NULL, "outputTokens" integer NOT NULL, "money" float, "startedAt" datetime NOT NULL, "endedAt" datetime NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar, "questionId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_steps"("id", "place", "walkId", "asked", "said", "state", "inputTokens", "outputTokens", "money", "startedAt", "endedAt", "createdAt", "updatedAt", "runId", "questionId") SELECT "id", "place", "walkId", "asked", "said", "state", "inputTokens", "outputTokens", "money", "startedAt", "endedAt", "createdAt", "updatedAt", "runId", "questionId" FROM "temporary_run_steps"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_steps"');
    await queryRunner.query('CREATE INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7" ON "run_steps" ("questionId") ');
    await queryRunner.query('CREATE INDEX "IDX_a7151a8ecac7a6aab97019ce51" ON "run_steps" ("runId") ');
    await queryRunner.query('DROP INDEX "IDX_76df172e90320c34210fc2cb2d"');
    await queryRunner.query('DROP INDEX "IDX_6be615901fab9c96fdf02a30d1"');
    await queryRunner.query('ALTER TABLE "run_step_feeds" RENAME TO "temporary_run_step_feeds"');
    await queryRunner.query(
      'CREATE TABLE "run_step_feeds" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, "fromId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_step_feeds"("id", "place", "createdAt", "updatedAt", "stepId", "fromId") SELECT "id", "place", "createdAt", "updatedAt", "stepId", "fromId" FROM "temporary_run_step_feeds"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_step_feeds"');
    await queryRunner.query('CREATE INDEX "IDX_76df172e90320c34210fc2cb2d" ON "run_step_feeds" ("fromId") ');
    await queryRunner.query('CREATE INDEX "IDX_6be615901fab9c96fdf02a30d1" ON "run_step_feeds" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_f078fa3ee6872cc45392ebf230"');
    await queryRunner.query('ALTER TABLE "run_step_settings" RENAME TO "temporary_run_step_settings"');
    await queryRunner.query(
      'CREATE TABLE "run_step_settings" ("id" varchar PRIMARY KEY NOT NULL, "promptId" varchar, "prompt" text NOT NULL, "temperature" float, "maxCalls" integer, "memoryLength" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_f078fa3ee6872cc45392ebf230" UNIQUE ("stepId"))',
    );
    await queryRunner.query(
      'INSERT INTO "run_step_settings"("id", "promptId", "prompt", "temperature", "maxCalls", "memoryLength", "createdAt", "updatedAt", "stepId") SELECT "id", "promptId", "prompt", "temperature", "maxCalls", "memoryLength", "createdAt", "updatedAt", "stepId" FROM "temporary_run_step_settings"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_step_settings"');
    await queryRunner.query('CREATE INDEX "IDX_f078fa3ee6872cc45392ebf230" ON "run_step_settings" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_fc7b06d0a8855678193a348747"');
    await queryRunner.query('ALTER TABLE "run_step_models" RENAME TO "temporary_run_step_models"');
    await queryRunner.query(
      'CREATE TABLE "run_step_models" ("id" varchar PRIMARY KEY NOT NULL, "modelId" varchar NOT NULL, "title" varchar NOT NULL, "providerId" varchar NOT NULL, "inputPrice" float, "outputPrice" float, "contextCeiling" integer, "answerCeiling" integer, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_fc7b06d0a8855678193a348747" UNIQUE ("stepId"))',
    );
    await queryRunner.query(
      'INSERT INTO "run_step_models"("id", "modelId", "title", "providerId", "inputPrice", "outputPrice", "contextCeiling", "answerCeiling", "createdAt", "updatedAt", "stepId") SELECT "id", "modelId", "title", "providerId", "inputPrice", "outputPrice", "contextCeiling", "answerCeiling", "createdAt", "updatedAt", "stepId" FROM "temporary_run_step_models"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_step_models"');
    await queryRunner.query('CREATE INDEX "IDX_fc7b06d0a8855678193a348747" ON "run_step_models" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_b95c266b940dc60fa2d93c423a"');
    await queryRunner.query('ALTER TABLE "run_step_agents" RENAME TO "temporary_run_step_agents"');
    await queryRunner.query(
      'CREATE TABLE "run_step_agents" ("id" varchar PRIMARY KEY NOT NULL, "agentId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar, CONSTRAINT "REL_b95c266b940dc60fa2d93c423a" UNIQUE ("stepId"))',
    );
    await queryRunner.query(
      'INSERT INTO "run_step_agents"("id", "agentId", "name", "color", "createdAt", "updatedAt", "stepId") SELECT "id", "agentId", "name", "color", "createdAt", "updatedAt", "stepId" FROM "temporary_run_step_agents"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_step_agents"');
    await queryRunner.query('CREATE INDEX "IDX_b95c266b940dc60fa2d93c423a" ON "run_step_agents" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_d6362a6951182a1457278e4e44"');
    await queryRunner.query('ALTER TABLE "run_questions" RENAME TO "temporary_run_questions"');
    await queryRunner.query(
      'CREATE TABLE "run_questions" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "asked" text NOT NULL, "askedAt" datetime NOT NULL, "askedAgentId" varchar, "askedAgentName" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "runId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_questions"("id", "place", "asked", "askedAt", "askedAgentId", "askedAgentName", "createdAt", "updatedAt", "runId") SELECT "id", "place", "asked", "askedAt", "askedAgentId", "askedAgentName", "createdAt", "updatedAt", "runId" FROM "temporary_run_questions"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_questions"');
    await queryRunner.query('CREATE INDEX "IDX_d6362a6951182a1457278e4e44" ON "run_questions" ("runId") ');
    await queryRunner.query('DROP INDEX "IDX_503cb5169ad98f938167fbffb1"');
    await queryRunner.query('ALTER TABLE "run_handoffs" RENAME TO "temporary_run_handoffs"');
    await queryRunner.query(
      'CREATE TABLE "run_handoffs" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "toAgentId" varchar NOT NULL, "stopReason" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "stepId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_handoffs"("id", "place", "toAgentId", "stopReason", "createdAt", "updatedAt", "stepId") SELECT "id", "place", "toAgentId", "stopReason", "createdAt", "updatedAt", "stepId" FROM "temporary_run_handoffs"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_handoffs"');
    await queryRunner.query('CREATE INDEX "IDX_503cb5169ad98f938167fbffb1" ON "run_handoffs" ("stepId") ');
    await queryRunner.query('DROP INDEX "IDX_a272800cd4cd6b0ea2262db21e"');
    await queryRunner.query('DROP TABLE "run_calls"');
    await queryRunner.query('DROP INDEX "IDX_0d0c3758c0c7b7c5000c25e5d7"');
    await queryRunner.query('DROP INDEX "IDX_a7151a8ecac7a6aab97019ce51"');
    await queryRunner.query('DROP TABLE "run_steps"');
    await queryRunner.query('DROP INDEX "IDX_76df172e90320c34210fc2cb2d"');
    await queryRunner.query('DROP INDEX "IDX_6be615901fab9c96fdf02a30d1"');
    await queryRunner.query('DROP TABLE "run_step_feeds"');
    await queryRunner.query('DROP INDEX "IDX_f078fa3ee6872cc45392ebf230"');
    await queryRunner.query('DROP TABLE "run_step_settings"');
    await queryRunner.query('DROP INDEX "IDX_fc7b06d0a8855678193a348747"');
    await queryRunner.query('DROP TABLE "run_step_models"');
    await queryRunner.query('DROP INDEX "IDX_b95c266b940dc60fa2d93c423a"');
    await queryRunner.query('DROP TABLE "run_step_agents"');
    await queryRunner.query('DROP INDEX "IDX_d6362a6951182a1457278e4e44"');
    await queryRunner.query('DROP TABLE "run_questions"');
    await queryRunner.query('DROP INDEX "IDX_ae857110534ca2ea2030dd23be"');
    await queryRunner.query('DROP TABLE "runs"');
    await queryRunner.query('DROP INDEX "IDX_503cb5169ad98f938167fbffb1"');
    await queryRunner.query('DROP TABLE "run_handoffs"');
    await queryRunner.query('DROP TABLE "mcp_server_looks"');
    await queryRunner.query('DROP TABLE "mcp_dropped_servers"');
    await queryRunner.query('DROP TABLE "deletions"');
    await queryRunner.query('DROP TABLE "project_entries"');
  }
}
