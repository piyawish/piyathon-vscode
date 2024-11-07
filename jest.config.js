module.exports = {
  moduleNameMapper: {
    vscode: "<rootDir>/test/__mocks__/vscode.js",
  },
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/test/formatter.test.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test/extension.test.js",
  ],
};
