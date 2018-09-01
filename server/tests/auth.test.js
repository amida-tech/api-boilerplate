/* eslint-env jest */

import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import app from '../../index';
import config from '../../config/config';

const apiVersionPath = `/api/v${config.apiVersion}`;

describe('## Auth APIs', () => {
    const validUserCredentials = {
        username: 'react',
        password: 'express',
    };

    const invalidUserCredentials = {
        username: 'react',
        password: 'IDontKnow',
    };

    let jwtToken;

    describe(`# POST ${apiVersionPath}/auth/login`, () => {
        test('should return Authentication error', (done) => {
            request(app)
                .post(`${apiVersionPath}/auth/login`)
                .send(invalidUserCredentials)
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.body.message).toEqual('Authentication error');
                    done();
                })
                .catch(done);
        });

        test('should get valid JWT token', (done) => {
            request(app)
                .post(`${apiVersionPath}/auth/login`)
                .send(validUserCredentials)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.body).toHaveProperty('token');
                    jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
                        expect(!err);
                        expect(decoded.username).toEqual(validUserCredentials.username);
                        jwtToken = `Bearer ${res.body.token}`;
                        done();
                    });
                })
                .catch(done);
        });
    });

    describe(`# GET ${apiVersionPath}/auth/random-number`, () => {
        test('should fail to get random number because of missing Authorization', (done) => {
            request(app)
                .get(`${apiVersionPath}/auth/random-number`)
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.body.message).toEqual('Unauthorized');
                    done();
                })
                .catch(done);
        });

        test('should fail to get random number because of wrong token', (done) => {
            request(app)
                .get(`${apiVersionPath}/auth/random-number`)
                .set('Authorization', 'Bearer inValidToken')
                .expect(httpStatus.UNAUTHORIZED)
                .then((res) => {
                    expect(res.body.message).toEqual('Unauthorized');
                    done();
                })
                .catch(done);
        });

        test('should get a random number', (done) => {
            request(app)
                .get(`${apiVersionPath}/auth/random-number`)
                .set('Authorization', jwtToken)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(typeof res.body.num === 'number');
                    done();
                })
                .catch(done);
        });
    });
});
