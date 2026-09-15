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
import { RUN_STEP_AGENT_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunStepAgentRecord } from "../interfaces";

/** The `run_step_agents` table row — who the turn was, as they stood the moment it ran; one per step. */
@Entity(RUN_STEP_AGENT_TABLE_NAME)
export class RunStepAgentEntity implements RunStepAgentRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({
    type: "varchar",
  })
  declare agentId: string;

  @Column({
    type: "varchar",
  })
  declare name: string;

  @Column({
    type: "varchar",
  })
  declare color: string;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @OneToOne(() => RunStepEntity, (step) => step.who, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
