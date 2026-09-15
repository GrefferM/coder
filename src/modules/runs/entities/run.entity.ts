import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RUN_TABLE_NAME } from "../constants";
import { RunQuestionEntity } from "./run-question.entity";
import { RunStepEntity } from "./run-step.entity";
import type { RunRecord } from "../interfaces";

/** The `runs` table row — one walk of the drawn line, from the person's question to its last step. */
@Entity(RUN_TABLE_NAME)
export class RunEntity implements RunRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Absolute path of the project's folder on this machine: a run belongs to the machine, not the folder.
  @Index()
  @Column({
    type: "varchar",
  })
  declare directory: string;

  @Column({
    type: "varchar",
  })
  declare startedByAgentId: string;

  /**
   * The name and colour that agent had when the run began — kept here, so the row is named from the
   * moment the question is written and goes on being named after the agent is gone.
   */
  @Column({
    type: "varchar",
  })
  declare startedByAgentName: string;

  @Column({
    type: "varchar",
  })
  declare startedByAgentColor: string;

  @Column({
    type: "datetime",
  })
  declare startedAt: Date;

  @Column({
    type: "datetime",
    nullable: true,
  })
  declare endedAt: Date | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @OneToMany(() => RunStepEntity, (step) => step.run)
  declare steps: RunStepEntity[];

  /** Everything the person asked in this flow, in the order they asked it. */
  @OneToMany(() => RunQuestionEntity, (question) => question.run)
  declare questions: RunQuestionEntity[];
}
