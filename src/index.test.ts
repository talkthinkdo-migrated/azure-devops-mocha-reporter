import cypressAzureReporter from "./index";
import { Runner, Suite } from 'mocha'
import theoretically from 'jest-theories';
import { createMockRunner, createRunReporterFunction } from './testUtils'
import * as utils from './utils';

const {
  EVENT_RUN_BEGIN,
  // EVENT_RUN_END,
  // EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Runner.constants;

const runReporter = createRunReporterFunction(cypressAzureReporter);

const createBaseOptions = () => ({
  reporterOptions: {
    pat: '',
    organisation: '',
    planId: '',
    project: '',
  }
});

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

  theoretically((theory) => `should throw error if '${theory}' isn't provided`, theories, (theory) => {
    const options = createBaseOptions();
    const suite = new Suite('test suite')
    const runner = new Runner(suite);

    delete options.reporterOptions[theory];

    expect(() => {
      cypressAzureReporter.call({}, runner, options)
    }).toThrow(`Missing '${theory}' value. Please update reporterOptions in cypress.json`)

  })
});

describe('EVENT_RUN_BEGIN', () => {
  const options = createBaseOptions();
  
  
  test('logs start', () => {
    var suite = {
      root: false,
      title: 'some title'
    };

    const runner = createMockRunner(
      'start',
      EVENT_RUN_BEGIN,
      null,
      null,
      suite,
      null
    );
    
    runReporter({}, runner, options, false);

    expect(process.stdout.write).toBeCalledWith(`Cypress to azure run started`)
  })
})

describe('EVENT_RUN_PASS', () => {
  test('should call `getCaseIdsFromTitle`', () => {
    const mockGetCaseIdsFromTitle = jest.spyOn(utils, 'getCaseIdsFromTitle');

    const options = createBaseOptions();

    const testTitle = 'test title #1234';

    var test = {
      duration: 1,
      slow: function () {
        return 2;
      },
      title: testTitle
    };

    const runner = createMockRunner(
      'pass',
      EVENT_TEST_PASS,
      null,
      null,
      test,
      null
    );
    
    runReporter({}, runner, options, false);

    expect(mockGetCaseIdsFromTitle).toHaveBeenCalledWith(testTitle);

  })
})

