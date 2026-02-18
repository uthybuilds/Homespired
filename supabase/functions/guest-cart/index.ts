import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceRoleKey);

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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
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
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  if (action === "read") {
    const { data } = await supabase
      .from("carts_guest")
      .select("items")
      .eq("token", token as string)
      .maybeSingle();
    const items = Array.isArray(data?.items) ? data.items : [];
    return new Response(JSON.stringify({ items }), {
      headers: {
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  if (action === "write") {
    const items = Array.isArray(body?.items) ? body.items : [];
    await supabase.from("carts_guest").upsert({
      token,
      items,
      updated_at: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
      },
    });
  }

  return new Response(JSON.stringify({ error: "invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
});
