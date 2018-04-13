import { XMLHttpRequest } from 'xmlhttprequest';

class RequestWithXHR {
  constructor () {
    this._responses = [];
    this._promise = Promise.resolve();
  }

  get (url, onResolve = () => {}, onReject = () => {}) {
    this._promise = this._promise.then(() => {
      return new Promise(resolve => {
        const request = new XMLHttpRequest();
        const self = this;

        request.addEventListener('load', function (event) {
          self._responses = [this, ...self._responses];

          if (this.status === 200) {
            onResolve(request, self._responses);
            resolve();
          } else {
            onReject(request, self._responses);
            resolve();
          }
        });
        request.addEventListener('error', function (event) {
          self._responses = [this, ...self._responses];
          onReject(request, self._responses);
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
      callback(null, this._responses)
    );

    return this;
  }
}

export default RequestWithXHR;
