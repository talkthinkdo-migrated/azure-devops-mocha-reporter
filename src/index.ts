import { reporters, Runner } from "mocha";
import { Outcome } from "./enums/testPlan.enums";
import {
  MochaReporterConfig,
  ReporterOptionKeys,
  ReporterOptions,
} from "./interfaces/reporter.interfaces";
import { addResult, createTestPlan } from "./testPlan";
import { getCaseIdsFromTitle, write } from "./utils";
import { messages } from "./constants/messages";
import { onTestRunEnd } from "./onTestRunEnd";

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
    write(messages.reporterStarted);
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
  runner.on(EVENT_RUN_END, onTestRunEnd(testPlan));
}

function validate(options: ReporterOptions, name: ReporterOptionKeys) {
  if (options == null) {
    throw new Error("Missing reporterOptions");
  }
  if (options[name] == null) {
    throw new Error(
      "Missing '" + name + "' value. Please update reporterOptions"
    );
  }
}

export = cypressAzureReporter;
