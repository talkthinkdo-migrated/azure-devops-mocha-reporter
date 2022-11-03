import path from "path";
import {
  createTestResultAttachment,
  getTestResultsByRunId,
} from "../azureApiUtils";
import { MappedScreenShot } from "../interfaces/cypress.interfaces";
import {
  ReceivedAzureTestResult,
  TestPlan,
  TestResultAttachment,
} from "../interfaces/testPlan.interfaces";
import { createBase64FromFilePath, write } from "../utils";

export const attachScreenShots = async (
  testPlan: TestPlan,
  screenShots: MappedScreenShot[]
) => {
  try {
    const testResultsForPlan = await getTestResultsByRunId(testPlan);

    // for each Cypress Test Result, get all screenshots
    // then for each screenshot, create an attachment to the matching Azure Test Result
    return await Promise.all(
      testResultsForPlan.map(async (testResult: ReceivedAzureTestResult) => {
        const matchingScreenShots = filterScreenShotsByTestCaseId(
          screenShots,
          testResult.testCase.id
        );

        return matchingScreenShots.length > 0
          ? await createTestResultAttachmentForEachScreenShot(
              matchingScreenShots,
              testPlan,
              testResult
            )
          : await Promise.resolve(null);
      })
    );
  } catch (error) {
    if (error.response) {
      write("Request Method: " + error.config.method);
      write("Request URL: " + error.config?.url);
      write("Request Body: " + JSON.stringify(error.config.data));
      write("Response: " + error.response.data?.message);
    }
    throw new Error(error);
  }
};

const filterScreenShotsByTestCaseId = (
  screenShots: MappedScreenShot[],
  testCaseId: string
) =>
  screenShots.filter((screenShot) => {
    return screenShot.ids.includes(parseInt(testCaseId));
  });

const createTestResultAttachmentForEachScreenShot = async (
  matchingScreenShots: MappedScreenShot[],
  testPlan: TestPlan,
  testResult: ReceivedAzureTestResult
) => {
  return await Promise.all(
    matchingScreenShots.map(async (screenShot: MappedScreenShot) => {
      const base64Img = await createBase64FromFilePath(screenShot.path);

      const attachment: TestResultAttachment = {
        fileName: `Cypress Screenshot ~ ${screenShot.path
          .split(path.sep)
          .at(-1)}`,
        stream: base64Img,
      };
      return await createTestResultAttachment(testPlan, testResult, attachment);
    })
  );
};
