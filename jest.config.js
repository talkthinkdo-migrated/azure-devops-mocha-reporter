module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js)$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  testMatch: ["**/src/**/*.test.js"],
  setupFiles: ["<rootDir>/src/testUtils/index.js"],
};
