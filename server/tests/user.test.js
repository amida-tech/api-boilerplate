/* eslint-env mocha */

import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import db from '../../config/sequelize';
import app from '../../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
before(() => {
    db.sequelize.sync();
});

after(() => {
    db.User.drop();
});

describe('## User APIs', () => {
    let user = {
        username: 'KK123',
    };

    describe('# POST /api/users', () => {
        it('should create a new user', (done) => {
            request(app)
                .post('/api/users')
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).to.equal(user.username);
                    user = res.body;
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /api/users/:userId', () => {
        it('should get user details', (done) => {
            request(app)
                .get(`/api/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).to.equal(user.username);
                    done();
                })
                .catch(done);
        });

        it('should report error with message - Not found, when user does not exist', (done) => {
            request(app)
                .get('/api/users/12345')
                .expect(httpStatus.NOT_FOUND)
                .then((res) => {
                    expect(res.body.message).to.equal('Not Found');
                    done();
                })
                .catch(done);
        });
    });

    describe('# PUT /api/users/:userId', () => {
        it('should update user details', (done) => {
            user.username = 'KK';
            request(app)
                .put(`/api/users/${user.id}`)
                .send(user)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body.username).to.equal('KK');
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /api/users/', () => {
        it('should get all users', (done) => {
            request(app)
                .get('/api/users')
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).to.be.an('array');
                    done();
                })
                .catch(done);
        });

        it('should get all users (with limit and skip)', (done) => {
            request(app)
                .get('/api/users')
                .query({ limit: 10, skip: 1 })
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).to.be.an('array');
                    done();
                })
                .catch(done);
        });
    });

    describe('# DELETE /api/users/', () => {
        it('should delete user', (done) => {
            request(app)
                .delete(`/api/users/${user.id}`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).to.equal('KK');
                    done();
                })
                .catch(done);
        });
    });
});
