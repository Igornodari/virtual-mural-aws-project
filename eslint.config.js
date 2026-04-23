// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import preferArrow from 'eslint-plugin-prefer-arrow';

export default tseslint.config(
  {
    // Ignora assets que não são código Angular (ex: templates de email do Cognito)
    ignores: ['src/app/assets/email-templates/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      'prefer-arrow': preferArrow,   
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/prefer-inject': 'warn',
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/no-output-on-prefix': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'prefer-arrow/prefer-arrow-functions': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/eqeqeq': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'warn',
    },
  },
);