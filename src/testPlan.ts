import axios, { AxiosInstance } from "axios";
import { Outcome, TestRunState } from "./enums/testPlan.enums";
import { callApi, write } from "./utils";

interface TestResult {
  testCaseId: number;
  outcome: Outcome;
}

interface TestPoint {}

export interface TestPlan {
  testResults: Array<TestResult>;
  planId: string;
  runName: string;
  azureApiRequest: AxiosInstance;
  baseUrl: string;
  testRun: any;
}

export const createTestPlan = (options): TestPlan => {
  const testResults = [];
  let testRun = null;
  // const prelimTestResults = [];
  const organisation = options.organisation;
  const project = options.project;
  // const suiteId = options.suiteId;
  const planId = options.planId;
  const runName = options.runName;
  const azureApiRequest = axios.create({
    headers: {
      Authorization:
        "Basic " + Buffer.from(":" + options.pat).toString("base64"),
    },
    params: {
      Authorization: "Basic " + options.pat,
    },
  });
  const baseUrl =
    "https://dev.azure.com/" + organisation + "/" + project + "/_apis";

  return {
    testResults,
    azureApiRequest,
    planId,
    baseUrl,
    runName,
    testRun,
  };
};

export const addResult = (
  testCaseId: number,
  outcome: Outcome,
  testPlan: TestPlan
) => {
  testPlan.testResults.push({
    testCaseId,
    outcome,
  });

  return testPlan;
};

/**
 * get all azure test suites from given plan
 * @param testPlan
 */
export const getTestSuites = async (testPlan: TestPlan) =>
  callApi(
    testPlan,
    `${testPlan.baseUrl}/testplan/Plans/${testPlan.planId}/suites?api-version=7.1-preview.1`
  );

export const mapSuiteIds = (suites) => suites.map((suite) => suite.id);

export const getTestPoints =
  (testPlan: TestPlan) => async (suiteIds: number[]) => {
    const unresolvedPromises = suiteIds.map((id) =>
      getTestPointsForSuite(testPlan)(id)
    );
    const results = await Promise.all(unresolvedPromises);
    return results;
  };

export const getTestPointsForSuite =
  (testPlan: TestPlan) => async (suiteId: number) =>
    callApi(
      testPlan,
      `${testPlan.baseUrl}/testplan/Plans/${testPlan.planId}/Suites/${suiteId}/TestPoint?api-version=7.1-preview.2`
    );

export const createRun = (testPlan: TestPlan) => async () => {
  const response = await testPlan.azureApiRequest.post(
    `${testPlan.baseUrl}/test/runs?api-version=7.1-preview.3`,
    {
      automated: true,
      pointIds: [],
      state: TestRunState.InProgress,
      name: testPlan.runName,
      plan: {
        id: testPlan.planId,
      },
    }
  );
  testPlan.testRun = response.data;
  write(`Test run create: ${testPlan.testRun.name}:${testPlan.testRun.id}`);
};

export const completeRun = async (
  testPlan: TestPlan,
  errorMessage?: string
) => {
  if (testPlan.testRun?.id !== null) {
    const response = await testPlan.azureApiRequest.patch(
      `${testPlan.baseUrl}/test/runs/${testPlan.testRun.id}?api-version=7.1-preview.3`,
      {
        state: TestRunState.Completed,
        errorMessage,
      }
    );
    testPlan.testRun = response.data;
  }
};

export const filterTestPointsByTestResult =
  (testPlan: TestPlan) => (testPoints) => {
    return testPoints.filter((testPoint) =>
      testPlan.testResults
        .map((testResult) => testResult.testCaseId)
        .includes(testPoint.testCaseReference.id)
    );
  };

export const mapTestPointToAzureTestResult =
  (testPlan: TestPlan) => (testPoint) => {
    const result = testPlan.testResults.find(
      (result) => result.testCaseId === testPoint.testCaseReference.id
    );

    if (result === undefined) {
      throw Error("No test case matching testCaseReference.id");
    }

    return {
      testPoint: {
        id: testPoint.id,
      },
      testCase: {
        id: result.testCaseId,
      },
      testCaseTitle: testPoint.testCaseReference.name,
      testRun: {
        id: testPlan.testRun.id,
      },
      testCaseRevision: 1,
      outcome: result.outcome,
      state: TestRunState.Completed,
    };
  };

export const submitTestResults =
  (testPlan: TestPlan) => async (testResults) => {
    if (testPlan.testRun === null) {
      throw new Error("TestRun has not been prepared yet for this TestPlan.");
    }
    await testPlan.azureApiRequest.post(
      `${testPlan.baseUrl}/test/runs/${testPlan.testRun.id}/results?api-version=7.1-preview.6`,
      testResults
    );

    const passingCount = testResults.filter(
      (result) => result.outcome === Outcome.Passed
    ).length;
    write(`Passing tests: ${passingCount}`);

    const failingCount = testResults.filter(
      (result) => result.outcome === Outcome.Failed
    ).length;
    write(`Failing tests: ${failingCount}`);

    write("Results submitted");
  };
