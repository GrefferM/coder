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
import type { ToolSource } from "../../../contracts";

/** A row of `run_calls`: one call inside a step. */
@Entity(RUN_CALL_TABLE_NAME)
export class RunCallEntity implements RunCallRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // What the call went to.
  @Column({
    type: "varchar",
  })
  declare source: ToolSource;

  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "varchar",
  })
  declare name: string;

  // What the model sent, as JSON, pinned values included.
  @Column({
    type: "text",
  })
  declare arguments: string;

  // Which arguments the person pinned, as JSON; tells fixed values from the model's.
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

  // The check's words when it refused the call; empty for a call that ran.
  @Column({
    type: "text",
  })
  declare refusal: string;

  // No process, no code: a refused or stopped call has none.
  @Column({
    type: "integer",
    nullable: true,
  })
  declare exitCode: number | null;

  // The server the call went to and its name then; none for a command's call.
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
