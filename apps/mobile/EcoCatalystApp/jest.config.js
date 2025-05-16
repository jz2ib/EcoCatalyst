module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/theme/theme.ts',
    '!src/services/firebase.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    "^react-native/Libraries/Animated/NativeAnimatedHelper$": "<rootDir>/node_modules/react-native/src/private/animated/NativeAnimatedHelper.js"
  }
};
