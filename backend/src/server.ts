import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { createApp } from './app';
import { env } from './config/env';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  // eslint-disable-next-line no-console
  console.log(`[db] Connected (${env.dbType})`);

  const app = createApp(AppDataSource);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] TaskFlow API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
