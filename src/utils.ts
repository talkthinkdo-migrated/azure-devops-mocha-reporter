import { TestPlan } from "./interfaces/testPlan.interfaces";

/**
 * Search for all applicable test cases
 * @param title
 * @returns {array} case ids
 */
export function getCaseIdsFromTitle(title: string): number[] {
  const caseIds = [];
  const testCaseIdRegExp = /\bT?C(\d+)\b/g;
  let m: RegExpExecArray;
  while ((m = testCaseIdRegExp.exec(title)) !== null) {
    const caseId: Number = parseInt(m[1]);
    caseIds.push(caseId);
  }
  return caseIds;
}

export function write(str: string) {
  process.stdout.write(str + "\n");
}

/**
 * async pipe function
 */
export const pipe =
  (...functions) =>
  (input) =>
    functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));

export const callApi = async (testPlan: TestPlan, url: string) => {
  const response = await testPlan.azureApiRequest(url);
  return response.data.value;
};

export const pipeLog = (data: any) => console.log(data);

/**
 * pipeable array.flat
 */
export const flatten = (array: any[]) => array.flat();

/**
 * pipeable array.map
 */
export const map = (func) => (array: any[]) => array.map(func);

/**
 * Performs given func, then returns given data
 * useful to "pass through" in a pipe
 * @param func - side effect function
 * @returns given data
 */
export const tap = (func) => async (data: any) => {
  await func(data);
  return data;
};
