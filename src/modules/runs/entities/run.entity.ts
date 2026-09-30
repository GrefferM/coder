import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RUN_TABLE_NAME } from "../constants";
import { RunQuestionEntity } from "./run-question.entity";
import { RunStepEntity } from "./run-step.entity";
import type { RunRecord } from "../interfaces";

/** A row of `runs`: one walk of the drawn line, from the question to its last step. */
@Entity(RUN_TABLE_NAME)
export class RunEntity implements RunRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Absolute path of the project folder on this machine; a run belongs to the machine.
  @Index()
  @Column({
    type: "varchar",
  })
  declare directory: string;

  @Column({
    type: "varchar",
  })
  declare startedByAgentId: string;

  /** The agent's name and colour when the run began, so the row stays named after the agent is gone. */
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

  /** Everything the person asked in this flow, in order. */
  @OneToMany(() => RunQuestionEntity, (question) => question.run)
  declare questions: RunQuestionEntity[];
}
