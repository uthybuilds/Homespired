const env = (globalThis as any).Deno?.env;
const SUPABASE_URL = env?.get("SUPABASE_URL") || "";
const SERVICE_KEY = env?.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("Cookie") || "";
  const parts = cookie.split(";").map((s) => s.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) return rest.join("=") || "";
  }
  return null;
}

function setCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `cart_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

const serve =
  (globalThis as any).Deno?.serve ||
  ((handler: (req: Request) => Response | Promise<Response>) => {
    addEventListener("fetch", (event: any) =>
      event.respondWith(handler(event.request)),
    );
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const action = String(body?.action || "");

  let token = getCookie(req, "cart_token");
  let setCookieHeader: string | null = null;

  if (!token || action === "ensure") {
    token = crypto.randomUUID();
    setCookieHeader = setCookie(token);
  }

  if (action === "ensure") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  if (action === "read") {
    const url =
      `${SUPABASE_URL}/rest/v1/carts_guest` +
      `?select=items&token=eq.${encodeURIComponent(token as string)}&limit=1`;
    const res = await fetch(url, { headers: JSON_HEADERS });
    const rows = (await res.json().catch(() => [])) as any[];
    const items = Array.isArray(rows?.[0]?.items) ? rows[0].items : [];
    return new Response(JSON.stringify({ items }), {
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  if (action === "write") {
    const items = Array.isArray(body?.items) ? body.items : [];
    const url = `${SUPABASE_URL}/rest/v1/carts_guest`;
    await fetch(url, {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        token,
        items,
        updated_at: new Date().toISOString(),
      }),
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  return new Response(JSON.stringify({ error: "invalid action" }), {
    status: 400,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});

export {};
