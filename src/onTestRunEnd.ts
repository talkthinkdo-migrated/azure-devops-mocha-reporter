import {
  completeRun,
  createRun,
  filterTestPointsByTestResult,
  getTestPointsFromSuiteIds,
  getTestSuites,
  mapSuiteIds,
  mapTestPointToAzureTestResult,
  submitTestResults,
} from "./azureApiUtils";
import { messages } from "./constants/messages";
import { TestPlan } from "./interfaces/testPlan.interfaces";
import { map, pipe, write } from "./utils";

export const onTestRunEnd = (testPlan: TestPlan) => async () => {
  try {
    const matchingTestPoints = await pipe(
      getTestSuites(testPlan),
      mapSuiteIds,
      getTestPointsFromSuiteIds(testPlan),
      filterTestPointsByTestResult(testPlan)
    )();
    if (matchingTestPoints.length > 0) {
      await createRun(testPlan);

      await pipe(
        map(mapTestPointToAzureTestResult(testPlan)),
        submitTestResults(testPlan)
      )(matchingTestPoints);

      await completeRun(testPlan);
    } else {
      write(messages.testsDoNotContainTestIds);
    }
    write(messages.reporterComplete);
  } catch (error) {
    write(messages.reportedFailedWith);
    if (error.response) {
      write("Request Method: " + error.config.method);
      write("Request URL: " + error.config?.url);
      write("Request Body: " + JSON.stringify(error.config.data));
      write("Response: " + error.response.data?.message);
    }

    if (testPlan.testRun !== null) {
      completeRun(
        testPlan,
        messages.reportedFailedWith +
          error.response?.data?.message +
          " | .... | Stack:" +
          error.stack
      );
    }
    write(error.stack);
    throw new Error(error.message);
  }
};
