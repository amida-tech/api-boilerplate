import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import config from './config';

const db = {};

// connect to postgres testDb
const sequelizeOptions = {
    dialect: 'postgres',
    port: config.postgres.port,
    host: config.postgres.host,
    // NOTE: https://github.com/sequelize/sequelize/issues/8417
    // Codebase shouldn't be using string-based operators, but we still disable them
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
    ...(config.postgres.ssl && {
        ssl: config.postgres.ssl,
    }),
    ...(config.postgres.ssl && config.postgres.ssl_ca_cert && {
        dialectOptions: {
            ssl: {
                ca: config.postgres.ssl_ca_cert,
            },
        },
    }),
};
const sequelize = new Sequelize(
    config.postgres.db,
    config.postgres.user,
    config.postgres.passwd,
    sequelizeOptions
);

const modelsDir = path.normalize(`${__dirname}/../server/models`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
    .filter(file => (file.indexOf('.') !== 0) && (file.indexOf('.map') === -1))
    // import model files and save model names
    .forEach((file) => {
        console.log(`Loading model file ${file}`); // eslint-disable-line no-console
        const model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

// Synchronizing any model changes with database.
sequelize
    .sync()
    .then(() => {
        console.log('Database synchronized'); // eslint-disable-line no-console
    })
    .catch((error) => {
        if (error) console.log('An error occured %j', error); // eslint-disable-line no-console
    });

// assign the sequelize variables to the db object and returning the db.
module.exports = _.extend({
    sequelize,
    Sequelize,
}, db);
