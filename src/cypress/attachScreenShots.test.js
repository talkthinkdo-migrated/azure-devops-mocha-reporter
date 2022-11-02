import { attachScreenShots } from "./attachScreenShots";
import * as azureUtils from "../azureApiUtils";
import { createTestPlan } from "../testPlan";

beforeEach(() => {
  jest.restoreAllMocks();
});

describe.skip("attachScreenShots", () => {
  test("should call `getTestResultsByRunId` with testPlan", async () => {
    const mockResult = {
      id: 1000,
      testCase: {
        id: 2000,
      },
    };

    const mockGetTestResultsByRunId = jest
      .spyOn(azureUtils, "getTestResultsByRunId")
      .mockResolvedValue([mockResult]);

    const testPlan = createTestPlan({});
    testPlan.testRun = { id: 1000 };
    await attachScreenShots(testPlan);

    expect(mockGetTestResultsByRunId).toHaveBeenCalledWith(testPlan);
  });

  test("should call `createTestResultAttachment` for each result with matching screenshot", async () => {
    const mockResult1 = {
      id: 1000,
      testCase: {
        id: 2000,
      },
    };
    const mockResult2 = {
      id: 3000,
      testCase: {
        id: 4000,
      },
    };

    const mockGetTestResultsByRunId = jest
      .spyOn(azureUtils, "getTestResultsByRunId")
      .mockResolvedValue([mockResult1, mockResult2]);
    const mockCreateTestResultAttachment = jest.spyOn(
      azureUtils,
      "createTestResultAttachment"
    );

    const testPlan = createTestPlan({});
    testPlan.testRun = { id: 1000 };
    await attachScreenShots(testPlan);

    expect(mockCreateTestResultAttachment).toHaveBeenCalledTimes(2);
    expect(mockCreateTestResultAttachment).toHaveBeenCalledTimes(2);
  });
});
