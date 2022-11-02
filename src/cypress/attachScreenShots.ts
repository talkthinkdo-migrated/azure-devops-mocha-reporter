import { createReadStream } from "fs";
import {
  createTestResultAttachment,
  getTestResultsByRunId,
} from "../azureApiUtils";
import { MappedScreenShot } from "../interfaces/cypress.interfaces";
import {
  TestResultAttachment,
  ReceivedAzureTestResult,
  TestPlan,
} from "../interfaces/testPlan.interfaces";
import { pipe, streamToString } from "../utils";

export const attachScreenShots = async (
  testPlan: TestPlan,
  screenShots: MappedScreenShot[]
) => {
  const testResultsForPlan = await getTestResultsByRunId(testPlan);

  const unresolvedPromises = testResultsForPlan.map(
    async (testResult: ReceivedAzureTestResult) => {
      const matchingScreenShots = screenShots.filter((screenShot) => {
        return screenShot.ids.includes(parseInt(testResult.testCase.id));
      });

      if (matchingScreenShots.length > 0) {
        const unresolvedPromises2 = matchingScreenShots.map(
          async (screenShot) => {
            const base64Img = await pipe(
              createReadStream,
              streamToString
            )(screenShot.path);

            const attachment: TestResultAttachment = {
              fileName: "cypress-screenshot.png",
              stream: base64Img,
            };
            return await createTestResultAttachment(
              testPlan,
              testResult,
              attachment
            );
          }
        );

        return await Promise.all(unresolvedPromises2);
      } else {
        return Promise.resolve();
      }
    }
  );
  return await Promise.all(unresolvedPromises);
};
