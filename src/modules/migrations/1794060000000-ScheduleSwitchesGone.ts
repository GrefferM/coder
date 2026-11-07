import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleSwitchesGone1794060000000 implements MigrationInterface {
  name = "ScheduleSwitchesGone1794060000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "schedule_switches"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "schedule_switches" ("scheduleId" varchar PRIMARY KEY NOT NULL, "switchedOnAt" integer NOT NULL)',
    );
  }
}
