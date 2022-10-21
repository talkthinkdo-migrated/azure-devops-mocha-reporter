import { getCaseIdsFromTitle } from "./utils";
import theoretically from "jest-theories";

describe("getCaseIdsFromTitle", () => {
  const theories = [
    { input: "", expected: [] },
    { input: "1234", expected: [] },
    { input: "abcd", expected: [] },
    { input: "#abcd", expected: [] },
    { input: "C sdfg", expected: [] },
    { input: "FOO1234", expected: [] },
    { input: "C 1234", expected: [] },
    { input: "C1234", expected: [1234] },
    { input: "TC1234", expected: [1234] },
    { input: "TC1234 TC321", expected: [1234, 321] },
    { input: "Loads of other text before a TC999", expected: [999] },
  ];

  theoretically(
    "should be {expected} when given {input}",
    theories,
    ({ input, expected }) => {
      const result = getCaseIdsFromTitle(input);
      expect(result).toStrictEqual(expected);
    }
  );
});
