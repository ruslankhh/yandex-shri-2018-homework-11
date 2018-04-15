import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';

class RequestWithFetch {
  constructor () {
    this._responses = [];
    this._errors = [];
    this._promise = Promise.resolve();
  }

  get (url, onResolve = () => {}, onReject = () => {}) {
    this._promise = this._promise.then(() =>
      fetch(url)
        .then(response => {
          this._responses = [...this._responses, response];
          this._errors = [...this._errors, null];

          return onResolve(this._responses, this._errors);
        })
        .catch(error => {
          this._responses = [...this._responses, null];
          this._errors = [...this._errors, error];

          return onReject(this._responses, this._errors);
        })
    );

    return this;
  }

  then (...args) {
    this._promise = this._promise.then(
      args[0] ? val => args[0](val, this._responses, this._errors) : undefined,
      args[1] ? err => args[1](err, this._responses, this._errors) : undefined
    );

    return this;
  }

  catch (...args) {
    this._promise = this._promise.catch(
      args[0] ? err => args[0](err, this._responses, this._errors) : undefined
    );

    return this;
  }
}

export default RequestWithFetch;
