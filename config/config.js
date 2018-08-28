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
    UNIQUE_NAME_PG_DB: Joi.string()
        .default('api')
        .description('Postgres database name'),
    UNIQUE_NAME_PG_TEST_DB: Joi.string()
        .default('api-test')
        .description('Postgres database for tests'),
    UNIQUE_NAME_PG_PORT: Joi.number()
        .default(5432),
    UNIQUE_NAME_PG_HOST: Joi.string()
        .default('localhost'),
    UNIQUE_NAME_PG_USER: Joi.string().required()
        .default('postgres')
        .description('Postgres username'),
    UNIQUE_NAME_PG_PASSWD: Joi.string().allow('')
        .default('password')
        .description('Postgres password'),
    UNIQUE_NAME_PG_SSL: Joi.bool()
        .default(false)
        .description('Enable SSL connection to PostgreSQL'),
    UNIQUE_NAME_PG_CERT_CA: Joi.string()
        .description('SSL certificate CA'), // Certificate itself, not a filename
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
        db: isTestEnvironment ? envVars.UNIQUE_NAME_PG_TEST_DB : envVars.UNIQUE_NAME_PG_DB,
        port: envVars.UNIQUE_NAME_PG_PORT,
        host: envVars.UNIQUE_NAME_PG_HOST,
        user: envVars.UNIQUE_NAME_PG_USER,
        passwd: envVars.UNIQUE_NAME_PG_PASSWD,
        ssl: envVars.UNIQUE_NAME_PG_SSL,
        ssl_ca_cert: envVars.UNIQUE_NAME_PG_CERT_CA,
    },
};

export default config;
