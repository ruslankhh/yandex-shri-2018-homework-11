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

  then (cb = () => {}) {
    return this._promise.then(() =>
      cb(this._responses, this._errors)
    );
  }

  catch (cb = () => {}) {
    return this._promise.catch(cb);
  }
}

export default RequestWithFetch;
