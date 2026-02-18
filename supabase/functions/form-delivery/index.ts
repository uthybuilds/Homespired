const serve = (
  globalThis as {
    Deno?: {
      serve?: (handler: (req: Request) => Response | Promise<Response>) => void;
    };
  }
).Deno?.serve;

if (!serve) {
  throw new Error("Deno.serve is not available");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const getEnv = (key: string) => {
  const env = (
    globalThis as {
      Deno?: { env?: { get?: (name: string) => string | undefined } };
    }
  ).Deno?.env;
  return env?.get ? env.get(key) : undefined;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendKey = getEnv("RESEND_API_KEY");
  if (!resendKey) {
    return new Response(
      JSON.stringify({ error: "Missing email provider key" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const to = getEnv("HOMESPIRED_NOTIFICATION_EMAIL") || "hello@homespired.ng";
  const from = getEnv("HOMESPIRED_EMAIL_FROM") || "onboarding@resend.dev";

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { type, payload } = body || {};
  if (!type || !payload) {
    return new Response(JSON.stringify({ error: "Missing payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const escapeHtml = (value: unknown) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderValue = (value: unknown) => {
    const raw = String(value);
    if (/^https?:\/\//i.test(raw)) {
      const safe = escapeHtml(raw);
      return `<a href="${safe}" style="color:#1f1b16;">${safe}</a>`;
    }
    return escapeHtml(raw);
  };

  const title =
    payload.requestType ||
    (type === "contact_request"
      ? "Contact Request"
      : type === "consultation_request"
        ? "Consultation Request"
        : "New Form Submission");
  const subjectParts = [
    title,
    payload.clientName,
    payload.city || payload.state,
  ]
    .filter((part) => String(part || "").trim().length > 0)
    .map((part) => String(part).trim());
  const subject = subjectParts.join(" — ");

  const formattedPrice =
    typeof payload.price === "number"
      ? `₦${payload.price.toLocaleString()}`
      : payload.price;

  const proofValue = payload.proofUrl || "";
  const fields = [
    ["Name", payload.clientName],
    ["Email", payload.clientEmail],
    ["Phone", payload.clientPhone],
    [
      "Request Ref",
      payload.requestRef
        ? payload.requestRef
        : payload.orderId
          ? `#${payload.orderId}`
          : "",
    ],
    ["Package", payload.packageTitle],
    ["Total", formattedPrice],
    ["Address", payload.address],
    ["City", payload.city],
    ["State", payload.state],
    ["Notes", payload.notes || payload.message],
  ].filter(([, value]) => String(value || "").trim().length > 0) as Array<
    [string, string]
  >;
  if (type !== "payment_confirmed" && String(proofValue).trim().length > 0) {
    fields.push(["Payment Proof", proofValue]);
  }

  const payloadLines: string[] = Array.isArray(payload.lines)
    ? payload.lines.map((line: string) => String(line))
    : [];
  const parsedFields: Array<[string, string]> = payloadLines
    .map((line: string) => {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      if (!value) {
        return ["Detail", line] as [string, string];
      }
      return [label.trim(), value] as [string, string];
    })
    .filter(([, value]) => String(value || "").trim().length > 0);
  const displayFields = fields.length > 0 ? fields : parsedFields;
  const rows = displayFields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#8a8177;font-size:13px;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#1f1b16;font-size:14px;">${renderValue(value)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f5f2ee;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;padding:24px;">
          <div style="background:#ffffff;border:1px solid #e6e0d8;border-radius:16px;padding:24px;">
            <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#8a8177;">Homespired Studio</div>
            <h1 style="font-size:20px;margin:10px 0 16px;color:#1f1b16;">${escapeHtml(title)}</h1>
            <table style="width:100%;border-collapse:collapse;">
              ${rows}
            </table>
          </div>
          <div style="font-size:11px;color:#9c948a;text-align:center;margin-top:16px;">
            Sent from homespired.ng
          </div>
        </div>
      </body>
    </html>
  `;

  const text = Array.isArray(payload.lines)
    ? payload.lines.join("\n")
    : displayFields.map(([label, value]) => `${label}: ${value}`).join("\n");

  const responseBody: Record<string, unknown> = {
    from,
    to,
    subject,
    text,
    html,
  };

  if (payload.clientEmail) {
    responseBody.reply_to = payload.clientEmail;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ error: errorText }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
