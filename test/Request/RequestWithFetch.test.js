const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
require('url-search-params-polyfill');
require('whatwg-fetch');

const CustomRequest = require('../../src/Request/RequestWithFetch');
const data = require('./../data/db.json');

const postsURL = '/posts';
const commentsURL = '/comments';
const profileURL = '/profile';
const errorURL = '/404';
const badURL = 'abracadabra';

describe('RequestWithFetch', () => {
  let promises = [];

  beforeEach(() => {
    const { Response } = window;
    const init = {
      status: 200,
      headers: { 'Content-type': 'application/json' }
    };
    const responsePosts = new Response(JSON.stringify(data.posts), init);
    const responseComments = new Response(JSON.stringify(data.comments), init);
    const responseProfile = new Response(JSON.stringify(data.profile), init);
    const responseError = new Response('', { status: 404 });
    const responseBad = Response.error();

    global.fetch = window.fetch;
    sinon.stub(global, 'fetch');

    fetch.withArgs(postsURL).returns(Promise.resolve(responsePosts));
    fetch.withArgs(commentsURL).returns(Promise.resolve(responseComments));
    fetch.withArgs(profileURL).returns(Promise.resolve(responseProfile));
    fetch.withArgs(errorURL).returns(Promise.resolve(responseError));
    fetch.withArgs(badURL).returns(Promise.reject(responseBad));

    fetch(badURL).catch(() => {});
  });

  afterEach(() => {
    promises = [];
    fetch.restore();
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
    const handlerLast = function (res, err) {
      promises.push(res[0].clone().json());
      promises.push(res[1].clone().json());
      promises.push(res[2].clone().json());
      promises.push(res[3]);
      promises.push(err[3]);
    };

    return request
      .get(postsURL, handler, handler)
      .get(commentsURL, handler1, handler1)
      .get(profileURL, handler2, handler2)
      .get(badURL, handler3, handler3)
      .then(handlerLast)
      .then(() => Promise.all(promises))
      .then(result => {
        expect(result.slice(0, 7)).to.deep.equal([
          200, data.posts,
          200, data.comments,
          200, data.profile,
          null
        ]);
        expect(result[7]).to.not.equal(null);
        expect(result.slice(8, 12)).to.deep.equal([
          data.posts,
          data.comments,
          data.profile,
          null
        ]);
        expect(result[12]).to.not.equal(null);
      });
  });
});
