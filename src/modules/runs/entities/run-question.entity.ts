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
import { RunStepEntity } from "./run-step.entity";
import type { RunQuestionRecord } from "../interfaces";

/** The `run_questions` table row — one thing the person asked; a flow is asked more than once. */
@Entity(RUN_QUESTION_TABLE_NAME)
export class RunQuestionEntity implements RunQuestionRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Which question of the flow this is, from one; the row of the history is named by the last of them.
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

  /**
   * Whom this question was put to, written the moment it was asked — the head of the row is named by it
   * before a single step has landed. Null on a question the record kept before the addressee was written down.
   */
  @Column({
    type: "varchar",
    nullable: true,
  })
  declare askedAgentId: string | null;

  /** What that agent was called then; today's name wins, and this stands for an agent that is gone. */
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

  /** The turns this question set walking; a question that reached nobody has none. */
  @OneToMany(() => RunStepEntity, (step) => step.question)
  declare steps: RunStepEntity[];
}
