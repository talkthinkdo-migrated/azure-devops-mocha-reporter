import { reporters, Runner } from "mocha";

interface ReporterOptions {
  pat: string;
  organisation: string;
  project: string;
  planId: string;
}

type ReporterOptionKeys = keyof ReporterOptions;

interface Options {
  reporterOptions: ReporterOptions
}

function cypressAzureReporter(runner: Runner, options: Options) {

  const {
    EVENT_RUN_BEGIN,
    // EVENT_RUN_END,
    // EVENT_TEST_FAIL,
    // EVENT_TEST_PASS,
    // EVENT_SUITE_BEGIN,
    // EVENT_SUITE_END
  } = Runner.constants;

  reporters.Base.call(this, runner);

  const { reporterOptions } = options;

  validate(reporterOptions, 'pat');
  validate(reporterOptions, 'organisation');
  validate(reporterOptions, 'project');
  validate(reporterOptions, 'planId');

  runner.on(EVENT_RUN_BEGIN, () => {
    write('start')
  })
}

function write(str: string) {
  process.stdout.write(str);
}

function validate (options: ReporterOptions, name: ReporterOptionKeys) {
  if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
  }
  if (options[name] == null) {
      throw new Error("Missing '" + name + "' value. Please update reporterOptions in cypress.json");
  }
};

export = cypressAzureReporter;
