import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RUN_STEP_FEED_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunStepFeedRecord } from "../interfaces";

/** A row of `run_step_feeds`: one step's work coming into another; a converging point has several. */
@Entity(RUN_STEP_FEED_TABLE_NAME)
export class RunStepFeedEntity implements RunStepFeedRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Position among the turn's suppliers, from one, in naming order.
  @Column({
    type: "integer",
  })
  declare place: number;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunStepEntity, (step) => step.feeds, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;

  @Index()
  @ManyToOne(() => RunStepEntity, (step) => step.fedInto, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare from: RunStepEntity;
}
