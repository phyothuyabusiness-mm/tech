const ALLOWED_ORIGINS = new Set([
  "https://phyothuyabusiness-mm.github.io",
  "http://localhost:8788",
  "https://appassets.androidplatform.net"
]);

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://phyothuyabusiness-mm.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed." }, 403, origin);
    if (!env.AI || typeof env.AI.run !== "function") {
      return json({ error: "Cloudflare Workers AI binding is not configured." }, 503, origin);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Request body must be valid JSON." }, 400, origin); }

    const question = typeof body.question === "string" ? body.question.trim() : "";
    const language = body.language === "my" ? "my" : "en";
    if (!question) return json({ error: "Question is required." }, 400, origin);
    if (question.length > 6000) return json({ error: "Question is too long (maximum 6000 characters)." }, 413, origin);

    const system = language === "my"
      ? "သင်သည် PTY-TECH စက်ပြင်နည်းပညာအကူဖြစ်သည်။ Welding inverter, solar inverter, SMPS တို့ကို အထွေထွေ diagnosis အတွက် ကူညီပါ။ မြန်မာလိုရှင်းပြပြီး component နာမည်များကို English ဖြင့်လည်းဖော်ပြပါ။ တိုင်းတာချက်မရှိဘဲ ပျက်နေသည်ဟု အတည်မပြုပါနှင့်။ စစ်ဆေးမှုအဆင့်များ၊ ဖြစ်နိုင်သောအကြောင်းရင်းများနှင့် ဘေးကင်းရေးကို ခွဲပြပါ။ Mains voltage နှင့် DC bus capacitor များသည် အသက်အန္တရာယ်ရှိနိုင်ကြောင်း သတိပေးပါ။ Protection များကို bypass လုပ်ရန် မညွှန်ကြားပါနှင့်။"
      : "You are PTY-TECH Repair AI, a troubleshooting assistant for welding inverters, solar inverters, and SMPS/power supplies. Clearly separate possible causes from confirmed faults. Ask for missing model/measurement details where needed. Give a numbered diagnostic sequence, expected observations, and safety precautions. Mains and DC bus capacitors can be lethal. Never advise bypassing protection or probing live circuits without suitable isolation, rated instruments, PPE, and qualified training. Do not invent model-specific pinouts or voltages; request the service manual when necessary.";

    try {
      const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: system },
          { role: "user", content: question }
        ],
        max_tokens: 1100,
        temperature: 0.25
      });
      const answer = result && (result.response || result.output_text);
      if (!answer) return json({ error: "AI returned an empty response." }, 502, origin);
      return json({ answer }, 200, origin);
    } catch (error) {
      return json({ error: "AI service request failed.", detail: String(error && error.message || error).slice(0, 240) }, 502, origin);
    }
  }
};