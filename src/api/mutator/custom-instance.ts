import Axios, { AxiosRequestConfig, AxiosInstance } from "axios";

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

if (typeof window !== "undefined") {
  AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.error("[Orval Mutator] Error fetching Supabase session:", e);
    }
    return config;
  });
}

interface PromiseWithCancel<T> extends Promise<T> {
  cancel: () => void;
}

export const customInstance = <T>(
  config: AxiosRequestConfig | string,
  options?: Record<string, unknown>,
): PromiseWithCancel<T> => {
  const source = Axios.CancelToken.source();
  const requestConfig: AxiosRequestConfig = {
    ...(typeof config === "string" ? { url: config } : config),
    ...(options || {}),
  };

  if (options?.headers && typeof options.headers === "object") {
    requestConfig.headers = {
      ...requestConfig.headers,
      ...(options.headers as any),
    };
  }

  const promise = AXIOS_INSTANCE({
    ...requestConfig,
    cancelToken: source.token,
  }).then(({ data }) => data) as PromiseWithCancel<T>;

  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
