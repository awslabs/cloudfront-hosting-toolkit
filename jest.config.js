module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  coveragePathIgnorePatterns : [
    "<rootDir>/bin/cli/actions/*.d.ts","<rootDir>/bin/cli/actions/*.js"
  ]
};
