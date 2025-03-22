import type { Config } from 'jest';
import { defaults } from './jest.defaults';

const config: Config = {
  ...defaults,
  displayName: 'e2e',
  testRegex: '.e2e-spec.ts$',
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.example.ts',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.integration.spec.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.entity.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/**/*.mock.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/e2e',
};

export default config;
