/* runtime-v2/providers/ai-provider.cjs — single server-side seam for any
   external AI provider (LLM etc.). The AI Coach learning engine currently
   runs entirely locally (heuristics over the user's own answer history and
   the bundled knowledge base) and does NOT call any provider. This module:
     - keeps provider configuration out of the frontend (env-only, backend-only)
     - exposes status() for /health
     - exposes generateText() which fails fast and explicitly when no
       provider is configured — no fake responses, no silent fallbacks
   Frontend code never needs to know which provider is used.
   Configuration: AI_PROVIDER, AI_API_URL, AI_API_KEY, AI_TIMEOUT_MS,
   AI_MAX_RETRIES (see .env.example). Never commit real keys. */
"use strict";
const { config } = require("../config.cjs");

function status() {
  if (!config.ai.provider) return { provider: null, configured: false, reason: "AI_PROVIDER not set" };
  if (!config.ai.apiUrl) return { provider: config.ai.provider, configured: false, reason: "AI_API_URL not set" };
  return { provider: config.ai.provider, configured: true };
}

/* Generate text via the configured provider. Currently no route calls this —
   the AI Coach features are heuristic/local. When a provider is configured
   and a future feature needs one, implement the wire protocol here (or add a
   provider adapter under runtime-v2/providers/) using AI_API_URL/AI_API_KEY
   from the server environment only. */
async function generateText() {
  const st = status();
  if (!st.configured) {
    const err = new Error("AI provider not configured: " + st.reason);
    err.code = "AI_PROVIDER_UNCONFIGURED";
    throw err;
  }
  throw new Error("AI provider " + config.ai.provider + " is configured but no generation feature is wired yet");
}

module.exports = { status, generateText };
