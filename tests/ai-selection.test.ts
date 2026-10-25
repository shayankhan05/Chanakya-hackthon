import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aiConfiguration} from '../lib/ai-provider';
test('OpenRouter is the sole provider and missing credentials never select another service',()=>{const previous=process.env.AI_PROVIDER;try{delete process.env.AI_PROVIDER;assert.equal(aiConfiguration().provider,'OpenRouter');assert.equal(aiConfiguration().keyEnvironment,'OPENROUTER_API_KEY');process.env.AI_PROVIDER='openrouter';assert.equal(aiConfiguration().provider,'OpenRouter');process.env.AI_PROVIDER='unsupported';assert.throws(aiConfiguration,/AI_PROVIDER/);}finally{if(previous===undefined)delete process.env.AI_PROVIDER;else process.env.AI_PROVIDER=previous;}});
