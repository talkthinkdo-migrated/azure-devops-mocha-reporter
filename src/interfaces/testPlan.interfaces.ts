import { Outcome } from "../enums/testPlan.enums";
import { AxiosInstance } from "axios";

interface TestResult {
  testCaseId: number;
  outcome: Outcome;
}

export interface TestPlan {
  testResults: Array<TestResult>;
  planId: string;
  runName: string;
  azureApiRequest: AxiosInstance;
  baseUrl: string;
  testRun: any;
}
