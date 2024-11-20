module.exports = {
  testMatch: ['**/__tests__/**/*.test.js'], // Define where Jest should look for test files
  testEnvironment: 'node', // Use the Node.js test environment
  collectCoverage: true,   // Enable coverage reports
  collectCoverageFrom: ['src/**/*.js'], // Include only source files in coverage
  coverageDirectory: 'coverage', // Directory to store coverage reports
}; 