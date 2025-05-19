import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';

export default [
eslint.configs.recommended,
{
files: ['**/*.{js,jsx,ts,tsx}'],
ignores: ['node_modules/**', 'dist/**', 'build/**', '*.config.js'],
languageOptions: {
parser: tseslintParser,
parserOptions: {
ecmaFeatures: {
jsx: true,
},
},
},
plugins: {
'@typescript-eslint': tseslint,
'react': reactPlugin,
'react-native': reactNativePlugin,
},
rules: {
'react/react-in-jsx-scope': 'off',
'react/prop-types': 'off',
'@typescript-eslint/explicit-module-boundary-types': 'off',
'@typescript-eslint/no-explicit-any': 'warn',
},
settings: {
react: {
version: 'detect',
},
},
env: {
'react-native/react-native': true,
},
},
];
