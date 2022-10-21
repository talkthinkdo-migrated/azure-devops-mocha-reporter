/* 
  Ported from here: https://github.com/mochajs/mocha/blob/master/test/reporters/helpers.js
--------------------------------------------------------------------------------------------- 
*/

// import { MochaReporterConfig } from "../interfaces/reporter.interfaces";

// interface Runner {
//   on: Function;
//   once: Function;
// }

// type CreateRunner = (
//   runStr: string,
//   ifStr1: string,
//   ifStr2: string | null,
//   ifStr3: string | null,
//   arg1: any | null,
//   arg2: any | null
// ) => Runner;

/**
 * Creates a mock runner object.
 *
 * @param runStr - argument that defines the runnerEvent
 * @param ifStr1 - runner event
 * @param [ifStr2] - runner event
 * @param [ifStr3] - runner event
 * @param [arg1] - variable to be added to event handler's scope
 * @param [arg2] - variable to be added to event handler's scope
 * @return mock runner instance
 */
export const createMockRunner = (
  runStr,
  ifStr1,
  ifStr2,
  ifStr3,
  arg1,
  arg2
) => {
  var runnerFunction = createRunnerFunction(
    runStr,
    ifStr1,
    ifStr2,
    ifStr3,
    arg1,
    arg2
  );
  var mockRunner = {
    on: runnerFunction,
    once: runnerFunction,
  };
  // createStatsCollector(mockRunner);
  return mockRunner;
};

/**
 * Creates an event handler function to be used by the runner.
 *
 * @description
 * Arguments 'ifStr1', 'ifStr2', and 'ifStr3' should be `Runner.constants`.
 *
 * @param runStr - argument that defines the runnerEvent
 * @param ifStr1 - runner event
 * @param [ifStr2] - runner event
 * @param [ifStr3] - runner event
 * @param [arg1] - variable to be added to event handler's scope
 * @param [arg2] - variable to be added to event handler's scope
 * @return event handler for the requested runner events
 */
const createRunnerFunction = (runStr, ifStr1, ifStr2, ifStr3, arg1, arg2) => {
  var test = null;
  switch (runStr) {
    case "start":
    case "pending":
    case "end":
      return function (event, callback) {
        if (event === ifStr1) {
          callback();
        }
      };
    case "pending test":
    case "pass":
    case "fail":
    case "suite":
    case "suite end":
    case "test end":
      test = arg1;
      return function (event, callback) {
        if (event === ifStr1) {
          callback(test);
        }
      };
    case "fail two args":
      test = arg1;
      var expectedError = arg2;
      return function (event, callback) {
        if (event === ifStr1) {
          callback(test, expectedError);
        }
      };
    case "start test":
      test = arg1;
      return function (event, callback) {
        if (event === ifStr1) {
          callback();
        }
        if (event === ifStr2) {
          callback(test);
        }
      };
    case "suite suite end":
      var expectedSuite = arg1;
      return function (event, callback) {
        if (event === ifStr1) {
          callback(expectedSuite);
        }
        if (event === ifStr2) {
          callback();
        }
        if (event === ifStr3) {
          callback();
        }
      };
    case "pass end":
      test = arg1;
      return function (event, callback) {
        if (event === ifStr1) {
          callback(test);
        }
        if (event === ifStr2) {
          callback();
        }
      };
    case "test end fail":
      test = arg1;
      var error = arg2;
      return function (event, callback) {
        if (event === ifStr1) {
          callback();
        }
        if (event === ifStr2) {
          callback(test, error);
        }
      };
    case "fail end pass":
      return function (event, callback) {
        test = arg1;
        if (event === ifStr1) {
          callback(test, {});
        }
        if (event === ifStr2) {
          callback(test);
        }
        if (event === ifStr3) {
          callback(test);
        }
      };
    default:
      throw Error(
        "This function does not support the runner string specified."
      );
  }
};

/**
 * Creates closure with reference to the reporter class constructor.
 *
 * @param {Function} ctor - Reporter class constructor
 * @return {createRunReporterFunction~runReporter}
 */
export function createRunReporterFunction(ctor) {
  /**
   * Run reporter using stream reassignment to capture output.
   *
   * @param stubSelf - Reporter-like stub instance
   * @param runner - Mock instance
   * @param [options] - Reporter configuration settings
   * @return Lines of output written to `stdout`
   */
  var runReporter = function (stubSelf, runner, options) {
    jest.spyOn(process.stdout, "write");
    const stdout = [];

    Object.setPrototypeOf(stubSelf, ctor.prototype);

    ctor.call(stubSelf, runner, options);

    return stdout;
  };

  return runReporter;
}
