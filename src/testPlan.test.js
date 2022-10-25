import { Outcome } from "./enums/testPlan.enums";
import { addResult, createTestPlan } from "./testPlan";

describe("addResult", () => {
  test("should add new results to testPlan", () => {
    const testPlan = createTestPlan({
      organisation: "",
      pat: "",
      planId: "",
      project: "",
      runName: "should add new results to testPlan",
    });
    expect(testPlan.testResults.length).toBe(0);

    const output1 = addResult(123, Outcome.Passed, testPlan);

    expect(testPlan.testResults.length).toBe(1);
    expect(testPlan.testResults[0].testCaseId).toBe(123);
    expect(testPlan.testResults[0].outcome).toBe(Outcome.Passed);

    expect(output1).toBe(testPlan);

    const output2 = addResult(456, Outcome.Failed, testPlan);

    expect(testPlan.testResults.length).toBe(2);
    expect(testPlan.testResults[1].testCaseId).toBe(456);
    expect(testPlan.testResults[1].outcome).toBe(Outcome.Failed);

    expect(output2).toBe(testPlan);
  });
});
