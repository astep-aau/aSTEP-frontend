import { 
    useEffect, 
    useState 
} from "react";

/**
 * @description Result object returned by the useApi hook
 * @template T - The expected type of the fetched data
 */
interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

  /**
   * Custom hook to fetch data from an API endpoint with loading and error states
   * 
   * @template T - The expected type of the response data
   * @param url - The API endpoint URL to fetch from
   * @returns An object containing the fetched data, loading state, and any error encountered
   * @example
   * ```tsx
   * const { data, loading, error } = useApi<ModelType[]>('/api/imputation/model-types');
   * 
   * if (loading) return <Spinner />;
   * if (error) return <ErrorDisplay error={error} />;
   * if (!data) return null;
   * 
   * return <ModelList models={data} />;
   * ```
   */
export function useApi<T>(url: string): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
                return response.json();
            })

            .then(data => {
                if (!cancelled) {
                    setData(data);
                    setError(null);
                }
            })

            .catch(err => {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setData(null);
                }
            })

            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [url]);
    return { data, loading, error };

}