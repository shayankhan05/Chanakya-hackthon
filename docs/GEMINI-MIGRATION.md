# Gemini migration

The current setup guide is [GEMINI-SETUP.md](GEMINI-SETUP.md).

Gemini is now the sole supported provider. The legacy OpenAI implementation, dependency and local environment settings have been removed. Both pasted credentials were treated as exposed. A fresh Gemini credential must be supplied privately before live connectivity can be tested.

Existing accounts and business data were preserved. Authenticated chat never silently falls back to local responses. See `live-only-check.json` for the latest actual application test results.
