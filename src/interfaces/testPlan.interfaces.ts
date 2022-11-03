import { Outcome } from "../enums/testPlan.enums";
import { AxiosInstance } from "axios";
import { ReadStream } from "fs";

export interface FormattedMochaTest {
  title: string;
  errorStack?: string;
  state?: string;
}

export interface TestResult {
  testCaseId: number;
  stack: string;
  outcome: Outcome;
}

export interface ReceivedAzureTestResult {
  id: number;
  testCase: {
    id: string;
  };
}

interface TestRun {
  id: number;
  name: string;
}

export interface TestPlan {
  testResults: Array<TestResult>;
  planId: string;
  runName: string;
  azureApiRequest: AxiosInstance;
  testRun: TestRun;
  shouldAttachScreenShotsToTestResults: boolean;
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

export interface TestResultAttachment {
  fileName: string;
  stream: ReadStream;
}
