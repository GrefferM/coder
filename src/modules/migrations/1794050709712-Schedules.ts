import { MigrationInterface, QueryRunner } from "typeorm";

export class Schedules1794050709712 implements MigrationInterface {
  name = "Schedules1794050709712";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "schedule_switches" ("scheduleId" varchar PRIMARY KEY NOT NULL, "switchedOnAt" integer NOT NULL)',
    );
    await queryRunner.query('DROP INDEX "IDX_ae857110534ca2ea2030dd23be"');
    await queryRunner.query(
      'CREATE TABLE "temporary_runs" ("id" varchar PRIMARY KEY NOT NULL, "directory" varchar NOT NULL, "startedByAgentId" varchar NOT NULL, "startedByAgentName" varchar NOT NULL, "startedByAgentColor" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "startedByScheduleId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_runs"("id", "directory", "startedByAgentId", "startedByAgentName", "startedByAgentColor", "startedAt", "endedAt", "createdAt", "updatedAt") SELECT "id", "directory", "startedByAgentId", "startedByAgentName", "startedByAgentColor", "startedAt", "endedAt", "createdAt", "updatedAt" FROM "runs"',
    );
    await queryRunner.query('DROP TABLE "runs"');
    await queryRunner.query('ALTER TABLE "temporary_runs" RENAME TO "runs"');
    await queryRunner.query('CREATE INDEX "IDX_ae857110534ca2ea2030dd23be" ON "runs" ("directory") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_ae857110534ca2ea2030dd23be"');
    await queryRunner.query('ALTER TABLE "runs" RENAME TO "temporary_runs"');
    await queryRunner.query(
      'CREATE TABLE "runs" ("id" varchar PRIMARY KEY NOT NULL, "directory" varchar NOT NULL, "startedByAgentId" varchar NOT NULL, "startedByAgentName" varchar NOT NULL, "startedByAgentColor" varchar NOT NULL, "startedAt" datetime NOT NULL, "endedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')))',
    );
    await queryRunner.query(
      'INSERT INTO "runs"("id", "directory", "startedByAgentId", "startedByAgentName", "startedByAgentColor", "startedAt", "endedAt", "createdAt", "updatedAt") SELECT "id", "directory", "startedByAgentId", "startedByAgentName", "startedByAgentColor", "startedAt", "endedAt", "createdAt", "updatedAt" FROM "temporary_runs"',
    );
    await queryRunner.query('DROP TABLE "temporary_runs"');
    await queryRunner.query('CREATE INDEX "IDX_ae857110534ca2ea2030dd23be" ON "runs" ("directory") ');
    await queryRunner.query('DROP TABLE "schedule_switches"');
  }
}
