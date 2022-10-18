import cypressAzureReporter from "./index";
import { Runner, Suite } from 'mocha'
import theoretically from 'jest-theories';

const {
  EVENT_RUN_BEGIN,
  // EVENT_RUN_END,
  // EVENT_TEST_FAIL,
  // EVENT_TEST_PASS,
  // EVENT_SUITE_BEGIN,
  // EVENT_SUITE_END
} = Runner.constants;

describe("validate", () => {
  test("should throw error if options not provided", () => {
    const suite = new Suite('test suite')
    const runner = new Runner(suite);

    expect(() => {
      cypressAzureReporter.call({}, runner, {})
    }).toThrow('Missing reporterOptions in cypress.json')
  });

  const theories = [
    'pat',
    'organisation',
    'planId',
    'project',
  ];

  theoretically('', theories, (theory) => {
    const options = {
      reporterOptions: {
        pat: '',
        organisation: '',
        planId: '',
        project: '',
      }
    };
    const suite = new Suite('test suite')
    const runner = new Runner(suite);

    delete options.reporterOptions[theory];

    expect(() => {
      cypressAzureReporter.call({}, runner, options)
    }).toThrow(`Missing '${theory}' value. Please update reporterOptions in cypress.json`)

  })

});
