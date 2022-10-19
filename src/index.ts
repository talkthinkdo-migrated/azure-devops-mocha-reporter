import { reporters, Runner } from "mocha";
import { Outcome } from "./enums/testPlan.enums";
import {
  addResult,
  completeRun,
  createRun,
  createTestPlan,
  filterTestPointsByTestResult,
  getTestPoints,
  getTestSuites,
  mapSuiteIds,
  mapTestPointToAzureTestResult,
  submitTestResults,
} from "./testPlan";
import {
  flatten,
  getCaseIdsFromTitle,
  map,
  pipe,
  pipeLog,
  tap,
  write,
} from "./utils";

interface ReporterOptions {
  pat: string;
  organisation: string;
  project: string;
  planId: string;
}

type ReporterOptionKeys = keyof ReporterOptions;

interface Options {
  reporterOptions: ReporterOptions;
}

function cypressAzureReporter(runner: Runner, options: Options) {
  const { EVENT_RUN_BEGIN, EVENT_RUN_END, EVENT_TEST_FAIL, EVENT_TEST_PASS } =
    Runner.constants;

  reporters.Base.call(this, runner);

  const { reporterOptions } = options;

  validate(reporterOptions, "pat");
  validate(reporterOptions, "organisation");
  validate(reporterOptions, "project");
  validate(reporterOptions, "planId");

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
        tap(createRun(testPlan)),
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
