/* eslint-env jest */

import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import db from '../../config/sequelize';
import app from '../../index';

/**
 * root level hooks
 */
beforeAll(() => {
    db.sequelize.sync();
});

afterAll(() => {
    db.sequelize.close();
});

describe('## User APIs', () => {
    let user = {
        username: 'KK123',
    };

    describe('# POST /api/users', () => {
        test('should create a new user', (done) => {
            request(app)
                .post('/api/users')
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

    describe('# GET /api/users/:userId', () => {
        test('should get user details', (done) => {
            request(app)
                .get(`/api/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(user.username);
                    done();
                })
                .catch(done);
        });

        test('should report error with message - Not found, when user does not exist', (done) => {
            request(app)
                .get('/api/users/12345')
                .expect(httpStatus.NOT_FOUND)
                .then((res) => {
                    expect(res.body.message).toEqual('Not Found');
                    done();
                })
                .catch(done);
        });
    });

    describe('# PUT /api/users/:userId', () => {
        test('should update user details', (done) => {
            user.username = 'KK';
            request(app)
                .put(`/api/users/${user.id}`)
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).toEqual('KK');
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /api/users/', () => {
        test('should get all users', (done) => {
            request(app)
                .get('/api/users')
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(Array.isArray(res.body));
                    done();
                })
                .catch(done);
        });

        test('should get all users (with limit and skip)', (done) => {
            request(app)
                .get('/api/users')
                .query({ limit: 10, skip: 1 })
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(Array.isArray(res.body));
                    done();
                })
                .catch(done);
        });
    });

    describe('# DELETE /api/users/', () => {
        test('should delete user', (done) => {
            request(app)
                .delete(`/api/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).toEqual('KK');
                    done();
                })
                .catch(done);
        });
    });
});
