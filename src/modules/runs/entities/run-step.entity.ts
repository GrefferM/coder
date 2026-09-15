import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RUN_STEP_TABLE_NAME } from "../constants";
import { RunCallEntity } from "./run-call.entity";
import { RunHandoffEntity } from "./run-handoff.entity";
import { RunQuestionEntity } from "./run-question.entity";
import { RunStepAgentEntity } from "./run-step-agent.entity";
import { RunStepModelEntity } from "./run-step-model.entity";
import { RunStepSettingEntity } from "./run-step-setting.entity";
import { RunStepFeedEntity } from "./run-step-feed.entity";
import { RunEntity } from "./run.entity";
import type { RunStepRecord } from "../interfaces";

/** The `run_steps` table row — one turn, written when it ends: what happened, and who it was is beside. */
@Entity(RUN_STEP_TABLE_NAME)
export class RunStepEntity implements RunStepRecord {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  // Where the step stands in the run, from one: the order it ran, which is the truth and not the clock.
  @Column({
    type: "integer",
  })
  declare place: number;

  /**
   * Which walk of the run wrote this step. A break ends the walk whole, so what is left to pick up is the
   * last walk's alone, and «together» means one walk.
   */
  @Column({
    type: "varchar",
  })
  declare walkId: string;

  @Column({
    type: "text",
  })
  declare asked: string;

  @Column({
    type: "text",
  })
  declare said: string;

  @Column({
    type: "varchar",
  })
  declare state: string;

  @Column({
    type: "integer",
  })
  declare inputTokens: number;

  @Column({
    type: "integer",
  })
  declare outputTokens: number;

  /** The money the step cost, at the prices its model carried then; nothing where they cannot be said. */
  @Column({
    type: "float",
    nullable: true,
  })
  declare money: number | null;

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
  @ManyToOne(() => RunEntity, (run) => run.steps, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare run: RunEntity;

  /**
   * The question this turn grew from, known when the walk begins. Climbing the feeds cannot say which one it
   * is: a repeat picks up work from an earlier question, so the edges say one and the clock the other.
   */
  @Index()
  @ManyToOne(() => RunQuestionEntity, (question) => question.steps, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  declare question: RunQuestionEntity;

  /** Who this turn was, as they stood the moment it ran. */
  @OneToOne(() => RunStepAgentEntity, (who) => who.step)
  declare who: RunStepAgentEntity;

  /** The model that answered it, and what it cost then. */
  @OneToOne(() => RunStepModelEntity, (ran) => ran.step)
  declare ran: RunStepModelEntity;

  /** The words and numbers it was given to run with. */
  @OneToOne(() => RunStepSettingEntity, (given) => given.step)
  declare given: RunStepSettingEntity;

  @OneToMany(() => RunCallEntity, (call) => call.step)
  declare calls: RunCallEntity[];

  /** Whose work came into this step. */
  @OneToMany(() => RunStepFeedEntity, (feed) => feed.step)
  declare feeds: RunStepFeedEntity[];

  /** The steps this one's work went into; the other side of the same edge. */
  @OneToMany(() => RunStepFeedEntity, (feed) => feed.from)
  declare fedInto: RunStepFeedEntity[];

  /** The links out of this step, taken and not taken alike. */
  @OneToMany(() => RunHandoffEntity, (handoff) => handoff.step)
  declare handoffs: RunHandoffEntity[];
}
