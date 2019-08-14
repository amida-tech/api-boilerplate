import winston from 'winston';
import { developmentFormatter, productionFormatter } from './winston-formatter';

const {
    loggers, format, transports,
} = winston;
const {
    printf, timestamp, combine, colorize,
} = format;

/*
 * We leverage Winston's built-in containers (loggers) to store and access your
 * custom loggers. Since this writes to a singleton reference, we won't be returning
 * anything in this function.
 */
const createLoggerWithOptions = (options) => {
    const loggerOptions = {
        transports: [
            new (transports.Console)(),
        ],
        level: options.logLevel,
        format: options.env === 'production'
            ? combine(timestamp(), productionFormatter(printf))
            : combine(timestamp(), colorize(), developmentFormatter(printf)),
    };
    loggers.add(options.name, loggerOptions);
    /*
    * Now you can get your custom configured logger anywhere in the code by either:
    *    import winston from 'winston';
    *    logger = winston.loggers.get('my-custom-logger');
    * or
    *    import { loggers } from 'winston';
    *    logger = loggers.get('my-custom-logger');
    */
};

export default createLoggerWithOptions;
