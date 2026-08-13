import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  NEW_COMMENT = 'NEW_COMMENT',
  ADDED_TO_PROJECT = 'ADDED_TO_PROJECT',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  recipientId!: string;

  @Column({ type: 'simple-enum', enum: NotificationType })
  type!: NotificationType;

  @Column()
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient!: User;
}
