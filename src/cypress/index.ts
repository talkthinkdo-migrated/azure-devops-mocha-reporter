/// <reference types="cypress" />

import path from "path";
import { TestPlan } from "../interfaces/testPlan.interfaces";
import { onTestFail } from "../onTestFail";
import { onTestPass } from "../onTestPass";
import { onTestRunEnd } from "../onTestRunEnd";
import { createTestPlan } from "../testPlan";

let testPlan: TestPlan | null = null;

export const beforeRunHook = async (details: Cypress.BeforeRunDetails) => {
  const reporterOptions = getReporterConfig(details);

  testPlan = createTestPlan(reporterOptions);
};

export const afterRunHook = async (
  results: CypressCommandLine.CypressRunResult
) => {
  const tests = getMochaFormattedTestResults(results);

  // create azure artifact which contains screenshots
  // add screenshot urls to

  tests
    .map((test) => ({
      state: test.state,
      title: test.title.join(),
    }))
    .forEach((test) => {
      if (test.state === "passed") {
        onTestPass({ test, testPlan });
      } else if (test.state === "failed") {
        onTestFail({ test, testPlan });
      }
    });

  await onTestRunEnd(testPlan);
};

const getMochaFormattedTestResults = (
  results: CypressCommandLine.CypressRunResult
) =>
  results.runs
    .map((run) =>
      run.tests.map((test) => ({
        ...test,

        // ...test.attempts.at(-1),
        err: {
          stack: test.displayError,
        },
      }))
    )
    .flat();

const getReporterConfig = (details: Cypress.BeforeRunDetails) => {
  const configFile = details.config.reporterOptions?.configFile;
  let config;
  if (configFile !== undefined) {
    const reporterConfig = require(path.join(process.cwd(), configFile));
    config = reporterConfig.azureDevopsMochaReporterReporterOptions;
  } else {
    config = details.config.reporterOptions;
  }

  return config;
};
