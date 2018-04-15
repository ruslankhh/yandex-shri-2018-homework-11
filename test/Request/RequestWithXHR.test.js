const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

const CustomRequest = require('../../src/Request/RequestWithXHR');
const data = require('./../data/db.json');

const postsURL = '/posts';
const commentsURL = '/comments';
const profileURL = '/profile';
const errorURL = '/404';
const badURL = 'abracadabra';

describe('RequestWithXHR', () => {
  let promises = [];
  let server;

  beforeEach(() => {
    global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
    server = sinon.fakeServer.create({
      autoRespond: true
    });
    server.respondWith(postsURL, JSON.stringify(data.posts));
    server.respondWith(commentsURL, JSON.stringify(data.comments));
    server.respondWith(profileURL, JSON.stringify(data.profile));
    server.respondWith(errorURL, [404, {}, '']);
    server.respondWith(badURL, request => request.error());
  });

  afterEach(() => {
    promises = [];
    server.restore();
  });

  it('обработка одного запроса', () => {
    const request = new CustomRequest();
    const handler = function (res, err) {
      promises.push(res[0].status);
      promises.push(res[0].clone().json());
    };

    return request
      .get(postsURL, handler, handler)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result).to.deep.equal([200, data.posts]);
      });
  });

  it('обработка запроса с ошибкой', () => {
    const request = new CustomRequest();
    const handler = function (res, err) {
      promises.push(res[0].status);
    };

    return request
      .get(errorURL, handler, handler)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result).to.deep.equal([404]);
      });
  });

  it('обработка неверного запроса', () => {
    const request = new CustomRequest();
    const handler = function (res, err) {
      promises.push(res[0]);
    };

    return request
      .get(badURL, handler, handler)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result).to.deep.equal([null]);
      });
  });

  it('обработка нескольких последовательных запросов', () => {
    const request = new CustomRequest();
    const handler = function (res, err) {
      promises.push(res[0].status);
      promises.push(res[0].clone().json());
    };
    const handler1 = function (res, err) {
      promises.push(res[1].status);
      promises.push(res[1].clone().json());
    };
    const handler2 = function (res, err) {
      promises.push(res[2].status);
      promises.push(res[2].clone().json());
    };

    return request
      .get(postsURL, handler, handler)
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result).to.deep.equal([
          200, data.posts,
          200, data.comments,
          200, data.profile
        ]);
      });
  });

  it('доступ к ответам на предыдущие запросы', () => {
    const request = new CustomRequest();
    const handler = function (res, err) {
      promises.push(res[0].status);
      promises.push(res[0].clone().json());
    };
    const handlerFirst = function (data, res, err) {
      promises.push(res[0].clone().json());
    };
    const handler1 = function (res, err) {
      promises.push(res[1].status);
      promises.push(res[1].clone().json());
    };
    const handler2 = function (res, err) {
      promises.push(res[2].status);
      promises.push(res[2].clone().json());
    };
    const handler3 = function (res, err) {
      promises.push(res[3]);
      promises.push(err[3]);
    };
    const handlerLast = function (data, res, err) {
      promises.push(res[0].clone().json());
      promises.push(res[1].clone().json());
      promises.push(res[2].clone().json());
      promises.push(res[3]);
      promises.push(err[3]);
    };

    return request
      .get(postsURL, handler, handler)
      .then(handlerFirst)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result).to.deep.equal([
          200, data.posts,
          data.posts
        ]);
      })
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .get(badURL, handler3, handler3)
      .then(handlerLast)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result.slice(0, 8)).to.deep.equal([
          200, data.posts,
          data.posts,
          200, data.comments,
          200, data.profile,
          null
        ]);
        expect(result[8]).to.not.equal(null);
        expect(result.slice(9, 13)).to.deep.equal([
          data.posts,
          data.comments,
          data.profile,
          null
        ]);
        expect(result[13]).to.not.equal(null);
      });
  });
});
