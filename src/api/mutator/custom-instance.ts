import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Automatically inject Supabase JWT for authenticated requests - ONLY IN BROWSER
if (typeof window !== 'undefined') {
  AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    try {
      // Dynamic import to avoid SSR issues with client components
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.error('[Orval Mutator] Error fetching Supabase session:', e);
    }
    return config;
  });
}

// Custom instance wrapper for Orval
export const customInstance = <T>(
  config: AxiosRequestConfig | string,
  options?: any,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  // Transform body -> data for Axios compatibility
  const requestConfig: AxiosRequestConfig = {
      ...(typeof config === 'string' ? { url: config } : config),
      ...(options || {}),
  };

  if (requestConfig.data === undefined && (requestConfig as any).body) {
      requestConfig.data = (requestConfig as any).body;
      delete (requestConfig as any).body;
  }

  // Explicitly merge headers if they are provided in options (useful for SSR)
  if (options?.headers) {
    requestConfig.headers = { ...requestConfig.headers, ...options.headers };
  }

  const promise = AXIOS_INSTANCE({
    ...requestConfig,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
