import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import theoretically from "jest-theories";
import * as azureUtils from "./azureApiUtils";
import { messages } from "./constants/messages";
import { onTestRunEnd } from "./onTestRunEnd";
import * as testPlan from "./testPlan";
import * as utils from "./utils";

let mock;

afterAll(() => {
  mock.reset();
});

beforeEach(() => {
  jest.restoreAllMocks();
  mock = new MockAdapter(axios);
});

describe("onTestRunEnd", () => {
  test("when successful, should call the correct api endpoints in correct order", async () => {
    const planId = "PLAN_ID";
    const testSuiteId = 1000;
    const testCaseId = 2000;
    const testRunId = 3000;

    const testPlanInstance = testPlan.createTestPlan({
      organisation: "",
      planId,
      project: "",
      runName: "my test run",
      pat: "",
    });

    setUpPassingMocks(planId, testCaseId, testRunId, testSuiteId);

    // add fake test results
    testPlanInstance.testResults.push({ testCaseId });

    await onTestRunEnd(testPlanInstance);

    // Get suites from plan Id
    expect(mock.history.get[0].url).toContain(
      `/testplan/plans/${planId}/suites?`
    );

    // Get test points for suites
    expect(mock.history.get[1].url).toContain(
      `/testplan/plans/${planId}/suites/${testSuiteId}/TestPoint?`
    );

    // Create test run
    expect(mock.history.post[0].url).toContain(`/test/runs?`);

    // Post test results to run
    expect(mock.history.post[1].url).toContain(
      `/test/runs/${testRunId}/results?`
    );

    // Complete test run
    expect(mock.history.patch[0].url).toContain(`/test/runs/${testRunId}?`);
    const runState = JSON.parse(mock.history.patch[0].data).state;
    expect(runState).toBe("Completed");
  });

  test("should handle no matching test cases correctly", async () => {
    const mockWrite = jest.spyOn(utils, "write");
    const errorMessage = "some error";

    const planId = "PLAN_ID";
    const testSuiteId = 1000;
    const testCaseId = 2000;
    const testRunId = 3000;

    const testPlanInstance = testPlan.createTestPlan({
      organisation: "",
      planId,
      project: "",
      runName: "Run with no matching test cases",
      pat: "",
    });

    setUpPassingMocks(planId, testCaseId, testRunId, testSuiteId);

    // add fake test results
    testPlanInstance.testResults.push({ testCaseId });

    // mock GET test points
    const getTestPoints = new RegExp(
      `.*\/testplan\/plans\/${planId}\/suites\/${testSuiteId}/TestPoint.*`,
      "i"
    );
    mock.onGet(getTestPoints).reply(200, { value: [] });

    // mock GET test suites
    mockGetTestSuites({ planId, testSuiteId });

    await onTestRunEnd(testPlanInstance);

    expect(mockWrite).toHaveBeenCalledTimes(2);
    expect(mockWrite).toHaveBeenCalledWith(messages.testsDoNotContainTestIds);
  });

  describe("api call errors are caught:", () => {
    const theories = [
      { requestName: "getTestSuites", mockWithFailureFn: mockGetTestSuites },
      { requestName: "getTestPoints", mockWithFailureFn: mockGetTestPoints },
      { requestName: "createRun", mockWithFailureFn: mockCreateRun },
      {
        requestName: "postSubmitResults",
        mockWithFailureFn: mockSubmitResults,
      },
    ];

    theoretically(
      "should handle error correctly when {requestName} fails AND provide request details in error message",
      theories,
      async ({ mockWithFailureFn }) => {
        const mockWrite = jest.spyOn(utils, "write");

        const planId = "PLAN_ID";
        const testSuiteId = 1000;
        const testCaseId = 2000;
        const testRunId = 3000;

        const testPlanInstance = testPlan.createTestPlan({
          organisation: "",
          planId,
          project: "",
          runName: "my test run",
          pat: "",
        });

        testPlanInstance.testResults.push({
          testCaseId,
        });

        setUpPassingMocks(planId, testCaseId, testRunId, testSuiteId);

        // override single api mock
        const errorMessage = "some error";
        const requestRegex = mockWithFailureFn({
          planId,
          testCaseId,
          testSuiteId,
          testRunId,
          shouldFail: true,
          errorMessage,
        });

        await temporarilyPauseJestErrorLogging(async () => {
          try {
            await onTestRunEnd(testPlanInstance);
          } catch {
            expect(mockWrite).toHaveBeenCalledWith(
              expect.stringMatching(requestRegex)
            );
            expect(mockWrite).toHaveBeenCalledWith("Response: " + errorMessage);
          }
        });

        expect.assertions(2);
      }
    );
  });

  test("if error is caught after Test Run is created, should complete Test Run", async () => {
    const planId = "PLAN_ID";
    const testSuiteId = 1000;
    const testCaseId = 2000;
    const testRunId = 3000;

    const mockCompleteRun = jest.spyOn(azureUtils, "completeRun");

    const testPlanInstance = testPlan.createTestPlan({
      organisation: "",
      planId,
      project: "",
      runName: "my test run",
      pat: "",
    });

    testPlanInstance.testResults.push({
      testCaseId,
    });

    setUpPassingMocks(planId, testCaseId, testRunId, testSuiteId);

    // override single api mock
    const errorMessage = "some error";
    const requestRegex = mockSubmitResults({
      testRunId,
      shouldFail: true,
      errorMessage,
    });

    await temporarilyPauseJestErrorLogging(async () => {
      try {
        await onTestRunEnd(testPlanInstance);
      } catch (error) {
        expect(mockCompleteRun).toHaveBeenLastCalledWith(
          expect.any(Object),
          expect.stringContaining(messages.reportedFailedWith)
        );
      }
    });

    expect.assertions(1);
  });

  test("if error is caught after Test Run is created, should skip complete Test Run", async () => {
    const planId = "PLAN_ID";
    const testSuiteId = 1000;
    const testCaseId = 2000;
    const testRunId = 3000;

    const mockCompleteRun = jest.spyOn(azureUtils, "completeRun");

    const testPlanInstance = testPlan.createTestPlan({
      organisation: "",
      planId,
      project: "",
      runName: "my test run",
      pat: "",
    });

    testPlanInstance.testResults.push({
      testCaseId,
    });

    setUpPassingMocks(planId, testCaseId, testRunId, testSuiteId);

    // override single api mock
    const errorMessage = "some error";
    const requestRegex = mockGetTestPoints({
      planId,
      testSuiteId,
      testCaseId,
      shouldFail: true,
      errorMessage,
    });

    await temporarilyPauseJestErrorLogging(async () => {
      try {
        await onTestRunEnd(testPlanInstance);
      } catch (error) {
        expect(mockCompleteRun).not.toHaveBeenCalled();
      }
    });

    expect.assertions(1);
  });
});

