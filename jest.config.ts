import type { Config } from 'jest';
import { defaults } from './jest.defaults';

const config: Config = {
  ...defaults,
  projects: [
    '<rootDir>/jest.unit.config.ts',
    '<rootDir>/jest.integration.config.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.example.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.entity.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/**/*.mock.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/main.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};

export default config;
