# PTY-TECH Repair AI — Online AI Backend

This Worker powers the Online AI Assistant using Cloudflare Workers AI. It is separate from the Repair Management app and does not connect to or modify Supabase repair/customer data.

## Deploy the backend

Requirements: a Cloudflare account with Workers AI access enabled, Node.js/npm, and Wrangler CLI.

1. Download or clone this repository to your computer.
2. Open a terminal in `repair-ai/backend`.
3. Install Wrangler if needed: `npm install -g wrangler`.
4. Sign in: `wrangler login`.
5. Deploy: `wrangler deploy`.
6. Copy the HTTPS URL printed by Wrangler (usually `https://pty-tech-repair-ai.<your-account-subdomain>.workers.dev`).
7. Open [PTY-TECH Repair AI](https://phyothuyabusiness-mm.github.io/tech/repair-ai/), paste the Worker URL into **Secure AI backend URL**, and click **Ask Repair AI**. The URL is saved locally in that browser/device.
8. Test with a short question in English and in Burmese.

The Worker uses the Cloudflare Workers AI binding configured in `wrangler.toml`. **No third-party AI provider API key is required or placed in the frontend.** Do not add secret values to `index.html`, Android assets, Windows files, GitHub commits, or `wrangler.toml`.

## Required production protection

CORS is not authentication, and an endpoint URL is public. Before sharing this endpoint widely:

1. In Cloudflare Dashboard, open **Workers & Pages → pty-tech-repair-ai → Settings / Security** (labels can vary) and review available abuse controls.
2. Add a rate-limiting rule for this Worker route. Start conservatively, for example around 10 requests per minute per IP, then tune to real usage and Cloudflare plan availability.
3. Set usage/budget alerts or limits where available, and monitor Workers AI usage.
4. Keep request-size limits and allowed origins in `worker.js`. Only add exact trusted origins; never use wildcard CORS.
5. If the Worker is exposed to untrusted users, add a server-verified anti-abuse mechanism such as Turnstile or another authenticated gateway. A token embedded in frontend code is not a secret and must not be treated as authentication.

## Allowed origins

The Worker currently allows:
- `https://phyothuyabusiness-mm.github.io`
- `http://localhost:8788` for local development
- `https://appassets.androidplatform.net` for Android WebView assets

Native clients or command-line requests without an Origin header can reach the endpoint, so rate limiting is important. If the frontend is moved to another domain, add that exact origin and redeploy.

## Test

After deployment, replace `WORKER_URL` with the URL printed by Wrangler:

```bash
curl -i -X POST "WORKER_URL" \
  -H "Content-Type: application/json" \
  --data '{"question":"Explain likely causes of low welding current. Give safe checks.","language":"en"}'
```

A successful request should return HTTP 200 and JSON containing an `answer` field. If you receive a 503, confirm Workers AI is enabled for the account and the `[ai]` binding in `wrangler.toml` is present. If the request fails from the website, check the Worker URL, browser console, and allowed origin.

## Safety and privacy

- The backend does not query Supabase or receive repair-job/customer records.
- Provider/account details are not exposed in error responses.
- Do not upload customer phone numbers, personal data, or confidential repair records unless a privacy design explicitly requires it.
- This assistant provides diagnostic guidance only. Verify with the machine's service manual and use qualified procedures for hazardous mains/DC bus circuits.
