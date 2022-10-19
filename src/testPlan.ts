import axios, { AxiosStatic } from "axios";
import { Outcome } from "./enums/testPlan.enums";

interface TestResult {
  testCaseId: number;
  outcome: Outcome;
}

interface TestPoint {}

interface TestPlan {
  testResults: Array<TestResult>;
}

export const createTestPlan = (options): TestPlan => {
  const testResults = [];
  const testPoints = [];
  // const prelimTestResults = [];
  const organisation = options.organisation;
  const project = options.project;
  const suiteId = options.suiteId;
  const planId = options.planId;
  const runName = options.runName;
  const http = axios.create({
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