const setUpPassingMocks = (planId, testCaseId, testRunId, testSuiteId) => {
  // mock PATCH test run
  mockPatchRun({ testRunId });

  // mock POST submit results
  mockSubmitResults({ testRunId });

  // mock POST test run
  mockCreateRun({ testRunId });

  // mock GET test points
  mockGetTestPoints({ planId, testSuiteId, testCaseId });

  // mock GET test suites
  mockGetTestSuites({ planId, testSuiteId });
};

function mockPatchRun({ testRunId, shouldFail = false, errorMessage }) {
  const regex = new RegExp(`.*\/test/runs/${testRunId}?.*`, "i");
  if (shouldFail === false) {
    mock.onPatch(regex).reply(200, {});
  } else {
    mock.onPatch(regex).reply(500, { errorCode: 0, message: errorMessage });
  }

  return regex;
}

function mockSubmitResults({ testRunId, shouldFail = false, errorMessage }) {
  const regex = new RegExp(`.*\/test/runs/${testRunId}/results?.*`, "i");
  if (shouldFail === false) {
    mock.onPost(regex).reply(200, {});
  } else {
    mock.onPost(regex).reply(500, { errorCode: 0, message: errorMessage });
  }

  return regex;
}

function mockCreateRun({ testRunId, shouldFail = false, errorMessage = "" }) {
  const regex = new RegExp(`.*\/test/runs?.*`, "i");
  if (shouldFail === false) {
    mock.onPost(regex).reply(200, { id: testRunId, name: "test run name" });
  } else {
    mock.onPost(regex).reply(500, { errorCode: 0, message: errorMessage });
  }

  return regex;
}

function mockGetTestPoints({
  planId,
  testSuiteId,
  testCaseId,
  shouldFail = false,
  errorMessage,
}) {
  const regex = new RegExp(
    `.*\/testplan\/plans\/${planId}\/suites\/${testSuiteId}/TestPoint.*`,
    "i"
  );
  if (shouldFail === false) {
    mock
      .onGet(regex)
      .reply(200, { value: [{ testCaseReference: { id: testCaseId } }] });
  } else {
    mock.onGet(regex).reply(500, { errorCode: 0, message: errorMessage });
  }

  return regex;
}

function mockGetTestSuites({
  planId,
  testSuiteId,
  shouldFail = false,
  errorMessage = "",
}) {
  const regex = new RegExp(`.*\/testplan\/plans\/${planId}\/suites?.*`, "i");

  if (shouldFail === false) {
    mock.onGet(regex).reply(200, { value: [{ id: testSuiteId }] });
  } else {
    mock.onGet(regex).reply(500, { errorCode: 0, message: errorMessage });
  }

  return regex;
}

/**
 * pauses jest error logging while in try-catch.
 * top level catch throws it's own error, as well as extra logs
 * this stops jest outputting confusing logs to console
 * @param {function} tryCatchCallback
 */
const temporarilyPauseJestErrorLogging = async (tryCatchCallback) => {
  // prevents Jest logging errors when tests pass
  const mockStdOut = jest.spyOn(process.stdout, "write");
  mockStdOut.mockImplementation(() => {});

  await tryCatchCallback();

  mockStdOut.mockRestore();
};
