// Minimal, CORS-safe proof uploader to Supabase Storage using service role
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey, {
  global: { headers: { Authorization: `Bearer ${serviceKey}` } },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toUint8ArrayFromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const { filename, contentType, base64 } = await req.json().catch(() => ({}));
    if (!filename || !base64) {
      return new Response("filename and base64 are required", { status: 400, headers: corsHeaders });
    }

    // Ensure bucket exists (id: proofs, public: true)
    await supabase.storage.createBucket("proofs", { public: true }).catch(() => {});

    const safeName = String(filename).replace(/[^\w.\-]+/g, "_");
    const path = `proofs/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const bytes = toUint8ArrayFromBase64(base64);

    const { error: uploadErr } = await supabase.storage
      .from("proofs")
      .upload(path, bytes, {
        upsert: true,
        contentType: contentType || "application/octet-stream",
        cacheControl: "3600",
      });
    if (uploadErr) {
      return new Response(uploadErr.message, { status: 400, headers: corsHeaders });
    }

    const { data: pub } = supabase.storage.from("proofs").getPublicUrl(path);
    if (!pub?.publicUrl) {
      return new Response("Failed to get public URL", { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ url: pub.publicUrl }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(String(e?.message || e || "Unknown error"), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

