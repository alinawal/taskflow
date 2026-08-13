import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Project } from './Project';

export enum ProjectRole {
  OWNER = 'OWNER',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'simple-enum', enum: ProjectRole, default: ProjectRole.CONTRIBUTOR })
  role!: ProjectRole;

  @CreateDateColumn()
  joinedAt!: Date;

  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
