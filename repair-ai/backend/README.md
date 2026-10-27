# Online AI backend (Cloudflare Workers AI)

The frontend is usable without this backend. This Worker is a separate backend and does not access the PTY-TECH Repair Management database.

## Deploy

1. Create/sign in to a Cloudflare account and confirm Workers AI access/billing for your account.
2. Install Node.js and Wrangler on your computer: `npm install -g wrangler`.
3. In a terminal, change directory to this folder after downloading/cloning the repository.
4. Run `wrangler login`.
5. Deploy with `wrangler deploy`.
6. Copy the Worker HTTPS URL, e.g. `https://pty-tech-repair-ai.<your-account>.workers.dev`.
7. Open the Repair AI page and paste that URL into "Secure AI backend URL". The URL is saved in that browser/device.

## Important

- The worker source uses a Cloudflare Workers AI binding configured in `wrangler.toml`; it does not need a third-party provider API key in the browser.
- Check your account's current Workers AI availability, usage limits, and pricing before production use.
- The Worker allows the published GitHub Pages origin and localhost development. If hosting changes, update `ALLOWED_ORIGINS` to exact trusted origins.
- This initial worker does not connect to Supabase and does not receive repair customer records. Keep it that way unless explicit authorization and data-access controls are designed.
- Add Cloudflare rate limiting / abuse protection before making the endpoint public. Do not treat CORS as authentication.
- The code has not been deployed or live-tested from this repository; deployment and a real request are still required.
