import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';

export default [
eslint.configs.recommended,
{
files: ['**/*.{js,jsx,ts,tsx}'],
ignores: [
'node_modules/**',
'dist/**',
'build/**',
'*.config.js',
'jest.setup.js'
],
languageOptions: {
parser: tseslintParser,
parserOptions: {
ecmaFeatures: {
jsx: true,
},
},
globals: {
// Common globals
console: 'readonly',
process: 'readonly',
module: 'readonly',
require: 'readonly',
// React Native globals
__DEV__: 'readonly',
// Test globals
jest: 'readonly',
expect: 'readonly',
test: 'readonly',
describe: 'readonly',
beforeEach: 'readonly',
afterEach: 'readonly',
beforeAll: 'readonly',
afterAll: 'readonly',
// Browser globals
setTimeout: 'readonly',
clearTimeout: 'readonly',
setInterval: 'readonly',
clearInterval: 'readonly',
Alert: 'readonly',
}
},
plugins: {
'@typescript-eslint': tseslint,
'react': reactPlugin,
'react-native': reactNativePlugin,
},
rules: {
// Disable some strict rules for development
'no-unused-vars': 'warn',
'no-undef': 'warn',
'@typescript-eslint/no-explicit-any': 'warn',
'react/react-in-jsx-scope': 'off',
'react/prop-types': 'off',
'@typescript-eslint/explicit-module-boundary-types': 'off',
},
settings: {
react: {
version: 'detect',
},
},
},
];
