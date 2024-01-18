import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { request as pactReq, spec } from 'pactum';
import {
  HyperExpressAdapter,
  NestHyperExpressApplication,
} from '@nestjs/platform-hyper-express';

describe('Hello world (express instance)', () => {
  let app: NestHyperExpressApplication;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication<NestHyperExpressApplication>(
      new HyperExpressAdapter(),
    );
    await app.listen(9999);
    const url = await app.getUrl();
    pactReq.setBaseUrl(
      url.replace('::1', '127.0.0.1').replace('+unix', '').replace('%3A', ':'),
    );
  });
  // beforeEach(async () => {
  //   const module = await Test.createTestingModule({
  //     imports: [AppModule],
  //   }).compile();

  //   app = module.createNestApplication(new HyperExpressAdapter());
  //   server = app.getHttpServer();
  //   await app.init();
  // });

  it(`/GET`, () => {
    return spec().get('/hello').expectStatus(200).expectBody('Hello world!');
  });

  it(`/GET (Promise/async)`, () => {
    return spec()
      .get('/hello/async')
      .expectStatus(200)
      .expectBody('Hello world!');
  });

  it(`/GET (Observable stream)`, () => {
    return spec()
      .get('/hello/stream')
      .expectStatus(200)
      .expectBody('Hello world!');
  });

  it(`/GET { host: ":tenant.example.com" } not matched`, () => {
    return spec().get('/host').expectStatus(404).expectJson({
      statusCode: 404,
      error: 'Not Found',
      message: 'Cannot GET /host',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
