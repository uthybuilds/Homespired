import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const buildFunctionUrl = (name) => `${supabaseUrl}/functions/v1/${name}`;

const invokeEdgeFunction = async (name, body) => {
  const response = await fetch(buildFunctionUrl(name), {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    return { error: { message: text, context: { body: text } } };
  }

  if (!text) {
    return { data: null };
  }

  try {
    return { data: JSON.parse(text) };
  } catch {
    return { data: text };
  }
};

export { invokeEdgeFunction };
export default supabase;
