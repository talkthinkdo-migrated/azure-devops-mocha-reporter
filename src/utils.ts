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
