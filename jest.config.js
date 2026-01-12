export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/src/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  setupFilesAfterEnv: [],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
