import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import theoretically from "jest-theories";
import { Runner, Suite } from "mocha";
import { Outcome } from "./enums/testPlan.enums";
import cypressAzureReporter from "./index";
import * as testPlan from "./testPlan";
import { createMockRunner, createRunReporterFunction } from "./testUtils";

let mock;

beforeAll(() => {
  mock?.reset();
});

beforeEach(() => {
  jest.clearAllMocks();
  mock = new MockAdapter(axios);
});

const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_RUN_END } = Runner.constants;

const runReporter = createRunReporterFunction(cypressAzureReporter);

const createBaseOptions = () => ({
  reporterOptions: {
    pat: "",
    organisation: "",
    planId: "",
    project: "",
    runName: "",
  },
});

describe("validate", () => {
  test("should throw error if options not provided", () => {
    const suite = new Suite("test suite");
    const runner = new Runner(suite);

    expect(() => {
      cypressAzureReporter.call({}, runner, {});
    }).toThrow("Missing reporterOptions in cypress.json");
  });

  const theories = ["pat", "organisation", "planId", "project"];

  theoretically(
    (theory) => `should throw error if '${theory}' isn't provided`,
    theories,
    (theory) => {
      const options = createBaseOptions();
      const suite = new Suite("test suite");
      const runner = new Runner(suite);

      delete options.reporterOptions[theory];

      expect(() => {
        cypressAzureReporter.call({}, runner, options);
      }).toThrow(
        `Missing '${theory}' value. Please update reporterOptions in cypress.json`
      );
    }
  );
});

describe("passed", () => {
  describe("should add new passed testResult for all testCaseIds in test title:", () => {
    const theories = [
      { title: "", expectedResultIds: [] },
      { title: "123", expectedResultIds: [] },
      { title: "Nothing to see here", expectedResultIds: [] },
      { title: "C123", expectedResultIds: [123] },
      { title: "C123", expectedResultIds: [123] },
      { title: "Extra stuff C123", expectedResultIds: [123] },
      { title: "Two test ids C123, C321", expectedResultIds: [123, 321] },
    ];
    theoretically("'{title}'", theories, ({ title, expectedResultIds }) => {
      const mockAddResult = jest.spyOn(testPlan, "addResult");

      const options = createBaseOptions();

      var test = {
        slow: () => {},
        title,
      };

      const runner = createMockRunner(
        "pass",
        EVENT_TEST_PASS,
        null,
        null,
        test,
        null
      );

      runReporter({}, runner, options);

      expect(mockAddResult).toHaveBeenCalledTimes(expectedResultIds.length);

      // test resulting testPlan from final call to mockAddResult
      if (mockAddResult.mock.results.length > 0) {
        const finalResults =
          mockAddResult.mock.results[expectedResultIds.length - 1].value
            .testResults;
        expect(
          finalResults.every(({ outcome }) => outcome === Outcome.Passed)
        ).toBe(true);

        const finalResultTestIds = finalResults.map(
          ({ testCaseId }) => testCaseId
        );
        expect(finalResultTestIds).toStrictEqual(expectedResultIds);
      }
    });
  });
});

describe("failed", () => {
  describe("should add new failed testResult for all testCaseIds in test with title", () => {
    const theories = [
      { title: "", expectedResultIds: [] },
      { title: "123", expectedResultIds: [] },
      { title: "Nothing to see here", expectedResultIds: [] },
      { title: "C123", expectedResultIds: [123] },
      { title: "C123", expectedResultIds: [123] },
      { title: "Extra stuff C123", expectedResultIds: [123] },
      { title: "Two test ids C123, C321", expectedResultIds: [123, 321] },
    ];
    theoretically("'{title}'", theories, ({ title, expectedResultIds }) => {
      const mockAddResult = jest.spyOn(testPlan, "addResult");

      const options = createBaseOptions();

      var test = {
        slow: () => {},
        title,
      };

      const runner = createMockRunner(
        "pass",
        EVENT_TEST_FAIL,
        null,
        null,
        test,
        null
      );

      runReporter({}, runner, options);

      expect(mockAddResult).toHaveBeenCalledTimes(expectedResultIds.length);

      // test resulting testPlan from final call to mockAddResult
      if (mockAddResult.mock.results.length > 0) {
        const finalResults =
          mockAddResult.mock.results[expectedResultIds.length - 1].value
            .testResults;
        expect(
          finalResults.every(({ outcome }) => outcome === Outcome.Failed)
        ).toBe(true);

        const finalResultTestIds = finalResults.map(
          ({ testCaseId }) => testCaseId
        );
        expect(finalResultTestIds).toStrictEqual(expectedResultIds);
      }
    });
  });
});
