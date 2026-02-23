"use client";

import { useState, useCallback, useRef } from "react";

interface UseApiOptions {
  token: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function useApi({ token }: UseApiOptions) {
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const fetchApi = useCallback(async <T>(
    path: string,
    options?: RequestInit
  ): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokenRef.current) {
      headers["Authorization"] = `Bearer ${tokenRef.current}`;
    }

    const res = await fetch(path, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (res.status === 401) {
      // Token expired -- caller should handle
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `API error: ${res.status}`);
    }

    return res.json();
  }, []);

  const get = useCallback(<T>(path: string) => fetchApi<T>(path), [fetchApi]);

  const post = useCallback(<T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: "POST", body: JSON.stringify(body) }), [fetchApi]);

  const put = useCallback(<T>(path: string, body: unknown) =>
    fetchApi<T>(path, { method: "PUT", body: JSON.stringify(body) }), [fetchApi]);

  const del = useCallback(<T>(path: string) =>
    fetchApi<T>(path, { method: "DELETE" }), [fetchApi]);

  return { get, post, put, del };
}

// Hook for paginated data
export function usePaginatedApi<T>({ token }: UseApiOptions) {
  const { get } = useApi({ token });
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (path: string, pageNum?: number) => {
    setLoading(true);
    setError(null);
    try {
      const p = pageNum || page;
      const separator = path.includes("?") ? "&" : "?";
      const result = await get<PaginatedResponse<T>>(`${path}${separator}page=${p}`);
      setData(result.data);
      setTotal(result.total);
      if (pageNum) setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [get, page]);

  return { data, total, loading, error, page, setPage, fetch };
}
