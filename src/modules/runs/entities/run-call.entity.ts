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
import { RUN_CALL_TABLE_NAME } from "../constants";
import { RunStepEntity } from "./run-step.entity";
import type { RunCallRecord } from "../interfaces";

/** The `run_calls` table row — one call inside a step, whichever end it came to. */
@Entity(RUN_CALL_TABLE_NAME)
export class RunCallEntity implements RunCallRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "varchar",
  })
  declare name: string;

  // What the model sent, as JSON, with the pinned values already in it.
  @Column({
    type: "text",
  })
  declare arguments: string;

  // Which of those the person pinned, as JSON — without it a call read back cannot tell a value somebody
  // fixed from one the model chose.
  @Column({
    type: "text",
  })
  declare pinned: string;

  @Column({
    type: "text",
  })
  declare line: string;

  @Column({
    type: "text",
  })
  declare output: string;

  // The words the check said when it refused the call; empty for a call that ran.
  @Column({
    type: "text",
  })
  declare refusal: string;

  // No process, no code: a refused or stopped call has none, and the card draws that absence.
  @Column({
    type: "integer",
    nullable: true,
  })
  declare exitCode: number | null;

  // Which server the call went to, and its name then; a command's call has neither.
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare serverId: string | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  declare serverName: string | null;

  @Column({
    type: "varchar",
  })
  declare end: string;

  @Column({
    type: "datetime",
  })
  declare startedAt: Date;

  @Column({
    type: "datetime",
  })
  declare endedAt: Date;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunStepEntity, (step) => step.calls, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
