module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // Catch forgotten await — operation silently doesn't execute
        '@typescript-eslint/no-floating-promises': 'error',
        // Catch `if (asyncFn())` — always truthy
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
        // Catch `any` leaking into typed code
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        // Type-aware replacements for base rules
        'no-throw-literal': 'off',
        '@typescript-eslint/only-throw-error': 'error',
        'no-return-await': 'off',
        '@typescript-eslint/return-await': 'error',
        'require-await': 'off',
        '@typescript-eslint/require-await': 'error',
        // Allow `void` for fire-and-forget promises (required by no-floating-promises)
        'no-void': 'off',
      },
    },
  ],
};
