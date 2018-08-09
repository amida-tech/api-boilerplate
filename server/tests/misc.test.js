/* eslint-env jest */

import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../index';
import config from '../../config/config';

const apiVersionPath = `/api/v${config.apiVersion}`;

describe('## Misc', () => {
    describe(`# GET ${apiVersionPath}/health-check`, () => {
        test('should return OK', (done) => {
            request(app)
                .get(`${apiVersionPath}/health-check`)
                .expect(httpStatus.OK)
                .then((res) => {
                    expect(res.text).toEqual('OK');
                    done();
                })
                .catch(done);
        });
    });

    describe(`# GET ${apiVersionPath}/404`, () => {
        test('should return 404 status', (done) => {
            request(app)
                .get(`${apiVersionPath}/404`)
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
                .post(`${apiVersionPath}/users`)
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
