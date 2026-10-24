import { createClient } from "../supabase/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Server-side fetch utility that automatically attaches the Supabase session token.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
