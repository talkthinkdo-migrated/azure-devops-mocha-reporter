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
    const caseId: number = parseInt(m[1]);
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
  (...functions: any) =>
  (input?: any) =>
    functions.reduce(
      (previous: any, func: any) => previous.then(func),
      Promise.resolve(input)
    );

/**
 * pipeable array.flat
 */
export const flatten = (array: any[]) => array.flat();

type MapFunc = (item: any, index?: number) => any;
/**
 * pipeable array.map
 */
export const map = (func: MapFunc) => (array: any[]) => array.map(func);
