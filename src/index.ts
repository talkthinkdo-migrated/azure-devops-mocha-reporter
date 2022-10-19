import { reporters, Runner } from "mocha";
import { Outcome } from "./enums/testPlan.enums";
import { addResult, createTestPlan } from "./testPlan";
import { getCaseIdsFromTitle } from "./utils";

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
    write("Cypress to azure custom reporter started");
  });

  runner.on(EVENT_TEST_PASS, (test) => {
    write("test passed");
    const testCaseIds = getCaseIdsFromTitle(test.title);
    testCaseIds.forEach((testCaseId) => {
      addResult(testCaseId, Outcome.Passed, testPlan);
    });
  });
  runner.on(EVENT_TEST_FAIL, (test) => {
    write("test failed");
    const testCaseIds = getCaseIdsFromTitle(test.title);
    testCaseIds.forEach((testCaseId) => {
      addResult(testCaseId, Outcome.Failed, testPlan);
    });
  });
  runner.on(EVENT_RUN_END, () => {
    write("test complete");
  });
}

function write(str: string) {
  process.stdout.write(str);
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
