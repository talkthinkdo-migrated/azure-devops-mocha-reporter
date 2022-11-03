import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import theoretically from "jest-theories";
import { Runner, Suite } from "mocha";
import { Outcome } from "./enums/testPlan.enums";
import cypressAzureReporter from "./index";
import * as testPlan from "./testPlan";
import * as onTestRunEndObj from "./onTestRunEnd";
import * as onTestPassObj from "./onTestPass";
import * as onTestFailObj from "./onTestFail";
import { createMockRunner, createRunReporterFunction } from "./testUtils";
import { reporters } from "mocha";

let mock;

afterAll(() => {
  mock.reset();
});

beforeEach(() => {
  jest.restoreAllMocks();
  mock = new MockAdapter(axios);
});

const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_RUN_END, EVENT_RUN_BEGIN } =
  Runner.constants;

const runReporter = createRunReporterFunction(cypressAzureReporter);

const createBaseOptions = () => ({
  reporterOptions: {
    pat: "",
    organisation: "",
    planId: "",
    project: "",
    runName: "base options",
  },
});

describe("validate", () => {
  test("should throw error if options not provided", () => {
    const suite = new Suite("test suite");
    const runner = new Runner(suite);

    expect(() => {
      cypressAzureReporter.call({}, runner, {});
    }).toThrow("Missing reporterOptions");
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
      }).toThrow(`Missing '${theory}' value. Please update reporterOptions`);
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
        err: {
          stack: "",
        },
        slow: () => {},
        title,
      };

      const runner = createMockRunner(
        "pass",
        EVENT_TEST_PASS,
        null,
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
      // prevents reporter overwriting mocked test
      jest.spyOn(reporters, "Base").mockImplementation((reporter) => reporter);

      const mockAddResult = jest.spyOn(testPlan, "addResult");
      const options = createBaseOptions();
      const mockStackMessage = "some stack message";

      // mocked test
      var test = {
        err: {
          stack: mockStackMessage,
        },
        slow: () => {},
        title,
      };

      const runner = createMockRunner(
        "pass",
        EVENT_TEST_FAIL,
        null,
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

        expect(
          finalResults.every(({ stack }) => stack === mockStackMessage)
        ).toBe(true);

        expect(finalResultTestIds).toStrictEqual(expectedResultIds);
      }
    });
  });
});

describe("EVENT_RUN_END", () => {
  test("should call onTestRunEnd", () => {
    const mockOnTestRunEnd = jest
      .spyOn(onTestRunEndObj, "onTestRunEnd")
      .mockImplementation(() => {});

    const options = createBaseOptions();

    var test = {
      err: {
        stack: "",
      },
      slow: () => {},
      title: "some title",
    };

    const runner = createMockRunner(
      "pass end",
      EVENT_TEST_PASS,
      EVENT_RUN_END,
      null,
      null,
      test,
      null
    );

    runReporter({}, runner, options);

    expect(mockOnTestRunEnd).toHaveBeenCalledTimes(1);
  });
});

describe("isCypress", () => {
  test("if `isCypress` is true, EVENT_TEST_PASS, EVENT_TEST_FAIL & EVENT_RUN_END should do nothing", () => {
    // prevents reporter overwriting mocked test
    jest.spyOn(reporters, "Base").mockImplementation((reporter) => reporter);

    const mockOnTestPass = jest
      .spyOn(onTestPassObj, "onTestPass")
      .mockImplementation(() => {});
    const mockOnTestFail = jest
      .spyOn(onTestFailObj, "onTestFail")
      .mockImplementation(() => {});
    const mockOnTestRunEnd = jest
      .spyOn(onTestRunEndObj, "onTestRunEnd")
      .mockImplementation(() => {});

    const options = createBaseOptions();
    const testBase = {
      title: "",
      slow: () => {},
    };
    const test1 = {
      ...testBase,
    };
    const test2 = {
      ...testBase,
      err: { stack: "" },
    };
    const runner = createMockRunner(
      "test:before:run pass fail end",
      "test:before:run",
      EVENT_TEST_PASS,
      EVENT_TEST_FAIL,
      EVENT_RUN_END,
      test1,
      test2
    );

    runReporter({}, runner, options);

    expect(mockOnTestPass).not.toHaveBeenCalled();
    expect(mockOnTestFail).not.toHaveBeenCalled();
    expect(mockOnTestRunEnd).not.toHaveBeenCalled();
  });
});
