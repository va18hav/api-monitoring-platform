export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^shared$': '<rootDir>/packages/shared/src/index.ts',
    '^db$': '<rootDir>/packages/db/src/prisma.ts'
  },
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', { useESM: false }]
  }
};
