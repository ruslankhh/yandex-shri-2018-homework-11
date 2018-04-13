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

        const onSuccess = () => {
          const { status, statusText, responseText } = request;
          const response = {
            status,
            statusText,
            body: responseText,
            json () {
              return JSON.parse(responseText);
            }
          };

          this._responses = [...this._responses, response];
          this._errors = [...this._errors, null];

          onResolve(this._responses, this._errors);
          resolve();
        };

        const onError = () => {
          const { status, statusText, responseText } = request;
          const response = {
            status,
            statusText,
            body: responseText,
            json () {
              return {};
            }
          };
          const error = statusText;

          this._responses = [...this._responses, response];
          this._errors = [...this._errors, error];
          onReject(this._responses, this._errors);
          resolve();
        };

        request.addEventListener('load', onSuccess, false);
        request.addEventListener('error', onError, false);

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
