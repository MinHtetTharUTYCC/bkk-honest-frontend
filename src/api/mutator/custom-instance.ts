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
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.access_token) {
                config.headers['Authorization'] = `Bearer ${session.access_token}`;
            }
        } catch (e) {
            console.error('[Orval Mutator] Error fetching Supabase session:', e);
        }
        return config;
    });
}

interface PromiseWithCancel<T> extends Promise<T> {
    cancel: () => void;
}

// Custom instance wrapper for Orval
export const customInstance = <T>(
    config: AxiosRequestConfig | string,
    options?: Record<string, unknown>,
): PromiseWithCancel<T> => {
    const source = Axios.CancelToken.source();

    // Transform body -> data for Axios compatibility
    const requestConfig: AxiosRequestConfig = {
        ...(typeof config === 'string' ? { url: config } : config),
        ...(options || {}),
    };

    const bodyConfig = requestConfig as AxiosRequestConfig & { body?: unknown };
    if (requestConfig.data === undefined && bodyConfig.body) {
        requestConfig.data = bodyConfig.body;
        delete bodyConfig.body;
    }

    // Explicitly merge headers if they are provided in options (useful for SSR)
    if (options?.headers && typeof options.headers === 'object') {
        requestConfig.headers = {
            ...requestConfig.headers,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(options.headers as any),
        };
    }

    const promise = AXIOS_INSTANCE({
        ...requestConfig,
        cancelToken: source.token,
    }).then(({ data }) => {
        // Unwrap backend API response envelope if it has status field (e.g., { data: DTO, status: 200 })
        // Only unwrap if there's both 'data' and 'status' to avoid unwrapping legitimate data DTOs
        if (data && typeof data === 'object' && 'data' in data && 'status' in data) {
            return (data as { data: T; status: number }).data;
        }
        return data;
    }) as PromiseWithCancel<T>;

    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

export default customInstance;
