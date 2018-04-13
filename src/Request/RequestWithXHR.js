import { XMLHttpRequest } from 'xmlhttprequest';

class RequestWithXHR {
  constructor () {
    this._responses = [];
    this._errors = [];
    this._promise = Promise.resolve();
  }

  get (url, onResolve = () => {}, onReject = () => {}) {
    this._promise = this._promise.then(() => {
      return new Promise(resolve => {
        const request = new XMLHttpRequest();
        const self = this;

        request.addEventListener('load', function (event) {
          self._responses = [this, ...self._responses];
          self._errors = [null, ...self._errors];

          if (this.status === 200) {
            onResolve(request, self._responses, self._errors);
            resolve();
          } else {
            onReject(request, self._responses, self._errors);
            resolve();
          }
        });
        request.addEventListener('error', function (event) {
          self._responses = [null, ...self._responses];
          self._errors = [this, ...self._errors];

          onReject(request, self._responses, self._errors);
          resolve();
        });

        request.open('GET', url, true);
        request.send();
      });
    });

    return this;
  }

  then (callback = () => {}) {
    this._promise = this._promise.then(() =>
      callback(this._responses)
    );

    return this;
  }

  catch (callback = () => {}) {
    this._promise = this._promise.then(() =>
      callback(this._errors)
    );

    return this;
  }
}

export default RequestWithXHR;
