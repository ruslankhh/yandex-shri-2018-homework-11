const { describe, it } = require('mocha');
const { expect } = require('chai');
const url = require('url');

const RequestWithXHR = require('../../src/Request/RequestWithXHR');
const data = require('./../data/db.json');

describe('RequestWithXHR', () => {
  const requestURL = 'http://localhost:5000';
  const postsURL = url.resolve(requestURL, 'posts');
  const commentsURL = url.resolve(requestURL, 'comments');
  const profileURL = url.resolve(requestURL, 'profile');
  const badURL = url.resolve(requestURL, 'abracadabra');

  const getExpect = (res, expected, expectedStatus = 200) => {
    const result = JSON.parse(res.responseText);

    expect(res.status).to.equal(expectedStatus);
    expect(result).to.deep.equal(expected);
  };

  it('обработка одного запроса', () => {
    const request = new RequestWithXHR();
    const expected = data.posts;

    return new Promise(resolve => {
      const handler = function (req, resArr) {
        getExpect(resArr[0], expected);
      };

      request
        .get(postsURL, handler, handler)
        .then(resolve);
    });
  });

  it('обработка неверного запроса', () => {
    const request = new RequestWithXHR();
    const expected = {};

    return new Promise(resolve => {
      const handler = function (req, resArr) {
        getExpect(resArr[0], expected, 404);
      };

      request
        .get(badURL, handler, handler)
        .then(resolve);
    });
  });

  it('обработка нескольких последовательных запросов', () => {
    const request = new RequestWithXHR();
    const expected1 = data.posts;
    const expected2 = data.comments;
    const expected3 = data.profile;

    return new Promise(resolve => {
      const handler1 = function (req, resArr) {
        getExpect(resArr[0], expected1);
      };
      const handler2 = function (req, resArr) {
        getExpect(resArr[0], expected2);
      };
      const handler3 = function (req, resArr) {
        getExpect(resArr[0], expected3);
      };

      request
        .get(postsURL, handler1, handler1)
        .get(commentsURL, handler2, handler2)
        .get(profileURL, handler3, handler3)
        .then(resolve);
    });
  });

  it('доступ к ответам на предыдущие запросы', () => {
    const request = new RequestWithXHR();
    const expected1 = data.posts;
    const expected2 = data.comments;
    const expected3 = data.profile;

    return new Promise(resolve => {
      const handler1 = function (req, resArr) {
        getExpect(resArr[0], expected1);
      };
      const handler2 = function (req, resArr) {
        getExpect(resArr[0], expected2);
        getExpect(resArr[1], expected1);
      };
      const handler3 = function (req, resArr) {
        getExpect(resArr[0], expected3);
        getExpect(resArr[1], expected2);
        getExpect(resArr[2], expected1);
      };
      const handlerLast = handler3;

      request
        .get(postsURL, handler1, handler1)
        .get(commentsURL, handler2, handler2)
        .get(profileURL, handler3, handler3)
        .then(handlerLast)
        .then(resolve);
    });
  });
});
