import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';

class RequestWithFetchAndProxy {
  constructor () {
    this._responses = [];
    this._errors = [];
    this._promise = Promise.resolve();

    return new Proxy(this, {
      get (target, key, receiver) {
        if (key in target && typeof target[key] === 'function') {
          return function (...args) {
            Reflect.apply(target[key], target, args);

            return this;
          };
        } else if (key in target._promise && typeof target._promise[key] === 'function') {
          return function (onSuccess = () => {}, onError = () => {}) {
            target._promise = Reflect.apply(target._promise[key], target._promise, [
              data => onSuccess(data, target._responses, target._errors),
              err => onError(err, target._responses, target._errors)
            ]);

            return this;
          };
        } else if (key in target._promise) {
          return Reflect.get(target._promise, key, target._promise);
        } else {
          return Reflect.get(target, key, receiver);
        }
      }
    });
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
  }
}

export default RequestWithFetchAndProxy;
