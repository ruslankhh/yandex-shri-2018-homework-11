const { describe, it } = require('mocha');
const { expect } = require('chai');
const url = require('url');

const RequestWithXHR = require('../../src/Request/RequestWithXHR');
const data = require('./../data/db.json');

const requestURL = 'http://localhost:5000';
const postsURL = url.resolve(requestURL, 'posts');
const commentsURL = url.resolve(requestURL, 'comments');
const profileURL = url.resolve(requestURL, 'profile');
const errorURL = url.resolve(requestURL, 'abracadabra');
const badURL = 'http://abracadabra';

describe('RequestWithXHR', () => {
  it('обработка одного запроса', next => {
    const request = new RequestWithXHR();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(200);
      expect(res[0].data).to.deep.equal(data.posts);
    };

    request
      .get(postsURL, handler, handler)
      .then(() => next());
  });

  it('обработка запроса с ошибкой', next => {
    const request = new RequestWithXHR();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(404);
      expect(res[0].data).to.deep.equal({});
    };

    request
      .get(errorURL, handler, handler)
      .then(() => next());
  });

  it('обработка неверного запроса', next => {
    const request = new RequestWithXHR();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(0);
      expect(res[0].data).to.deep.equal({});
    };

    request
      .get(badURL, handler, handler)
      .then(() => next());
  });

  it('обработка нескольких последовательных запросов', next => {
    const request = new RequestWithXHR();
    const handler = function (res, err) {
      expect(res[0].status).to.equal(200);
      expect(res[0].data).to.deep.equal(data.posts);
    };
    const handler1 = function (res, err) {
      expect(res[1].status).to.equal(200);
      expect(res[1].data).to.deep.equal(data.comments);
    };
    const handler2 = function (res, err) {
      expect(res[2].status).to.equal(200);
      expect(res[2].data).to.deep.equal(data.profile);
    };

    request
      .get(postsURL, handler, handler)
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .then(() => next());
  });

  it('доступ к ответам на предыдущие запросы', next => {
    const request = new RequestWithXHR();
    const handler = function (res, err) {
      expect(res[0].data).to.deep.equal(data.posts);
    };
    const handler1 = function (res, err) {
      expect(res[0].data).to.deep.equal(data.posts);
      expect(res[1].data).to.deep.equal(data.comments);
    };
    const handler2 = function (res, err) {
      expect(res[0].data).to.deep.equal(data.posts);
      expect(res[1].data).to.deep.equal(data.comments);
      expect(res[2].data).to.deep.equal(data.profile);
    };
    const handler3 = function (res, err) {
      expect(res[0].data).to.deep.equal(data.posts);
      expect(res[1].data).to.deep.equal(data.comments);
      expect(res[2].data).to.deep.equal(data.profile);
      expect(res[3].status).to.deep.equal(0);
      expect(res[3].data).to.deep.equal({});
      expect(err[3].code).to.equal('ENOTFOUND');
    };
    const handlerResponses = function (res) {
      expect(res[0].data).to.deep.equal(data.posts);
      expect(res[1].data).to.deep.equal(data.comments);
      expect(res[2].data).to.deep.equal(data.profile);
      expect(res[3].status).to.deep.equal(0);
      expect(res[3].data).to.deep.equal({});
    };
    const handlerErrors = function (err) {
      expect(err[3].code).to.equal('ENOTFOUND');
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
