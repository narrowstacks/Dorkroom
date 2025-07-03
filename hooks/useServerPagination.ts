import { useState, useCallback, useMemo } from "react";

/**
 * Server-side pagination hook for managing paginated API data
 * Provides pagination state management and server-side data fetching coordination
 */

export interface ServerPaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export interface ServerPaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export interface UseServerPaginationReturn
  extends ServerPaginationState,
    ServerPaginationActions {
  hasNext: boolean;
  hasPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

export interface UseServerPaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function useServerPagination(
  options: UseServerPaginationOptions = {},
): UseServerPaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 50,
    onPageChange,
    onPageSizeChange,
  } = options;

  // Core pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Computed values
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const hasNext = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPrevious = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // Calculate display indices for current page
  const startIndex = useMemo(() => {
    return Math.max(0, (currentPage - 1) * pageSize + 1);
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(totalItems, currentPage * pageSize);
  }, [currentPage, pageSize, totalItems]);

  // Actions
  const setPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        onPageChange?.(newPage);
      }
    },
    [currentPage, totalPages, onPageChange],
  );

  const setPageSize = useCallback(
    (size: number) => {
      const newSize = Math.max(1, size);
      if (newSize !== pageSize) {
        setPageSizeState(newSize);
        // Reset to first page when page size changes
        setCurrentPage(1);
        onPageSizeChange?.(newSize);
        onPageChange?.(1);
      }
    },
    [pageSize, onPageSizeChange, onPageChange],
  );

  const goToNext = useCallback(() => {
    if (hasNext) {
      setPage(currentPage + 1);
    }
  }, [hasNext, currentPage, setPage]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setPage(currentPage - 1);
    }
  }, [hasPrevious, currentPage, setPage]);

  const setTotal = useCallback((total: number) => {
    setTotalItems(Math.max(0, total));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((err: Error | null) => {
    setError(err);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItems(0);
    setIsLoading(false);
    setError(null);
  }, [initialPage, initialPageSize]);

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    isLoading,
    error,
    hasNext,
    hasPrevious,
    startIndex,
    endIndex,
    // Actions
    setPage,
    setPageSize,
    goToNext,
    goToPrevious,
    setTotal,
    setLoading,
    setError: setErrorState,
    reset,
  };
}
