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

/** The `run_step_feeds` table row — one step's work coming into another; a converging point has several. */
@Entity(RUN_STEP_FEED_TABLE_NAME)
export class RunStepFeedEntity implements RunStepFeedRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Where this supplier stands among the ones the turn was fed by, from one; the order they were named.
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
