import { useState, useCallback } from 'react';
import { ApiClient, ApiError } from '@/services/api-client';
import { useGlobalLoading } from '@/contexts/loading-context';
import { toast } from '@/components/ui/toast';

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  useGlobalLoader?: boolean;
  loadingMessage?: string;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export function useApi<T>(options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useGlobalLoading();
  const api = new ApiClient();

  const {
    onSuccess,
    onError,
    useGlobalLoader = false,
    loadingMessage = 'Loading...',
    showSuccessToast = false,
    successMessage = 'Operation completed successfully'
  } = options;

  const execute = useCallback(
    async <R = T>(
      apiCall: () => Promise<R>,
      localOptions: Partial<UseApiOptions<R>> = {}
    ) => {
      const mergedOptions = { ...options, ...localOptions };
      try {
        if (useGlobalLoader) {
          showLoading(mergedOptions.loadingMessage || loadingMessage);
        } else {
          setIsLoading(true);
        }

        const result = await apiCall();
        setData(result as unknown as T);
        setError(null);

        if (mergedOptions.showSuccessToast) {
          toast({
            title: 'Success',
            description: mergedOptions.successMessage || successMessage,
            variant: 'default',
          });
        }

        mergedOptions.onSuccess?.(result);
        return result;
      } catch (e) {
        const apiError = e instanceof ApiError ? e : new ApiError(500, 'An unexpected error occurred');
        setError(apiError);
        
        toast({
          title: 'Error',
          description: apiError.message,
          variant: 'destructive',
        });

        mergedOptions.onError?.(apiError);
        throw apiError;
      } finally {
        if (useGlobalLoader) {
          hideLoading();
        } else {
          setIsLoading(false);
        }
      }
    },
    [options, useGlobalLoader, loadingMessage, showSuccessToast, successMessage]
  );

  const get = useCallback(
    async <R = T>(url: string, params?: object, localOptions?: Partial<UseApiOptions<R>>) => {
      return execute(() => api.get<R>(url, params), localOptions);
    },
    [execute]
  );

  const post = useCallback(
    async <R = T>(url: string, data?: any, localOptions?: Partial<UseApiOptions<R>>) => {
      return execute(() => api.post<R>(url, data), localOptions);
    },
    [execute]
  );

  const put = useCallback(
    async <R = T>(url: string, data?: any, localOptions?: Partial<UseApiOptions<R>>) => {
      return execute(() => api.put<R>(url, data), localOptions);
    },
    [execute]
  );

  const del = useCallback(
    async <R = T>(url: string, localOptions?: Partial<UseApiOptions<R>>) => {
      return execute(() => api.delete<R>(url), localOptions);
    },
    [execute]
  );

  return {
    data,
    error,
    isLoading,
    get,
    post,
    put,
    delete: del
  };
}