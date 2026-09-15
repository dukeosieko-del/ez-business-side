module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.spec.{ts,js}'],
  testPathIgnorePatterns: ['<rootDir>/.next'],
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  haste: {
    provideModuleNodeModules: ['.next'],
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/jest.tsconfig.json' }],
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
};