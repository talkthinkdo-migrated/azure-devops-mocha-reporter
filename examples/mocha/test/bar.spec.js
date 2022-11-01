/**
 * Test used when manually running reporter to test functionality
 */

const { it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;

describe("suite 1", () => {
  it("123, C321 bar baz", () => {
    expect(true).to.equal(true);
  });

  it("C2423 bar baz", () => {
    expect(true).to.equal(false);
  });
});
