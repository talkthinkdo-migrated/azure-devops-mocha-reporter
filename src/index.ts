import { reporters, Runner } from "mocha";
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
  const testPlans: number[] = [];

  const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
  } = Runner.constants;

  reporters.Base.call(this, runner);

  const { reporterOptions } = options;

  validate(reporterOptions, "pat");
  validate(reporterOptions, "organisation");
  validate(reporterOptions, "project");
  validate(reporterOptions, "planId");

  runner.on(EVENT_RUN_BEGIN, () => {
    write("Cypress to azure run started");
  });

  runner.on(EVENT_TEST_FAIL, (test) => {
    write("test failed");
  });
  runner.on(EVENT_RUN_END, (test) => {
    write("test complete");
  });
  runner.on(EVENT_TEST_PASS, (test) => {
    const testIds = getCaseIdsFromTitle(test.title);
    // testPlans = testIds.map();
    write("test passed");
  });
  runner.on(EVENT_SUITE_BEGIN, (test) => {
    write("test suite started");
  });
  runner.on(EVENT_SUITE_END, (test) => {
    write("test suite ended");
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
