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

/** The `run_handoffs` table row — one link out of a step: whom to, and why it did not go if it did not. */
@Entity(RUN_HANDOFF_TABLE_NAME)
export class RunHandoffEntity implements RunHandoffRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Where this link stands among the ones out of the agent, from one; the order they were drawn.
  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "varchar",
  })
  declare toAgentId: string;

  /** Why the link was not taken — the agent was off or busy; null where the work went through. */
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
