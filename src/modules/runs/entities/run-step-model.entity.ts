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
import { RUN_STEP_MODEL_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunStepModelRecord } from "../interfaces";

/**
 * The `run_step_models` table row — which model answered the turn, whose provider it was, and what a million tokens of
 * it cost then; one per step.
 */
@Entity(RUN_STEP_MODEL_TABLE_NAME)
export class RunStepModelEntity implements RunStepModelRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  /** Which model of the catalogue this was, so «then» can be held against «today». */
  @Column({
    type: "varchar",
  })
  declare modelId: string;

  @Column({
    type: "varchar",
  })
  declare title: string;

  @Column({
    type: "varchar",
  })
  declare providerId: string;

  @Column({
    type: "float",
    nullable: true,
  })
  declare inputPrice: number | null;

  @Column({
    type: "float",
    nullable: true,
  })
  declare outputPrice: number | null;

  /** How long a turn that model took, in characters; a step that ran under none carries nothing. */
  @Column({
    type: "integer",
    nullable: true,
  })
  declare contextCeiling: number | null;

  /** How many tokens that model was allowed to say, as the provider was given it. */
  @Column({
    type: "integer",
    nullable: true,
  })
  declare answerCeiling: number | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @OneToOne(() => RunStepEntity, (step) => step.ran, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
