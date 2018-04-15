/* global XMLHttpRequest */
class RequestWithXHR {
  constructor () {
    this._responses = [];
    this._errors = [];
    this._promise = Promise.resolve();
  }

  get (url, onResolve = () => {}, onReject = () => {}) {
    this._promise = this._promise
      .then(() => {
        const promise = new Promise((resolve, reject) => {
          const request = new XMLHttpRequest();

          request.onload = function () {
            const { status, statusText, response: responseBody, responseText } = request;
            const body = 'response' in request ? responseBody : responseText;
            const response = {
              status,
              statusText,
              body,
              url: request.responseURL,
              clone () {
                return { ...response };
              },
              json () {
                return new Promise(resolve => resolve(JSON.parse(this.body)));
              }
            };

            resolve(response);
          };

          request.onerror = function () {
            reject(new TypeError('Network request failed'));
          };

          request.ontimeout = function () {
            reject(new TypeError('Network request failed'));
          };

          request.open('GET', url, true);
          request.send();
        });

        return promise
          .then(response => {
            this._responses = [...this._responses, response];
            this._errors = [...this._errors, null];

            return onResolve(this._responses, this._errors);
          })
          .catch(error => {
            this._responses = [...this._responses, null];
            this._errors = [...this._errors, error];

            return onReject(this._responses, this._errors);
          });
      });

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

export default RequestWithXHR;
