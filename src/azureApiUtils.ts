import { messages } from "./constants/messages";
import { Outcome, TestRunState } from "./enums/testPlan.enums";
import {
  TestResultAttachment as TestResultAttachment,
  TestPlan,
  TestPoint,
  TestResult,
  TestSuite,
  ReceivedAzureTestResult,
} from "./interfaces/testPlan.interfaces";
import { flatten, write } from "./utils";

export const apiGet = async (testPlan: TestPlan, url: string) => {
  const response = await testPlan.azureApiRequest.get(url);
  return response.data.value;
};

/**
 * get all azure test suites from given plan
 * @param testPlan
 */
export const getTestSuites = (testPlan: TestPlan) => async () =>
  apiGet(
    testPlan,
    `/testplan/plans/${testPlan.planId}/suites?api-version=7.1-preview.1`
  );

export const getTestPointsForSuite =
  (testPlan: TestPlan) => async (suiteId: number) =>
    apiGet(
      testPlan,
      `/testplan/plans/${testPlan.planId}/suites/${suiteId}/TestPoint?api-version=7.1-preview.2`
    );

export const createRun = async (testPlan: TestPlan) => {
  const response = await testPlan.azureApiRequest.post(
    `/test/runs?api-version=7.1-preview.3`,
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
  write(
    `Azure Devops reporter - Azure Test Run created: ${testPlan.testRun.name}:${testPlan.testRun.id}`
  );
};

export const completeRun = async (
  testPlan: TestPlan,
  errorMessage?: string
) => {
  if (testPlan.testRun?.id) {
    const response = await testPlan.azureApiRequest.patch(
      `/test/runs/${testPlan.testRun.id}?api-version=7.1-preview.3`,
      {
        state: TestRunState.Completed,
        errorMessage,
      }
    );
    return (testPlan.testRun = response.data);
  }
};

export const submitTestResults =
  (testPlan: TestPlan) => async (testResults: Array<TestResult>) => {
    await testPlan.azureApiRequest.post(
      `/test/runs/${testPlan.testRun.id}/results?api-version=7.1-preview.6`,
      testResults
    );
    const passingCount = testResults.filter(
      (result) => result.outcome === Outcome.Passed
    ).length;
    write(`Azure Devops reporter - Passing Tests Cases: ${passingCount}`);
    const failingCount = testResults.filter(
      (result) => result.outcome === Outcome.Failed
    ).length;
    write(`Azure Devops reporter - Failing Tests Cases: ${failingCount}`);
    write(messages.resultsSubmitted);
  };

export const mapSuiteIds = (suites: Array<TestSuite>) =>
  suites.map((suite) => suite.id);

export const getTestPointsFromSuiteIds =
  (testPlan: TestPlan) => async (suiteIds: number[]) => {
    const unresolvedPromises = suiteIds.map((id) =>
      getTestPointsForSuite(testPlan)(id)
    );
    const results = await Promise.all(unresolvedPromises);
    return flatten(results);
  };

export const filterTestPointsByTestResult =
  (testPlan: TestPlan) => (testPoints: Array<TestPoint>) => {
    return testPoints.filter((testPoint) =>
      testPlan.testResults
        .map((testResult) => testResult.testCaseId)
        .includes(testPoint.testCaseReference.id)
    );
  };

export const mapTestPointToAzureTestResult =
  (testPlan: TestPlan) => (testPoint: TestPoint) => {
    const result = testPlan.testResults.find(
      (result) => result.testCaseId === testPoint.testCaseReference.id
    );

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
      testPlan: {
        id: testPlan.planId,
      },
      stackTrace: result.stack,
    };
  };

export const getTestResultsByRunId = async (testPlan: TestPlan) => {
  const response = await apiGet(
    testPlan,
    `/test/runs/${testPlan.testRun.id}/results`
  );
  return response;
};

export const createTestResultAttachment = async (
  testPlan: TestPlan,
  testResult: ReceivedAzureTestResult,
  attachment: TestResultAttachment
) => {
  const response = await testPlan.azureApiRequest.post(
    `/test/runs/${testPlan.testRun.id}/results/${testResult.id}/attachments?api-version=6.0-preview.1`,
    attachment
  );

  if (response.status === 200) {
    write(
      `Azure Devops reporter - Attached screenshot for Test Case: ${testResult.testCase.id} \n "${attachment.fileName}"`
    );
  }

  return response;
};
