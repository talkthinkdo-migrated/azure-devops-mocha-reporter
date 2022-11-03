import { afterRunHook, beforeRunHook } from "./index";
import * as screenShots from "./attachScreenShots";
import * as testRunEnd from "../onTestRunEnd";

const baseResults = {
  runs: [],
  testRun: {},
};

const baseReporterOptions = {
  config: {
    reporterOptions: {
      shouldAttachScreenShotsToTestResults: false,
    },
  },
};
describe("afterRunHook", () => {
  describe("shouldAttachScreenShotsToTestResults", () => {
    test("if false, should not call `attachScreenShots`", async () => {
      jest.spyOn(testRunEnd, "onTestRunEnd").mockImplementation();

      const mockAttachScreenShots = jest.spyOn(
        screenShots,
        "attachScreenShots"
      );

      const reporterOptions = { ...baseReporterOptions };

      await beforeRunHook(reporterOptions);
      await afterRunHook(baseResults);

      expect(mockAttachScreenShots).not.toHaveBeenCalled();
    });
  });
  test("if true, should call `attachScreenShots`", async () => {
    jest.spyOn(testRunEnd, "onTestRunEnd").mockImplementation();

    const mockAttachScreenShots = jest
      .spyOn(screenShots, "attachScreenShots")
      .mockImplementation(() => {});

    const options = { ...baseReporterOptions };
    options.config.reporterOptions.shouldAttachScreenShotsToTestResults = true;

    await beforeRunHook(options);
    await afterRunHook(baseResults);

    expect(mockAttachScreenShots).toHaveBeenCalled();
  });
});
