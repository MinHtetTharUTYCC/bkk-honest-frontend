import createClient from "openapi-fetch";
import type { paths } from "@/types/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const openApiClient = createClient<paths>({
  baseUrl,
});

// Automatically inject Supabase JWT for authenticated requests
openApiClient.use({
  async onRequest({ request }) {
    // Only add token if we are in the browser
    if (typeof window !== 'undefined') {
      try {
        const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
        const supabase = createSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          request.headers.set("Authorization", `Bearer ${session.access_token}`);
        }
      } catch (e) {
        console.error("[openApiClient] Auth middleware error:", e);
      }
    }
    return request;
  },
});
