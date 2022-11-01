import { reporters, Runner } from "mocha";
import {
  MochaReporterConfig,
  ReporterOptionKeys,
  ReporterOptions,
} from "./interfaces/reporter.interfaces";
import { createTestPlan } from "./testPlan";
import { write } from "./utils";
import { messages } from "./constants/messages";
import { onTestRunEnd } from "./onTestRunEnd";
import { onTestPass } from "./onTestPass";
import { onTestFail } from "./onTestFail";
import { FormattedMochaTest } from "./interfaces/testPlan.interfaces";

function cypressAzureReporter(runner: Runner, options: MochaReporterConfig) {
  let isCypress = false;

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

  runner.on("test:before:run", () => {
    // cypress specific event
    // if this is called, all other Mocha events should do nothing
    // Cypress reporting is handled via a plugin
    isCypress = true;
  });

  runner.on(EVENT_RUN_BEGIN, () => {
    write(messages.reporterStarted);
  });

  runner.on(EVENT_TEST_PASS, (test) => {
    if (isCypress === false) {
      const formattedTest: FormattedMochaTest = {
        title: test.title,
      };
      onTestPass({ test: formattedTest, testPlan });
    }
  });
  runner.on(EVENT_TEST_FAIL, (test) => {
    if (isCypress === false) {
      const formattedTest: FormattedMochaTest = {
        title: test.title,
        errorStack: test.err.stack,
      };
      onTestFail({ test: formattedTest, testPlan });
    }
  });
  runner.on(EVENT_RUN_END, () => {
    if (isCypress === false) {
      onTestRunEnd(testPlan);
    }
  });
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
