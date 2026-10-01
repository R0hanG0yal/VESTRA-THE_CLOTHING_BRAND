"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 24;

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
 * sentinel element scrolls into view.
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

  const reqId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  loadingRef.current = loading || loadingMore;
  hasMoreRef.current = hasMore;
  pageRef.current = page;

  const fetchPage = useCallback(
    async (p: number, replace: boolean) => {
      if (!replace && (loadingRef.current || !hasMoreRef.current)) return;

      const id = ++reqId.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `/api/products?${query}&page=${p}&limit=${PAGE_SIZE}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Could not load products");
        const data = await res.json();
        if (id !== reqId.current) return;

        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        const more = Boolean(data.hasMore);
        setHasMore(more);
        hasMoreRef.current = more;
        setTotal(data.total ?? 0);
        setPage(p);
        pageRef.current = p;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (id !== reqId.current) return;
        setError("Something went wrong while loading the feed.");
        setHasMore(false);
        hasMoreRef.current = false;
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
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    fetchPage(1, true);
    return () => abortRef.current?.abort();
  }, [fetchPage, nonce]);

  // Observer that pulls the next page when the sentinel is near.
  useEffect(() => {
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current && hasMoreRef.current) {
          fetchPage(pageRef.current + 1, false);
        }
      },
      { rootMargin: "400px 0px" },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [node, fetchPage]);

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
