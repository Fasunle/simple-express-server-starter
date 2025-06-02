/**
 * @file index.ts
 * @description Main application entry point that initializes the database connection and starts the server
 * @module index
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

import { logger } from '@/core/common/logger';
import { AppDataSource } from './data-source';
import server from './server';

const PORT = process.env.PORT || 5000;

let serverInstance: any;

async function shutdown() {
  logger.info('Received shutdown signal. Starting graceful shutdown...');

  try {
    if (serverInstance) {
      await new Promise(resolve => {
        serverInstance.close(resolve);
      });
      logger.info('HTTP server closed');
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

AppDataSource.initialize()
  .then(async () => {
    logger.info('Database initialized successfully');

    serverInstance = server.listen(PORT, () =>
      logger.info(`Server is running on http://localhost:${PORT}`)
    );
  })
  .catch(error => {
    logger.error('Error initializing database:', error);
    process.exit(1);
  });
