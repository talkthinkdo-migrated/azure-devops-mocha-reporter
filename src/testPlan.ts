import axios from "axios";
import { getTestPointsForSuite } from "./azureApiUtils";
import { Outcome, TestRunState } from "./enums/testPlan.enums";
import { ReporterOptions } from "./interfaces/reporter.interfaces";
import {
  TestPlan,
  TestPoint,
  TestResult,
  TestSuite,
} from "./interfaces/testPlan.interfaces";
import { flatten } from "./utils";

export const createTestPlan = (options: ReporterOptions): TestPlan => {
  const testResults: Array<TestResult> = [];
  let testRun = null;
  const organisation = options.organisation;
  const project = options.project;
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
    baseURL: "https://dev.azure.com/" + organisation + "/" + project + "/_apis",
  });

  return {
    testResults,
    azureApiRequest,
    planId,
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
    };
  };
