import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import config from './config';

const db = {};

// connect to postgres db
const sequelize = new Sequelize(config.postgres.db,
                                config.postgres.user,
                                config.postgres.passwd,
    {
        dialect: 'postgres',
        port: config.postgres.port,
        host: config.postgres.host,
    });

const modelsDir = path.normalize(`${__dirname}/../server/models`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
    .filter(file => (file.indexOf('.') !== 0) && (file.indexOf('.map') === -1))
    // import model files and save model names
    .forEach((file) => {
        console.log(`Loading model file ${file}`); // eslint-disable-line no-
        const model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

// Synchronizing any model changes with database.
sequelize
    .sync()
    .then((err) => {
        if (err) console.log('An error occured %j', err); // eslint-disable-line no-
        else console.log('Database synchronized'); // eslint-disable-line no-
    });

// assign the sequelize variables to the db object and returning the db.
module.exports = _.extend({
    sequelize,
    Sequelize,
}, db);
