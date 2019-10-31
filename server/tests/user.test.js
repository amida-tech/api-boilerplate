/* eslint-env jest */

import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../index';
import config from '../../config/config';
import db from '../../config/sequelize';

const apiVersionPath = `/api/v${config.apiVersion}`;

describe('## User APIs', () => {
    let testApp;

    beforeAll(() => {
        testApp = request(app);
    });

    afterAll((done) => {
        db.sequelize.close(done);
    });

    let user = {
        username: 'KK123',
    };

    describe(`# POST ${apiVersionPath}/users`, () => {
        test('should create a new user', (done) => {
            testApp
                .post(`${apiVersionPath}/users`)
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(user.username);
                    user = res.body;
                    done();
                })
                .catch(done);
        });
    });

    describe(`# GET ${apiVersionPath}/users/:userId`, () => {
        test('should get user details', (done) => {
            testApp
                .get(`${apiVersionPath}/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(user.username);
                    done();
                })
                .catch(done);
        });

        test('should report error with message - Not found, when user does not exist', (done) => {
            testApp
                .get(`${apiVersionPath}/users/12345`)
                .expect(httpStatus.NOT_FOUND)
                .then((res) => {
                    expect(res.body.message).toEqual('Not Found');
                    done();
                })
                .catch(done);
        });
    });

    describe(`# PUT ${apiVersionPath}/users/:userId`, () => {
        test('should update user details', (done) => {
            user.username = 'KK';
            testApp
                .put(`${apiVersionPath}/users/${user.id}`)
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).toEqual('KK');
                    done();
                })
                .catch(done);
        });
    });

    describe(`# GET ${apiVersionPath}/users/`, () => {
        test('should get all users', (done) => {
            testApp
                .get(`${apiVersionPath}/users`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(Array.isArray(res.body));
                    done();
                })
                .catch(done);
        });

        test('should get all users (with limit and skip)', (done) => {
            testApp
                .get(`${apiVersionPath}/users`)
                .query({ limit: 10, skip: 1 })
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(Array.isArray(res.body));
                    done();
                })
                .catch(done);
        });
    });

    describe(`# DELETE ${apiVersionPath}/users/`, () => {
        test('should delete user', (done) => {
            testApp
                .delete(`${apiVersionPath}/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).toEqual('KK');
                    done();
                })
                .catch(done);
        });
    });
});
