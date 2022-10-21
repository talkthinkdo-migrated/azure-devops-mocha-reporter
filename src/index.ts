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
  getTestPointsFromSuiteIds,
  mapSuiteIds,
  mapTestPointToAzureTestResult,
} from "./testPlan";
import {
  getCaseIdsFromTitle,
  map,
  pipe,
  pipeLog,
  tap as sideEffect,
  write,
} from "./utils";

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
      await createRun(testPlan);

      await pipe(
        getTestSuites,
        mapSuiteIds,
        getTestPointsFromSuiteIds(testPlan),
        filterTestPointsByTestResult(testPlan),
        map(mapTestPointToAzureTestResult(testPlan)),
        submitTestResults(testPlan)
      )(testPlan);

      await completeRun(testPlan);
      write("Cypress Azure reporter complete.");
    } catch (error) {
      write("Cypress Azure reporter failed with:");
      write(error.message);
      write(error.stack);
      completeRun(
        testPlan,
        "Something went wrong with Cypress Azure reporter."
      );
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
