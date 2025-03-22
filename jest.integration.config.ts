import type { Config } from 'jest';
import { defaults } from './jest.defaults';

const config: Config = {
  ...defaults,
  displayName: 'integration',
  testRegex: '.*\\.integration\\.spec\\.ts$',
  rootDir: '.',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.example.ts',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.unit.spec.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.entity.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/**/*.mock.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/integration',
};

export default config;
