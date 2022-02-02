/* eslint-env jest */

import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../index';
import config from '../../config/config';
import db from '../../config/sequelize';

const apiVersionPath = `/api/v${config.apiVersion}`;

describe('## Misc', () => {
  let testApp;

  beforeAll(() => {
    testApp = request(app);
  });

  afterAll((done) => {
    db.sequelize.close()
      .then(() => done())
      .catch(done);
  });

  describe(`# GET ${apiVersionPath}/health-check`, () => {
    test('should return OK', (done) => {
      testApp
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
      testApp
        .get(`${apiVersionPath}/404`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).toEqual('Not Found');
          done();
        })
        .catch(done);
    });
  });
});
