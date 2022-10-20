import { Outcome } from "../enums/testPlan.enums";
import { AxiosInstance } from "axios";

export interface TestResult {
  testCaseId: number;
  outcome: Outcome;
}

export interface TestPlan {
  testResults: Array<TestResult>;
  planId: string;
  runName: string;
  azureApiRequest: AxiosInstance;
  testRun: any;
}

export interface TestSuite {
  id: number;
}

interface TestCaseReference {
  id: number;
  name: string;
}
export interface TestPoint {
  id: string;
  testCaseReference: TestCaseReference;
}
