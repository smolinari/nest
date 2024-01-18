import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  HyperExpressAdapter,
  NestHyperExpressApplication,
} from '@nestjs/platform-hyper-express';
import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { RawServerDefault } from 'fastify';
import { request as pactReq, spec } from 'pactum';
import * as request from 'supertest';
import { ErrorsController } from '../src/errors/errors.controller';

describe('Error messages', () => {
  let server: RawServerDefault;

  describe('Express', () => {
    let app: INestApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        controllers: [ErrorsController],
      }).compile();

      app = module.createNestApplication();
      server = app.getHttpServer();
      await app.init();
    });

    it(`/GET`, () => {
      return request(server)
        .get('/sync')
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Integration test',
        });
    });

    it(`/GET (Promise/async)`, () => {
      return request(server)
        .get('/async')
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Integration test',
        });
    });

    it(`/GET (InternalServerError despite custom content-type)`, async () => {
      return request(server)
        .get('/unexpected-error')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect({
          statusCode: 500,
          message: 'Internal server error',
        });
    });

    afterEach(async () => {
      await app.close();
    });
  });

  describe('Fastify', () => {
    let app: NestFastifyApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        controllers: [ErrorsController],
      }).compile();

      app = module.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
      );
      server = app.getHttpServer();
      await app.init();
    });

    it(`/GET`, async () => {
      return app
        .inject({
          method: 'GET',
          url: '/sync',
        })
        .then(({ payload, statusCode }) => {
          expect(statusCode).to.equal(HttpStatus.BAD_REQUEST);
          expect(payload).to.equal(
            JSON.stringify({
              statusCode: 400,
              error: 'Bad Request',
              message: 'Integration test',
            }),
          );
        });
    });

    it(`/GET (Promise/async)`, async () => {
      return app
        .inject({
          method: 'GET',
          url: '/sync',
        })
        .then(({ payload, statusCode }) => {
          expect(statusCode).to.equal(HttpStatus.BAD_REQUEST);
          expect(payload).to.equal(
            JSON.stringify({
              statusCode: 400,
              error: 'Bad Request',
              message: 'Integration test',
            }),
          );
        });
    });

    it(`/GET (InternalServerError despite custom content-type)`, async () => {
      return app
        .inject({
          method: 'GET',
          url: '/unexpected-error',
        })
        .then(({ payload, statusCode }) => {
          expect(statusCode).to.equal(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(payload).to.equal(
            JSON.stringify({
              statusCode: 500,
              message: 'Internal server error',
            }),
          );
        });
    });

    afterEach(async () => {
      await app.close();
    });
  });

  describe('HyperExpress', () => {
    let app: NestHyperExpressApplication;
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        controllers: [ErrorsController],
      }).compile();
      app = module.createNestApplication<NestHyperExpressApplication>(
        new HyperExpressAdapter(),
      );
      server = app.getHttpServer();
      await app.listen(9999);
      const url = await app.getUrl();
      pactReq.setBaseUrl(
        url
          .replace('::1', '127.0.0.1')
          .replace('+unix', '')
          .replace('%3A', ':'),
      );
    });

    it(`/GET`, () => {
      return spec()
        .get('/sync')
        .expectStatus(HttpStatus.BAD_REQUEST)
        .expectJson({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Integration test',
        });
    });

    it(`/GET (Promise/async)`, () => {
      return spec()
        .get('/async')
        .expectStatus(HttpStatus.BAD_REQUEST)
        .expectJson({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Integration test',
        });
    });

    it(`/GET (InternalServerError despite custom content-type)`, async () => {
      return spec()
        .get('/unexpected-error')
        .expectStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        .expectJson({
          statusCode: 500,
          message: 'Internal server error',
        });
    });

    afterEach(async () => {
      await app.close();
    });
  });
});
