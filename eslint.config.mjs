import js from '@eslint/js';
import globals from 'globals';
import configPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { ignores: ['node_modules/**', 'dist/**', 'build/**'] },

    js.configs.recommended,   // базові правила ESLint
    configPrettier,           // вимикає правила, що конфліктують із Prettier

    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            // автоматичне впорядкування імпортів
            'sort-imports': ['warn', {
                ignoreCase: true,
                ignoreDeclarationSort: false,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
            }]
        }
    }
]);
