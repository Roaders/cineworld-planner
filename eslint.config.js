const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        files: ['src/**/*.ts'],
        extends: [
            ...tseslint.configs.recommended,
            ...angular.configs.tsRecommended,
        ],
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/prefer-inject': 'off',
            '@angular-eslint/prefer-on-push-component-change-detection': 'off',
            '@angular-eslint/prefer-standalone': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
        },
    },
    {
        files: ['src/**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
        ],
        rules: {
            '@angular-eslint/template/eqeqeq': ['error', {allowNullOrUndefined: true}],
        },
    },
);
