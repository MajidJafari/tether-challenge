module.exports = {
  testMatch: ['**/__tests__/**/*.test.js'],
  testEnvironment: 'node',
  collectCoverage: true, 
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
}; 