import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { Task } from '../entities/Task';
import { Comment } from '../entities/Comment';
import { Notification } from '../entities/Notification';

const entities = [User, Project, ProjectMember, Task, Comment, Notification];

/**
 * AppDataSource is the single source of truth for database connectivity.
 * Using TypeORM's Repository under the hood, but the rest of the app never
 * imports this directly — it only depends on our own Repository interfaces
 * (see src/interfaces), preserving the Dependency Inversion Principle.
 */
export const AppDataSource =
  env.dbType === 'postgres'
    ? new DataSource({
        type: 'postgres',
        host: env.dbHost,
        port: env.dbPort,
        username: env.dbUsername,
        password: env.dbPassword,
        database: env.dbName,
        synchronize: !env.isProduction,
        logging: false,
        entities,
      })
    : new DataSource({
        type: 'sqlite',
        database: env.isTest ? ':memory:' : env.dbDatabase,
        synchronize: true,
        dropSchema: env.isTest,
        logging: false,
        entities,
      });
