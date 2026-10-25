# OpenRouter setup

The active server provider is OpenRouter, using its native HTTPS Chat Completions endpoint. Gemini and OpenAI keys are no longer read by the application chat routes. Saved accounts, business data, calculations and source-backed legal tools remain intact. Existing Gemini adapter regression fixtures remain for historical coverage but are not selected at runtime.

## Create your key

1. Visit https://openrouter.ai and create an account or sign in.
2. Open https://openrouter.ai/settings/keys and choose Create Key.
3. Name the key ComplianceCopilot. Set a spending limit suitable for your budget and an expiration if desired. Copy the newly generated key privately.
4. Check https://openrouter.ai/settings/credits. Paid model requests require sufficient credits and an adequate key spending limit. Free models have separate availability and rate limits; the configured auto router is not a guarantee of free usage.
5. In the existing project-root .env.local, fill only OPENROUTER_API_KEY with this key. Never paste it into chat or a NEXT_PUBLIC_ variable. Gemini keys cannot authenticate OpenRouter.
6. Keep AI_PROVIDER="openrouter". OPENROUTER_MODEL="openrouter/auto" lets OpenRouter select a model; prices can vary. To control selection, choose an exact model ID with tool calling support from https://openrouter.ai/models and set OPENROUTER_MODEL accordingly. Requests require tool-parameter support for business tools.
7. Restart the Next.js server on port 3001 after changing the environment. Then run npm run verify:ai and npm run test:ai, or ask the coding assistant to do so. These tests can make metered API calls when a key is present.

## Behavior and verification

The backend sends only the authorized business profile, recent conversation and relevant checked legal excerpts. It executes business-read, growth-simulation and calculation tools locally. It gives short relevant answers and instructs the model to redirect unrelated requests. It cannot guarantee knowledge of every law or recent amendment. Unknown facts require clarification.

Authenticated requests never silently substitute local text for a failed live request. Error messages distinguish authentication (401), insufficient credits (402), access restrictions (403), rate limiting (429), invalid models/configuration and timeouts. Credentials and raw provider error bodies are never returned or logged. Anonymous demo mode remains local and labeled.

Official documentation: https://openrouter.ai/docs/quickstart

The key field was prepared empty at migration time. Live connectivity is unverified until a private replacement key is configured and a real generation request succeeds. Test transport fixtures do not prove live connectivity.
