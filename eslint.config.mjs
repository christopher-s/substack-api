import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'

const sharedGlobals = {
  fetch: 'readonly',
  Response: 'readonly',
  RequestInit: 'readonly',
  URLSearchParams: 'readonly',
  Blob: 'readonly',
  global: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  jest: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly'
}

const sharedRules = {
  'semi': ['error', 'never'],
  'quotes': ['error', 'single'],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-explicit-any': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }],
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['./*', '../*', '../../*', '../../../*'],
      message: 'Relative imports are forbidden. Use @substack-api/ path alias instead (e.g., @substack-api/domain, @substack-api/internal/services).'
    }]
  }]
}

export default [
  eslint.configs.recommended,
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'samples/**', 'scripts/**', '.stryker-tmp/**'] },
  {
    files: ['jest.config.js', 'jest.e2e.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: { module: 'readonly' }
    }
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.test.json', './tests/e2e/tsconfig.json']
      },
      globals: sharedGlobals
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: sharedRules
  },
  {
    files: ['tests/integration/**/*.ts', 'tests/e2e/**/*.ts'],
    languageOptions: {
      globals: { process: 'readonly' }
    }
  },
  eslintConfigPrettier
]
