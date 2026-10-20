import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RUN_QUESTION_TABLE_NAME } from "../constants";
import { RunEntity } from "./run.entity";
import { RunMemoryEntity } from "./run-memory.entity";
import { RunQuestionAttachmentEntity } from "./run-question-attachment.entity";
import { RunStepEntity } from "./run-step.entity";
import type { RunQuestionRecord } from "../interfaces";

/** A row of `run_questions`: one thing the person asked; a flow may have several. */
@Entity(RUN_QUESTION_TABLE_NAME)
export class RunQuestionEntity implements RunQuestionRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Which question of the flow this is, from one; the last names the history row.
  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "text",
  })
  declare asked: string;

  @Column({
    type: "datetime",
  })
  declare askedAt: Date;

  /** Whom this question was put to, written when it was asked; null on older records. */
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare askedAgentId: string | null;

  /** The agent's name then; today's name wins, this covers a gone agent. */
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare askedAgentName: string | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunEntity, (run) => run.questions, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare run: RunEntity;

  /** The turns this question started; none if it reached nobody. */
  @OneToMany(() => RunStepEntity, (step) => step.question)
  declare steps: RunStepEntity[];

  /** The files and folders sent with it; none for words alone. */
  @OneToMany(() => RunQuestionAttachmentEntity, (attachment) => attachment.question)
  declare attachments: RunQuestionAttachmentEntity[];

  /** The compressions of the shared memory of this question. */
  @OneToMany(() => RunMemoryEntity, (memory) => memory.question)
  declare memories: RunMemoryEntity[];
}
