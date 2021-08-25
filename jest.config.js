module.exports = {
    testEnvironment: 'node',
    transform: {
      "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node",
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{ts,tsx,js,jsx}',
      '!src/**/*.d.ts',
    ],
  };