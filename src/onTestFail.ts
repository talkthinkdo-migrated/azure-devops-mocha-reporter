import { Outcome } from "./enums/testPlan.enums";
import { FormattedMochaTest, TestPlan } from "./interfaces/testPlan.interfaces";
import { addResult } from "./testPlan";
import { getCaseIdsFromTitle } from "./utils";

interface Args {
  test: FormattedMochaTest;
  testPlan: TestPlan;
}

export const onTestFail = ({ test, testPlan }: Args) => {
  const testCaseIds = getCaseIdsFromTitle(test.title);
  testCaseIds.forEach((testCaseId) => {
    addResult({
      testCaseId,
      outcome: Outcome.Failed,
      testPlan,
      stack: test.errorStack,
    });
  });
};