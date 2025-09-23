import { config } from '@n8n/node-cli/eslint';

export default [
  ...config,
  {
    files: ['**/*.ts'],
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
];
