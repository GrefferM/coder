import { MigrationInterface, QueryRunner } from "typeorm";

export class QuestionRecordings1793991075893 implements MigrationInterface {
  name = "QuestionRecordings1793991075893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "run_question_recordings" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "mimeType" varchar NOT NULL, "durationMs" integer NOT NULL, "peaks" text NOT NULL, "sound" blob NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "questionId" varchar)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6b9216c30df999b7a622aeaeb5" ON "run_question_recordings" ("questionId") ',
    );
    await queryRunner.query('DROP INDEX "IDX_6b9216c30df999b7a622aeaeb5"');
    await queryRunner.query(
      'CREATE TABLE "temporary_run_question_recordings" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "mimeType" varchar NOT NULL, "durationMs" integer NOT NULL, "peaks" text NOT NULL, "sound" blob NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "questionId" varchar, CONSTRAINT "FK_6b9216c30df999b7a622aeaeb55" FOREIGN KEY ("questionId") REFERENCES "run_questions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_run_question_recordings"("id", "place", "mimeType", "durationMs", "peaks", "sound", "createdAt", "updatedAt", "questionId") SELECT "id", "place", "mimeType", "durationMs", "peaks", "sound", "createdAt", "updatedAt", "questionId" FROM "run_question_recordings"',
    );
    await queryRunner.query('DROP TABLE "run_question_recordings"');
    await queryRunner.query('ALTER TABLE "temporary_run_question_recordings" RENAME TO "run_question_recordings"');
    await queryRunner.query(
      'CREATE INDEX "IDX_6b9216c30df999b7a622aeaeb5" ON "run_question_recordings" ("questionId") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_6b9216c30df999b7a622aeaeb5"');
    await queryRunner.query('ALTER TABLE "run_question_recordings" RENAME TO "temporary_run_question_recordings"');
    await queryRunner.query(
      'CREATE TABLE "run_question_recordings" ("id" varchar PRIMARY KEY NOT NULL, "place" integer NOT NULL, "mimeType" varchar NOT NULL, "durationMs" integer NOT NULL, "peaks" text NOT NULL, "sound" blob NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "updatedAt" datetime NOT NULL DEFAULT (datetime(\'now\')), "questionId" varchar)',
    );
    await queryRunner.query(
      'INSERT INTO "run_question_recordings"("id", "place", "mimeType", "durationMs", "peaks", "sound", "createdAt", "updatedAt", "questionId") SELECT "id", "place", "mimeType", "durationMs", "peaks", "sound", "createdAt", "updatedAt", "questionId" FROM "temporary_run_question_recordings"',
    );
    await queryRunner.query('DROP TABLE "temporary_run_question_recordings"');
    await queryRunner.query(
      'CREATE INDEX "IDX_6b9216c30df999b7a622aeaeb5" ON "run_question_recordings" ("questionId") ',
    );
    await queryRunner.query('DROP INDEX "IDX_6b9216c30df999b7a622aeaeb5"');
    await queryRunner.query('DROP TABLE "run_question_recordings"');
  }
}
