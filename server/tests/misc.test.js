/* eslint-env jest */

import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../index';

describe('## Misc', () => {
    describe('# GET /api/health-check', () => {
        test('should return OK', (done) => {
            request(app)
                .get('/api/health-check')
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.text).toEqual('OK');
                    done();
                })
                .catch(done);
        });
    });

    describe('# GET /api/404', () => {
        test('should return 404 status', (done) => {
            request(app)
                .get('/api/404')
                .expect(httpStatus.NOT_FOUND)
                .then((res) => {
                    expect(res.body.message).toEqual('Not Found');
                    done();
                })
                .catch(done);
        });
    });

    describe('# Error Handling', () => {
        test('should handle express validation error - username is required', (done) => {
            request(app)
                .post('/api/users')
                .send({
                    mobileNumber: '1234567890',
                })
                .expect(httpStatus.BAD_REQUEST)
                .then((res) => {
                    expect(res.body.message).toEqual('"username" is required');
                    done();
                })
                .catch(done);
        });
    });
});
