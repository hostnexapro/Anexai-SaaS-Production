import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function resolveSupabaseCredentials() {
  // Prefer VITE_ prefixed vars (correct names), fall back to NEXT_PUBLIC_ variants
  const url = process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || "";
  const key = process.env.VITE_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || "";
  // Auto-correct if they were stored swapped
  if (key.startsWith("https") && !url.startsWith("https")) {
    return { url: key, key: url };
  }
  return { url, key };
}

function getClient(): SupabaseClient {
  if (_client) return _client;

  const { url, key } = resolveSupabaseCredentials();

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  _client = createClient(url, key);
  return _client;
}

export async function getUserFromToken(authHeader: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await getClient().auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function getUserRole(userId: string): Promise<string> {
  const { data, error } = await getClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error || !data) return "user";
  return (data as { role: string }).role ?? "user";
}
