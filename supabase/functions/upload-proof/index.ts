const env = (globalThis as any).Deno?.env;
const SUPABASE_URL = env?.get("SUPABASE_URL");
const SERVICE_KEY = env?.get("SUPABASE_SERVICE_ROLE_KEY");

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
};

function u8FromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function ensureBucket() {
  const url = `${SUPABASE_URL}/storage/v1/bucket`;
  await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${SERVICE_KEY}`,
      apikey: String(SERVICE_KEY),
      "content-type": "application/json",
    },
    body: JSON.stringify({ name: "proofs", public: true }),
  }).catch(() => null);
}

function publicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
}

const serve =
  (globalThis as any).Deno?.serve ||
  ((handler: (req: Request) => Response | Promise<Response>) => {
    addEventListener("fetch", (event: any) =>
      event.respondWith(handler(event.request)),
    );
  });

serve(async (req: Request) => {
  const CORS = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: CORS });

  try {
    const { filename, contentType, base64 } = await req
      .json()
      .catch(() => ({}));
    if (!filename || !base64)
      return new Response("filename and base64 are required", {
        status: 400,
        headers: CORS,
      });

    await ensureBucket();
    const safe = String(filename).replace(/[^\w.\-]+/g, "_");
    const path = `proofs/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;
    const bytes = u8FromBase64(base64);

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${path}`;
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const blob = new Blob([ab], {
      type: contentType || "application/octet-stream",
    });
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${SERVICE_KEY}`,
        apikey: String(SERVICE_KEY),
        "content-type": blob.type,
        "cache-control": "3600",
      },
      body: blob,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return new Response(text || "Upload failed", {
        status: 400,
        headers: CORS,
      });
    }

    return new Response(JSON.stringify({ url: publicUrl(path) }), {
      headers: { "content-type": "application/json", ...CORS },
    });
  } catch (e: any) {
    return new Response(String(e?.message || e || "Unknown error"), {
      status: 500,
      headers: CORS,
    });
  }
});

export {};
