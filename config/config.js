import Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(['development', 'production', 'test', 'provision'])
        .default('development'),
    PORT: Joi.number()
        .default(4000),
    API_VERSION: Joi.string()
        .default('1.0')
        .description('API Version'),
    JWT_SECRET: Joi.string().required()
        .description('JWT Secret required to sign'),
    PG_DB: Joi.string()
        .default('api')
        .description('Postgres database name'),
    PG_TEST_DB: Joi.string()
        .default('api-test')
        .description('Postgres database for tests'),
    PG_PORT: Joi.number()
        .default(5432),
    PG_HOST: Joi.string()
        .default('localhost'),
    PG_USER: Joi.string().required()
        .default('postgres')
        .description('Postgres username'),
    PG_PASSWD: Joi.string().allow('')
        .default('password')
        .description('Postgres password'),
}).unknown()
    .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

// if test, use test database
const isTestEnvironment = envVars.NODE_ENV === 'test';

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    apiVersion: envVars.API_VERSION,
    jwtSecret: envVars.JWT_SECRET,
    postgres: {
        db: isTestEnvironment ? envVars.PG_TEST_DB : envVars.PG_DB,
        port: envVars.PG_PORT,
        host: envVars.PG_HOST,
        user: envVars.PG_USER,
        passwd: envVars.PG_PASSWD,
    },
};

export default config;
