import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Application } from 'express';
import { createApp } from '../../src/app';
import { User } from '../../src/entities/User';
import { Project } from '../../src/entities/Project';
import { ProjectMember } from '../../src/entities/ProjectMember';
import { Task } from '../../src/entities/Task';
import { Comment } from '../../src/entities/Comment';
import { Notification } from '../../src/entities/Notification';

/**
 * Creates an isolated, in-memory SQLite DataSource + Express app for a
 * single test file. Using `:memory:` per test suite means integration
 * tests never share state and never touch a real database file.
 */
export async function createTestApp(): Promise<{ app: Application; dataSource: DataSource }> {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    synchronize: true,
    entities: [User, Project, ProjectMember, Task, Comment, Notification],
  });

  await dataSource.initialize();
  const app = createApp(dataSource);
  return { app, dataSource };
}
