import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RUN_STEP_SETTING_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunStepSettingRecord } from "../interfaces";

/**
 * The `run_step_settings` table row — what the turn ran with: the prompt word for word and the two numbers the person
 * set; one per step.
 */
@Entity(RUN_STEP_SETTING_TABLE_NAME)
export class RunStepSettingEntity implements RunStepSettingRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  /** Which prompt of the library the words were copied from; null where there was none. */
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare promptId: string | null;

  @Column({
    type: "text",
  })
  declare prompt: string;

  /** The two numbers the person set, as they stood then; nothing where the agent carried none. */
  @Column({
    type: "float",
    nullable: true,
  })
  declare temperature: number | null;

  @Column({
    type: "integer",
    nullable: true,
  })
  declare maxCalls: number | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @OneToOne(() => RunStepEntity, (step) => step.given, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
