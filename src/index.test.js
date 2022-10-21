import cypressAzureReporter from "./index";
import { Runner, Suite } from "mocha";
import theoretically from "jest-theories";
import { createMockRunner, createRunReporterFunction } from "./testUtils";
import * as testPlan from "./testPlan";
import { Outcome } from "./enums/testPlan.enums";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TestResult } from "./interfaces/testPlan.interfaces";

let mock;

beforeAll(() => {
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
  jest.clearAllMocks();
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

describe("run end", () => {
  test("should call the correct api endpoints in correct order", async () => {
    const planId = "PLAN_ID";
    const testSuiteId = 1000;
    const testCaseId = 2000;
    const testRunId = 3000;

    await runReporterTestRigWithAxiosMocks({
      planId
      testSuiteId
      testCaseId
      testRunId
    });

    // Create test run
    expect(mock.history.post[0].url).toContain(`/test/runs?`);

    // Get suites from plan Id
    expect(mock.history.get[0].url).toContain(
      `/testplan/plans/${planId}/suites?`
    );

    // Get test points for suites
    expect(mock.history.get[1].url).toContain(
      `/testplan/plans/${planId}/suites/${testSuiteId}/TestPoint?`
    );

    // Post test results to run
    expect(mock.history.post[1].url).toContain(
      `/test/runs/${testRunId}/results?`
    );

    // Complete test run
    expect(mock.history.patch[0].url).toContain(`/test/runs/${testRunId}?`);
    const runState = JSON.parse(mock.history.patch[0].data).state;
    expect(runState).toBe("Completed")
  });
});

const runReporterTestRigWithAxiosMocks = async ({
  planId
  testSuiteId
  testCaseId
  testRunId
}) => {
  const options = {
    reporterOptions: {
      pat: "",
      organisation: "",
      planId: planId,
      project: "",
      runName: "",
    },
  };

  var test = {
    slow: () => {},
    title: `C${testCaseId} a test`,
  };

  // mock PATCH test run
  const patchRun = new RegExp(`.*\/test/runs/${testRunId}?.*`, "i");
  mock.onPatch(patchRun).reply(200, {});

  // mock POST submit results
  const submitResults = new RegExp(
    `.*\/test/runs/${testRunId}/results?.*`,
    "i"
  );
  mock.onPost(submitResults).reply(200, {});

  // mock POST test run
  const createRun = new RegExp(`.*\/test/runs?.*`, "i");
  mock.onPost(createRun).reply(200, { id: testRunId });

  // mock GET test points
  const getTestPoints = new RegExp(
    `.*\/testplan\/plans\/${planId}\/suites\/${testSuiteId}/TestPoint.*`,
    "i"
  );
  mock
    .onGet(getTestPoints)
    .reply(200, { value: [{ testCaseReference: { id: testCaseId } }] });

  // mock GET test suites
  const getSuites = new RegExp(
    `.*\/testplan\/plans\/${planId}\/suites?.*`,
    "i"
  );
  mock.onGet(getSuites).reply(200, { value: [{ id: testSuiteId }] });

  const runner = createMockRunner(
    "pass end",
    EVENT_TEST_PASS,
    EVENT_RUN_END,
    null,
    test,
    null
  );

  runReporter({}, runner, options);

  await new Promise(process.nextTick);
};
