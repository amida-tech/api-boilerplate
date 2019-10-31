import { loggers } from 'winston';
import config from '../config';
import createLoggerWithOptions from './loggers-container-accessor';

const loggerOptions = {
    name: config.loggerName,
    env: config.env,
    logLevel: config.logLevel,
};
createLoggerWithOptions(loggerOptions);

const logger = loggers.get(config.loggerName);

export default logger;
