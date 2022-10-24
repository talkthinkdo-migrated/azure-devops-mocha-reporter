/**
 * Test used when manually running reporter to test functionality
 */

const { it } = require("mocha");
const chai = require("chai");
const expect = chai.expect;

it("C2423, C321 foo bar", () => {
  expect(true).to.equal(true);
});

it("C111 foo bar", () => {
  expect(true).to.equal(false);
});
