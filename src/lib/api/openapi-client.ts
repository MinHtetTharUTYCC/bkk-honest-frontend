import createClient from "openapi-fetch";

import type { paths } from "@/types/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const openApiClient = createClient<paths>({
  baseUrl,
});
