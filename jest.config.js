module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.spec.{ts,js}'],
  testPathIgnorePatterns: ['<rootDir>/.next'],
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  transform: {
    '^.+\\.(ts|tsx|js)$': ['ts-jest', { tsconfig: '<rootDir>/jest.tsconfig.json' }],
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
};