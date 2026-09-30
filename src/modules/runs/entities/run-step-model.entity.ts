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
 * A row of `run_step_models`: the model that answered the turn, its provider and its cost per million tokens then; one
 * per step.
 */
@Entity(RUN_STEP_MODEL_TABLE_NAME)
export class RunStepModelEntity implements RunStepModelRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  /** The catalogue model, to compare «then» with «today». */
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

  /** Turn length limit for that model, in characters; none for a step that ran under no model. */
  @Column({
    type: "integer",
    nullable: true,
  })
  declare contextCeiling: number | null;

  /** Tokens the model was allowed to say, as given to the provider. */
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
