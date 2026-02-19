import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: supabaseAnonKey
    ? {
        headers: {
          apikey: supabaseAnonKey,
        },
      }
    : {},
});

const invokeEdgeFunction = async (name, body) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: {
        message:
          "Supabase keys are missing in the frontend environment. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      },
    };
  }
  const functionUrl = `${supabaseUrl}/functions/v1/${name}?apikey=${supabaseAnonKey}`;
  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      return { error: { message: text || "Request failed." } };
    }
    if (!text) {
      return { data: null };
    }
    try {
      return { data: JSON.parse(text) };
    } catch {
      return { data: text };
    }
  } catch (error) {
    return {
      error: {
        message:
          error?.message || "Edge function request failed. Please try again.",
        context: error,
      },
    };
  }
};

export { invokeEdgeFunction };
export default supabase;
