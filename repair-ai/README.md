# PTY-TECH Repair AI

Standalone first milestone located at `/repair-ai/`. It does not replace or modify the existing PTY-TECH Repair Management dashboard, tracking page, or Supabase schema.

## Included now

- Responsive Dark Premium UI for desktop, tablet and mobile.
- Myanmar / English toggle.
- Built-in offline fault guide for welding inverters, solar inverters and SMPS/power supplies.
- Search by symptom, component, or fault ID.
- Installable PWA manifest and service-worker app-shell caching.
- Optional online AI connection through a separately hosted HTTPS backend endpoint.

## Online AI security

The frontend intentionally does not contain an AI provider secret key. The "Secure AI backend URL" field is stored in the current browser/device only. A backend must accept POST JSON shaped like:

```json
{ "question": "Describe fault and measurements", "language": "en", "product": "PTY-TECH Repair AI", "categories": ["welding", "solar", "smps"] }
```

It should return JSON with an `answer` string (or `response` / `text`). Use HTTPS, add rate limits and abuse protection, and keep provider keys in backend secrets. Do not connect this tool to private customer/job records unless authorization and row-level permissions are explicitly implemented.

## GitHub Pages

Once the existing repository's GitHub Pages deployment publishes the `main` branch, open:

https://phyothuyabusiness-mm.github.io/tech/repair-ai/

Service-worker offline support requires HTTPS and works after the app shell has been cached at least once. AI requires an internet connection and a configured backend.

## Next milestones

1. Configure a secure AI backend (Cloudflare Worker or equivalent) and provider binding/secret.
2. Create an Android Studio WebView wrapper that opens the Repair AI app and supports local/offline assets.
3. Package a Windows desktop version (for example, a signed desktop wrapper) and test installer/build on the user's PC.
4. Expand the reviewed fault library with verified model-specific service manuals and circuit diagrams.

## Safety

These are general diagnostic suggestions, not a substitute for the exact service manual. Mains input and DC bus capacitors can be lethal. Never bypass protection, and verify capacitor discharge with a correctly rated meter before internal work.