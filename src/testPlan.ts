import axios from "axios";
import { Outcome } from "./enums/testPlan.enums";
import { ReporterOptions } from "./interfaces/reporter.interfaces";
import { TestPlan, TestResult } from "./interfaces/testPlan.interfaces";

export const createTestPlan = (options: ReporterOptions): TestPlan => {
  const testResults: Array<TestResult> = [];
  let testRun = null;
  const organisation = options.organisation;
  const project = options.project;
  const planId = options.planId;
  const runName = options.runName;
  const shouldAttachScreenShotsToTestResults =
    options.shouldAttachScreenShotsToTestResults || false;

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
    shouldAttachScreenShotsToTestResults,
  };
};

interface AddResultOptions {
  testCaseId: number;
  outcome: Outcome;
  testPlan: TestPlan;
  stack?: string;
}

export const addResult = ({
  testPlan,
  testCaseId,
  outcome,
  stack,
}: AddResultOptions) => {
  testPlan.testResults.push({
    testCaseId,
    outcome,
    stack,
  });

  return testPlan;
};
