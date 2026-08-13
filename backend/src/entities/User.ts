import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProjectMember } from './ProjectMember';
import { Task } from './Task';
import { Comment } from './Comment';
import { Notification } from './Notification';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.MEMBER })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => ProjectMember, (member) => member.user)
  memberships!: ProjectMember[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks!: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications!: Notification[];
}
