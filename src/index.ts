import { reporters, Runner } from "mocha";

function cypressAzureReporter(runner: any, options: any) {
  
  const {
    EVENT_RUN_BEGIN,
    // EVENT_RUN_END,
    // EVENT_TEST_FAIL,
    // EVENT_TEST_PASS,
    // EVENT_SUITE_BEGIN,
    // EVENT_SUITE_END
  } = Runner.constants;

  reporters.Base.call(this, runner);

  runner.on(EVENT_RUN_BEGIN, () => {
    write('start\n')
  })
}

function write(str: string){
  process.stdout.write(str)
}

export = cypressAzureReporter;
