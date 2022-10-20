import { Outcome, TestRunState } from "./enums/testPlan.enums";
import { TestPlan, TestResult } from "./interfaces/testPlan.interfaces";
import { write } from "./utils";

export const apiGet = async (testPlan: TestPlan, url: string) => {
  const response = await testPlan.azureApiRequest(url);
  return response.data.value;
};

/**
 * get all azure test suites from given plan
 * @param testPlan
 */
export const getTestSuites = async (testPlan: TestPlan) =>
  apiGet(
    testPlan,
    `/testplan/Plans/${testPlan.planId}/suites?api-version=7.1-preview.1`
  );

export const getTestPointsForSuite =
  (testPlan: TestPlan) => async (suiteId: number) =>
    apiGet(
      testPlan,
      `/testplan/Plans/${testPlan.planId}/Suites/${suiteId}/TestPoint?api-version=7.1-preview.2`
    );

export const createRun = (testPlan: TestPlan) => async () => {
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
  write(`Test run create: ${testPlan.testRun.name}:${testPlan.testRun.id}`);
};

export const completeRun = async (
  testPlan: TestPlan,
  errorMessage?: string
) => {
  if (testPlan.testRun?.id !== null) {
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
    if (testPlan.testRun === null) {
      throw new Error("TestRun has not been prepared yet for this TestPlan.");
    }
    await testPlan.azureApiRequest.post(
      `/test/runs/${testPlan.testRun.id}/results?api-version=7.1-preview.6`,
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
