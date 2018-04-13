const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

const Request = require('../../src/Request/RequestWithXHR');
const data = require('./../data/db.json');

const postsURL = '/posts';
const commentsURL = '/comments';
const profileURL = '/profile';
const errorURL = '/404';
const badURL = 'abracadabra';

describe('RequestWithXHR', () => {
  let server;

  before(() => {
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

  after(() => {
    server.restore();
  });

  it('обработка одного запроса', next => {
    const request = new Request();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(200);
      expect(res[0].json()).to.deep.equal(data.posts);
    };

    request
      .get(postsURL, handler, handler)
      .then(() => next());
  });

  it('обработка запроса с ошибкой', next => {
    const request = new Request();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(404);
      expect(res[0].json()).to.deep.equal({});
    };

    request
      .get(errorURL, handler, handler)
      .then(() => next());
  });

  it('обработка неверного запроса', next => {
    const request = new Request();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(0);
    };

    request
      .get(badURL, handler, handler)
      .then(() => next());
  });

  it('обработка нескольких последовательных запросов', next => {
    const request = new Request();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(200);
      expect(res[0].json()).to.deep.equal(data.posts);
    };
    const handler1 = function (res, err) {
      expect(res[1].status).to.equal(200);
      expect(res[1].json()).to.deep.equal(data.comments);
    };
    const handler2 = function (res, err) {
      expect(res[2].status).to.equal(200);
      expect(res[2].json()).to.deep.equal(data.profile);
    };

    request
      .get(postsURL, handler, handler)
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .then(() => next());
  });

  it('доступ к ответам на предыдущие запросы', next => {
    const request = new Request();
    const handler = function (res, err) {
      expect(res[0].json()).to.deep.equal(data.posts);
    };
    const handler1 = function (res, err) {
      expect(res[0].json()).to.deep.equal(data.posts);
      expect(res[1].json()).to.deep.equal(data.comments);
    };
    const handler2 = function (res, err) {
      expect(res[0].json()).to.deep.equal(data.posts);
      expect(res[1].json()).to.deep.equal(data.comments);
      expect(res[2].json()).to.deep.equal(data.profile);
    };
    const handler3 = function (res, err) {
      expect(res[0].json()).to.deep.equal(data.posts);
      expect(res[1].json()).to.deep.equal(data.comments);
      expect(res[2].json()).to.deep.equal(data.profile);
      expect(res[3].status).to.equal(0);
    };
    const handlerResponses = function (res) {
      expect(res[0].json()).to.deep.equal(data.posts);
      expect(res[1].json()).to.deep.equal(data.comments);
      expect(res[2].json()).to.deep.equal(data.profile);
      expect(res[3].status).to.equal(0);
    };
    const handlerErrors = function (err) {
      expect(err[3]).to.not.equal(null);
    };

    request
      .get(postsURL, handler, handler)
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .get(badURL, handler3, handler3)
      .then(handlerResponses)
      .catch(handlerErrors)
      .then(() => next());
  });
});
