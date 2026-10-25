import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
export default [
 {ignores:['.next/**','node_modules/**','.data/**','docs/**']},
 {files:['**/*.{js,mjs,ts,mts,tsx}'],languageOptions:{parser:tsParser,ecmaVersion:'latest',sourceType:'module',parserOptions:{ecmaFeatures:{jsx:true}}},rules:{...js.configs.recommended.rules,'no-undef':'off','no-unused-vars':'off','no-empty':['error',{allowEmptyCatch:true}],'no-useless-escape':'off'}}
];
