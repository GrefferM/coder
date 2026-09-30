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
import { RUN_HANDOFF_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunHandoffRecord } from "../interfaces";

/** A row of `run_handoffs`: one link out of a step, with why it was not taken if it was not. */
@Entity(RUN_HANDOFF_TABLE_NAME)
export class RunHandoffEntity implements RunHandoffRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Position among the agent's outgoing links, from one, in drawing order.
  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "varchar",
  })
  declare toAgentId: string;

  /** Why the link was not taken (agent off or busy); null where the work went through. */
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare stopReason: string | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunStepEntity, (step) => step.handoffs, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
