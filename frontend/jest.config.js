module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'vue', 'jsx', 'ts', 'tsx', 'mjs'],
    transform: {
      '^.+\\.vue$': 'vue-jest',
      '^.+\\.js$': 'babel-jest',
      '^.+\\.mjs$': 'babel-jest' // Add this line to handle .mjs files
    },
    moduleNameMapper: {
      // Handle CSS modules
      '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  
      // Handle image imports
      '^.+\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  
      // Handle custom aliases (e.g., @ as the src folder)
      '^@/(.*)$': '<rootDir>/src/$1',
      '^primevue/(.*)$': '<rootDir>/node_modules/primevue/$1', // PrimeVue components
    },
    transformIgnorePatterns: [
      '/node_modules/(?!primevue|axios).+\\.js$',
    ],
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    testMatch: ['**/tests/unit/**/*.spec.[jt]s?(x)', '**/__tests__/*.[jt]s?(x)'],
  };
  