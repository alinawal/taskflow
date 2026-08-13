import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, validated application configuration.
 * Single Responsibility: this module's only job is to read and expose
 * environment configuration — nothing else in the codebase reads
 * process.env directly.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  dbType: (process.env.DB_TYPE ?? 'sqlite') as 'sqlite' | 'postgres',
  dbDatabase: process.env.DB_DATABASE ?? './data/taskflow.sqlite',
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbUsername: process.env.DB_USERNAME ?? 'taskflow',
  dbPassword: process.env.DB_PASSWORD ?? 'taskflow',
  dbName: process.env.DB_NAME ?? 'taskflow',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isTest: process.env.NODE_ENV === 'test',
  isProduction: process.env.NODE_ENV === 'production',
};
