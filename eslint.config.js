export default [
  {
    files: ['src/**/*.js', 'server/**/*.js'],
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'error',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
];
