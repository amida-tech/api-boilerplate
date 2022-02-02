import { loggers } from 'winston';
import config from './config/config';
import app from './config/express';
/* eslint-disable no-unused-vars */
import db from './config/sequelize';

const debug = require('debug')('amida-api-boilerplate:index');
/* eslint-enable no-unused-vars */

// Get default logger
const logger = loggers.get(config.loggerName); // eslint-disable-line no-global-assign

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// Synchronizing any model changes with database.
db.sequelize
  .sync()
  .then(() => {
    logger.info('Database synchronized');
    // module.parent check is required to support mocha watch
    if (!module.parent) {
      // listen on port config.port
      app.listen(config.port, () => {
        logger.info(`The application has started on port ${config.port} (${config.env})`, {
          port: config.port,
          node_env: config.env,
        });
      });
    }
  })
  .catch((error) => {
    if (error) {
      logger.error('An error occured: ', error);
    }
  });

export default app;
