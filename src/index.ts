import { reporters, Runner } from "mocha";
import {
  completeRun,
  createRun,
  getTestSuites,
  submitTestResults,
} from "./azureApiUtils";
import { Outcome } from "./enums/testPlan.enums";
import {
  MochaReporterConfig,
  ReporterOptionKeys,
  ReporterOptions,
} from "./interfaces/reporter.interfaces";
import {
  addResult,
  createTestPlan,
  filterTestPointsByTestResult,
  getTestPoints,
  mapSuiteIds,
  mapTestPointToAzureTestResult,
} from "./testPlan";
import { flatten, getCaseIdsFromTitle, map, pipe, tap, write } from "./utils";

function cypressAzureReporter(runner: Runner, options: MochaReporterConfig) {
  const { EVENT_RUN_BEGIN, EVENT_RUN_END, EVENT_TEST_FAIL, EVENT_TEST_PASS } =
    Runner.constants;

  reporters.Base.call(this, runner);

  const { reporterOptions } = options;

  validate(reporterOptions, "pat");
  validate(reporterOptions, "organisation");
  validate(reporterOptions, "project");
  validate(reporterOptions, "planId");
  validate(reporterOptions, "runName");

  const testPlan = createTestPlan(reporterOptions);

  runner.on(EVENT_RUN_BEGIN, () => {
    write("Cypress Azure reporter started...");
  });

  runner.on(EVENT_TEST_PASS, (test) => {
    const testCaseIds = getCaseIdsFromTitle(test.title);
    testCaseIds.forEach((testCaseId) => {
      addResult(testCaseId, Outcome.Passed, testPlan);
    });
  });
  runner.on(EVENT_TEST_FAIL, (test) => {
    const testCaseIds = getCaseIdsFromTitle(test.title);
    testCaseIds.forEach((testCaseId) => {
      addResult(testCaseId, Outcome.Failed, testPlan);
    });
  });
  runner.on(EVENT_RUN_END, async () => {
    try {
      await pipe(
        getTestSuites,
        mapSuiteIds,
        getTestPoints(testPlan),
        tap(createRun(testPlan)), // <- create run before continuing
        flatten,
        filterTestPointsByTestResult(testPlan),
        map(mapTestPointToAzureTestResult(testPlan)),
        submitTestResults(testPlan),
        completeRun(testPlan),
        () => write("Cypress Azure reporter complete.")
      )(testPlan);
    } catch (error) {
      write("Cypress Azure reporter failed with:");
      write(error.message);
      write(error.stack);
      completeRun(
        testPlan,
        "Something went wrong with Cypress Azure reporter."
      );
    } finally {
      completeRun(testPlan);
    }
  });
}

function validate(options: ReporterOptions, name: ReporterOptionKeys) {
  if (options == null) {
    throw new Error("Missing reporterOptions in cypress.json");
  }
  if (options[name] == null) {
    throw new Error(
      "Missing '" +
        name +
        "' value. Please update reporterOptions in cypress.json"
    );
  }
}

export = cypressAzureReporter;
