import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RUN_MEMORY_TABLE_NAME } from "../constants";
import { RunQuestionEntity } from "./run-question.entity";
import { RunStepEntity } from "./run-step.entity";
import { RunEntity } from "./run.entity";
import type { RunMemoryRecord } from "../interfaces";

/**
 * A row of `run_memories`: the message the composer wrote for one agent's memory, read by the model in place of every
 * step up to `coversPlace`. The steps stay as they were; one row per step that paid for a compression.
 */
@Entity(RUN_MEMORY_TABLE_NAME)
export class RunMemoryEntity implements RunMemoryRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  /** Whose memory it is. */
  @Column({
    type: "varchar",
  })
  declare agentId: string;

  /** The place of the last step the text stands for; the steps after it are read as they stand. */
  @Column({
    type: "integer",
  })
  declare coversPlace: number;

  @Column({
    type: "text",
  })
  declare text: string;

  /** Characters of memory before the composer read it, and of what it wrote. */
  @Column({
    type: "integer",
  })
  declare lengthBefore: number;

  @Column({
    type: "integer",
  })
  declare lengthAfter: number;

  /** The agent's threshold and target then, in percent of the model's ceiling. */
  @Column({
    type: "integer",
  })
  declare compressAt: number;

  @Column({
    type: "integer",
  })
  declare compressTo: number;

  @Column({
    type: "integer",
  })
  declare inputTokens: number;

  @Column({
    type: "integer",
  })
  declare outputTokens: number;

  /** What the composer's call cost at its model's prices then; empty where they cannot be said. */
  @Column({
    type: "float",
    nullable: true,
  })
  declare money: number | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunEntity, (run) => run.memories, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare run: RunEntity;

  /** The question a shared memory belongs to; none for an agent's own thread in the conversation. */
  @Index()
  @ManyToOne(() => RunQuestionEntity, (question) => question.memories, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare question: RunQuestionEntity | null;

  /** The step whose turn paid for this compression. */
  @Index()
  @OneToOne(() => RunStepEntity, (step) => step.composed, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare step: RunStepEntity;
}
