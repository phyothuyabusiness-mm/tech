const ALLOWED_ORIGINS = new Set([
  "https://phyothuyabusiness-mm.github.io",
  "http://localhost:8788",
  "https://appassets.androidplatform.net",
  "null"
]);

const MAX_BODY_BYTES = 12 * 1024;
const MAX_QUESTION_CHARS = 6000;
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin)
    }
  });
}

function originAllowed(origin) {
  // Native clients and command-line health tests may omit Origin.
  return !origin || ALLOWED_ORIGINS.has(origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (!originAllowed(origin)) {
      return json({ error: "Origin not allowed." }, 403, "");
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Use POST." }, 405, origin);
    }

    if (!env.AI || typeof env.AI.run !== "function") {
      return json({ error: "AI backend is not configured." }, 503, origin);
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return json({ error: "Content-Type must be application/json." }, 415, origin);
    }

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Request body is too large." }, 413, origin);
    }

    let raw;
    try {
      raw = await request.text();
    } catch {
      return json({ error: "Could not read request body." }, 400, origin);
    }

    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ error: "Request body is too large." }, 413, origin);
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400, origin);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Request body must be a JSON object." }, 400, origin);
    }

    const question = typeof body.question === "string" ? body.question.trim() : "";
    const language = body.language === "my" ? "my" : "en";

    if (!question) {
      return json({ error: "Question is required." }, 400, origin);
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return json({ error: "Question is too long (maximum 6000 characters)." }, 413, origin);
    }

    const system = language === "my"
      ? "သင်သည် PTY-TECH စက်ပြင်နည်းပညာအကူဖြစ်သည်။ Welding inverter, solar inverter, SMPS တို့ကို အထွေထွေ diagnosis အတွက် ကူညီပါ။ မြန်မာလိုရှင်းပြပြီး component နာမည်များကို English ဖြင့်လည်းဖော်ပြပါ။ တိုင်းတာချက်မရှိဘဲ ပျက်နေသည်ဟု အတည်မပြုပါနှင့်။ စစ်ဆေးမှုအဆင့်များ၊ ဖြစ်နိုင်သောအကြောင်းရင်းများနှင့် ဘေးကင်းရေးကို ခွဲပြပါ။ Mains voltage နှင့် DC bus capacitor များသည် အသက်အန္တရာယ်ရှိနိုင်ကြောင်း သတိပေးပါ။ Protection များကို bypass လုပ်ရန် မညွှန်ကြားပါနှင့်။"
      : "You are PTY-TECH Repair AI, a troubleshooting assistant for welding inverters, solar inverters, and SMPS/power supplies. Clearly separate possible causes from confirmed faults. Ask for missing model/measurement details where needed. Give a numbered diagnostic sequence, expected observations, and safety precautions. Mains and DC bus capacitors can be lethal. Never advise bypassing protection or probing live circuits without suitable isolation, rated instruments, PPE, and qualified training. Do not invent model-specific pinouts or voltages; request the service manual when necessary.";

    try {
      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: question }
        ],
        max_tokens: 900,
        temperature: 0.2
      });

      const answer = result && (result.response || result.output_text);
      if (typeof answer !== "string" || !answer.trim()) {
        return json({ error: "AI returned an empty response." }, 502, origin);
      }

      return json({ answer: answer.trim() }, 200, origin);
    } catch {
      // Do not expose internal provider/account details to anonymous clients.
      return json({ error: "AI service request failed. Please try again later." }, 502, origin);
    }
  }
};
