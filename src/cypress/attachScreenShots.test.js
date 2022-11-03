import { attachScreenShots } from "./attachScreenShots";
import * as azureUtils from "../azureApiUtils";
import * as utils from "../utils";
import { createTestPlan } from "../testPlan";
import theoretically from "jest-theories";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

let mock;

afterAll(() => {
  mock.reset();
});

beforeEach(() => {
  jest.restoreAllMocks();
  mock = new MockAdapter(axios);
});

describe("attachScreenShots", () => {
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
    await attachScreenShots(testPlan, []);

    expect(mockGetTestResultsByRunId).toHaveBeenCalledWith(testPlan);
  });

  test("should call get correct api end points in correct order", async () => {
    const mockTestCaseId = 9000;
    const mockResult = {
      id: 9999,
      testCase: {
        id: mockTestCaseId,
      },
    };
    const runId = 1000;
    const { getResultsRegex, postTestResultAttachmentRegex } =
      createMocksForApiAndNode(runId, mockTestCaseId);

    const testPlan = createTestPlan({});
    testPlan.testRun = { id: runId };

    await attachScreenShots(testPlan, [{ ids: [mockTestCaseId], path: "" }]);

    expect(mock.history.get.at(0).url).toMatch(getResultsRegex);
    expect(mock.history.post.at(0).url).toMatch(postTestResultAttachmentRegex);
  });

  describe("createTestResultAttachment", () => {
    const theories = [
      // all matching
      { times: 1, screenShotIds: [[1]], resultTestCaseIds: [1] },
      { times: 3, screenShotIds: [[1], [1], [1]], resultTestCaseIds: [1] },
      { times: 2, screenShotIds: [[1, 2]], resultTestCaseIds: [1, 2] },
      { times: 3, screenShotIds: [[1, 2], [3]], resultTestCaseIds: [1, 2, 3] },
      {
        times: 3,
        screenShotIds: [[1], [2], [3]],
        resultTestCaseIds: [1, 2, 3],
      },
      { times: 3, screenShotIds: [[1]], resultTestCaseIds: [1, 1, 1] },
      // no matching
      { times: 0, screenShotIds: [[]], resultTestCaseIds: [1, 2, 3] },
      { times: 0, screenShotIds: [[4, 5, 6]], resultTestCaseIds: [1, 2, 3] },
      {
        times: 0,
        screenShotIds: [[4], [5], [6]],
        resultTestCaseIds: [1, 2, 3],
      },
      // some matching
      { times: 1, screenShotIds: [[1]], resultTestCaseIds: [1, 2] },
      { times: 1, screenShotIds: [[4], [2]], resultTestCaseIds: [1, 2] },
      { times: 2, screenShotIds: [[4, 2], [3]], resultTestCaseIds: [2, 3] },
    ];
    theoretically(
      ({ times }, index) =>
        `#${
          index + 1
        }: should be called ${times} times for each result with matching screenshot`,
      theories,
      async ({ times, screenShotIds, resultTestCaseIds }) => {
        const mockResults = buildMockResults(resultTestCaseIds);
        const screenShots = buildScreenShots(screenShotIds);

        // mock file system & api call to stop erroring
        const mockGetTestResultsByRunId = jest
          .spyOn(azureUtils, "getTestResultsByRunId")
          .mockResolvedValue(mockResults);

        const mockCreateBase64FromFilePath = jest
          .spyOn(utils, "createBase64FromFilePath")
          .mockReturnValue("");

        // listen for calls
        const mockCreateTestResultAttachment = jest
          .spyOn(azureUtils, "createTestResultAttachment")
          .mockResolvedValue();

        const testPlan = createTestPlan({});
        testPlan.testRun = { id: 1000 };
        await attachScreenShots(testPlan, screenShots);

        expect(mockCreateTestResultAttachment).toHaveBeenCalledTimes(times);
      }
    );

    const buildMockResults = (resultTestCaseIds) =>
      resultTestCaseIds.map((id, index) => ({
        id: index,
        testCase: { id },
      }));

    const buildScreenShots = (screenShotIds) =>
      screenShotIds.map((ids) => ({
        ids,
        path: "",
      }));
  });

  test("should catch error if getResults request fails", async () => {
    const mockTestCaseId = 9000;
    const mockResult = {
      id: 9999,
      testCase: {
        id: mockTestCaseId,
      },
    };
    const runId = 1000;
    const { mockWrite, getResultsRegex } = createMocksForApiAndNode(
      runId,
      mockTestCaseId
    );

    // force get request to fail
    mock.onGet(getResultsRegex).reply(500, { value: [mockResult] });

    const testPlan = createTestPlan({});
    testPlan.testRun = { id: runId };

    try {
      await attachScreenShots(testPlan, [{ ids: [mockTestCaseId], path: "" }]);
    } catch {
      // check this catch block is hit
      expect(mockWrite).toHaveBeenCalled();
    }

    expect.assertions(1);
  });
  test("should catch error if createTestResultAttachment request fails", async () => {
    const mockTestCaseId = 9000;
    const runId = 1000;

    const { mockWrite, postTestResultAttachmentRegex } =
      createMocksForApiAndNode(runId, mockTestCaseId);

    // force post to fail
    mock.onPost(postTestResultAttachmentRegex).reply(500, {});

    const testPlan = createTestPlan({});
    testPlan.testRun = { id: runId };

    try {
      await attachScreenShots(testPlan, [{ ids: [mockTestCaseId], path: "" }]);
    } catch {
      // check this catch block is hit
      expect(mockWrite).toHaveBeenCalled();
    }

    expect.assertions(1);
  });

  const createMocksForApiAndNode = (runId, mockTestCaseId) => {
    const mockResult = {
      id: 9999,
      testCase: {
        id: mockTestCaseId,
      },
    };

    const getResultsRegex = new RegExp(
      `.*\/test/runs/${runId}/results?.*`,
      "i"
    );
    mock.onGet(getResultsRegex).reply(200, { value: [mockResult] });

    const postTestResultAttachmentRegex = new RegExp(
      `.*\/test/runs/${runId}/results/${mockResult.id}/attachments?.*`,
      "i"
    );
    mock.onPost(postTestResultAttachmentRegex).reply(200, {});

    const mockCreateBase64FromFilePath = jest
      .spyOn(utils, "createBase64FromFilePath")
      .mockReturnValue("");

    const mockWrite = jest.spyOn(utils, "write");

    return {
      getResultsRegex,
      postTestResultAttachmentRegex,
      mockWrite,
    };
  };
});
