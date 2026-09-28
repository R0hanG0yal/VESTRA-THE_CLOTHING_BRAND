"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 12;

export interface FeedState {
  items: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number;
  error: string | null;
  sentinelRef: (node: HTMLDivElement | null) => void;
  retry: () => void;
}

/**
 * Loads a paginated product feed and appends the next page whenever the
 * sentinel element scrolls into view. Also exposes a manual retry.
 */
export function useInfiniteProducts(query: string): FeedState {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Monotonic request id + abort controller so a slow response for a previous
  // query can never append stale items, and rapid filter changes don't drop the
  // reset fetch.
  const reqId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (p: number, replace: boolean) => {
      const id = ++reqId.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/products?${query}&page=${p}&limit=${PAGE_SIZE}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!res.ok) throw new Error("Could not load products");
        const data = await res.json();
        if (id !== reqId.current) return; // stale response — ignore
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setHasMore(Boolean(data.hasMore));
        setTotal(data.total ?? 0);
        setPage(p);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (id !== reqId.current) return;
        setError("Something went wrong while loading the feed.");
        setHasMore(false);
      } finally {
        if (id === reqId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [query],
  );

  // Reset + load first page whenever the query changes.
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
    return () => abortRef.current?.abort();
  }, [fetchPage, nonce]);

  // Single observer that pulls the next page when the sentinel is near.
  useEffect(() => {
    if (!node || !hasMore || loading || loadingMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchPage(page + 1, false);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, page, hasMore, loading, loadingMore, fetchPage]);

  const sentinelRef = useCallback((n: HTMLDivElement | null) => setNode(n), []);
  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    total,
    error,
    sentinelRef,
    retry,
  };
}
