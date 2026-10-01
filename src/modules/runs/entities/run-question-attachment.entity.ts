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
import { RUN_QUESTION_ATTACHMENT_TABLE_NAME } from "../constants";
import { RunQuestionEntity } from "./run-question.entity";
import type { RunQuestionAttachmentRecord } from "../interfaces";

/** A row of `run_question_attachments`: one file or folder sent with a question, packed as it went. */
@Entity(RUN_QUESTION_ATTACHMENT_TABLE_NAME)
export class RunQuestionAttachmentEntity implements RunQuestionAttachmentRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Position among the question's attachments, from one, in the order they were glued in.
  @Column({
    type: "integer",
  })
  declare place: number;

  /** The path the person picked, as they picked it. */
  @Column({
    type: "text",
  })
  declare path: string;

  @Column({
    type: "varchar",
  })
  declare name: string;

  @Column({
    type: "varchar",
  })
  declare kind: string;

  /** The packed block that went into the question. */
  @Column({
    type: "text",
  })
  declare text: string;

  @Column({
    type: "text",
  })
  declare binaries: string;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @Index()
  @ManyToOne(() => RunQuestionEntity, (question) => question.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare question: RunQuestionEntity;
}
