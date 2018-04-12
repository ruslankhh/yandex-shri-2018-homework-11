const { describe, it } = require('mocha');
const { expect } = require('chai');

// const Request = require('../src/Request');

describe('Request', () => {
  it('тест', () => {
    const expected = true;
    const result = true;

    expect(result).to.deep.equal(expected);
  });
});
