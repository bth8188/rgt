import { config } from 'dotenv';
config({ path: '.env' }); // .env.local 파일 로드

const jestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleDirectories: ['node_modules', '<rootDir>/'], // 모듈 탐색 디렉토리 설정
};

export default jestConfig;
