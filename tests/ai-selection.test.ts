import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aiConfiguration} from '../lib/ai-provider';
test('Gemini is the default and explicit OpenRouter selection remains available',()=>{const previous=process.env.AI_PROVIDER;try{delete process.env.AI_PROVIDER;assert.equal(aiConfiguration().provider,'Google Gemini');assert.equal(aiConfiguration().keyEnvironment,'GEMINI_API_KEY');process.env.AI_PROVIDER='openrouter';assert.equal(aiConfiguration().provider,'OpenRouter');process.env.AI_PROVIDER='unsupported';assert.throws(aiConfiguration,/AI_PROVIDER/);}finally{if(previous===undefined)delete process.env.AI_PROVIDER;else process.env.AI_PROVIDER=previous;}});
