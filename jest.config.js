/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js)$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  testMatch: ["**/src/**/*.test.ts", "**/src/testUtils/**/*.ts"],
};
