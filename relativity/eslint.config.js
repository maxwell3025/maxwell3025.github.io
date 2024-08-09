import stylisticTs from '@stylistic/eslint-plugin-ts';
import parserTs from '@typescript-eslint/parser';

export default [
    // ts files
    {
        plugins: {
            '@stylistic/ts': stylisticTs,
        },
        languageOptions: {
            parser: parserTs,
        },
        rules: {
            "@stylistic/ts/semi": "error",
            "@stylistic/ts/comma-dangle": ["error", "always-multiline"],
            "prefer-const": "error",
        },
        files: ["src/**/*.ts", "*.js"],
    },
    {
        ignores: ["dist/"],
    },
];
