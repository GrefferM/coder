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
import { RUN_QUESTION_RECORDING_TABLE_NAME } from "../constants";
import { RunQuestionEntity } from "./run-question.entity";
import type { RunQuestionRecordingRecord } from "../interfaces";

/** A row of `run_question_recordings`: one recording the person said a question with, its sound beside it. */
@Entity(RUN_QUESTION_RECORDING_TABLE_NAME)
export class RunQuestionRecordingEntity implements RunQuestionRecordingRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Position among the question's recordings, from one, in the order they were made.
  @Column({
    type: "integer",
  })
  declare place: number;

  @Column({
    type: "varchar",
  })
  declare mimeType: string;

  @Column({
    type: "integer",
  })
  declare durationMs: number;

  /** The wave's loudness along the recording, as JSON. */
  @Column({
    type: "text",
  })
  declare peaks: string;

  @Column({
    type: "blob",
    select: false,
  })
  declare sound: Buffer;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunQuestionEntity, (question) => question.recordings, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare question: RunQuestionEntity;
}
