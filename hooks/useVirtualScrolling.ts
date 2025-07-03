import { useState, useCallback, useMemo, useRef } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

/**
 * Virtual scrolling hook for optimizing large lists
 * Provides window-based rendering with configurable item heights
 */

export interface VirtualScrollingOptions {
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  enableDynamicHeight?: boolean;
}

export interface VirtualScrollingState {
  visibleStartIndex: number;
  visibleEndIndex: number;
  scrollOffset: number;
  containerHeight: number;
  totalHeight: number;
  isScrolling: boolean;
}

export interface VirtualScrollingActions {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  getItemLayout: (index: number) => {
    length: number;
    offset: number;
    index: number;
  };
}

export interface UseVirtualScrollingReturn
  extends VirtualScrollingState,
    VirtualScrollingActions {
  visibleItems: Array<{ index: number; item: any }>;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

export function useVirtualScrolling<T>(
  items: T[],
  options: VirtualScrollingOptions = {},
): UseVirtualScrollingReturn {
  const {
    itemHeight = 80,
    containerHeight = 400,
    overscan = 5,
    enableDynamicHeight = false,
  } = options;

  const [state, setState] = useState<VirtualScrollingState>({
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    scrollOffset: 0,
    containerHeight,
    totalHeight: 0,
    isScrolling: false,
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const dynamicHeightsRef = useRef<Map<number, number>>(new Map());

  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(
    (scrollTop: number, viewportHeight: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.ceil((scrollTop + viewportHeight) / itemHeight);

      return {
        start: Math.max(0, start - overscan),
        end: Math.min(items.length - 1, end + overscan),
      };
    },
    [itemHeight, overscan, items.length],
  );

  // Get item height (supports dynamic heights)
  const getItemHeight = useCallback(
    (index: number) => {
      if (enableDynamicHeight && dynamicHeightsRef.current.has(index)) {
        return dynamicHeightsRef.current.get(index)!;
      }
      return itemHeight;
    },
    [itemHeight, enableDynamicHeight],
  );

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (enableDynamicHeight) {
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += getItemHeight(i);
      }
      return height;
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight, enableDynamicHeight, getItemHeight]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const result: Array<{ index: number; item: T }> = [];

    for (let i = state.visibleStartIndex; i <= state.visibleEndIndex; i++) {
      if (i < items.length) {
        result.push({ index: i, item: items[i] });
      }
    }

    return result;
  }, [items, state.visibleStartIndex, state.visibleEndIndex]);

  // Calculate spacer heights
  const topSpacerHeight = useMemo(() => {
    if (enableDynamicHeight) {
      let height = 0;
      for (let i = 0; i < state.visibleStartIndex; i++) {
        height += getItemHeight(i);
      }
      return height;
    }
    return state.visibleStartIndex * itemHeight;
  }, [state.visibleStartIndex, itemHeight, enableDynamicHeight, getItemHeight]);

  const bottomSpacerHeight = useMemo(() => {
    if (enableDynamicHeight) {
      let height = 0;
      for (let i = state.visibleEndIndex + 1; i < items.length; i++) {
        height += getItemHeight(i);
      }
      return height;
    }
    return (items.length - state.visibleEndIndex - 1) * itemHeight;
  }, [
    state.visibleEndIndex,
    items.length,
    itemHeight,
    enableDynamicHeight,
    getItemHeight,
  ]);

  // Handle scroll events
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const scrollTop = contentOffset.y;
      const viewportHeight = layoutMeasurement.height;

      const range = calculateVisibleRange(scrollTop, viewportHeight);

      setState((prev) => ({
        ...prev,
        visibleStartIndex: range.start,
        visibleEndIndex: range.end,
        scrollOffset: scrollTop,
        containerHeight: viewportHeight,
        totalHeight,
        isScrolling: true,
      }));

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isScrolling: false }));
      }, 150);
    },
    [calculateVisibleRange, totalHeight],
  );

  // Handle layout changes
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      const range = calculateVisibleRange(state.scrollOffset, height);

      setState((prev) => ({
        ...prev,
        containerHeight: height,
        visibleStartIndex: range.start,
        visibleEndIndex: range.end,
        totalHeight,
      }));
    },
    [calculateVisibleRange, state.scrollOffset, totalHeight],
  );

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, animated: boolean = true) => {
      // This would need to be implemented with a ref to the scrollable component
      // For now, we'll just update the visible range
      const scrollTop = index * itemHeight;
      const range = calculateVisibleRange(scrollTop, state.containerHeight);

      setState((prev) => ({
        ...prev,
        visibleStartIndex: range.start,
        visibleEndIndex: range.end,
        scrollOffset: scrollTop,
      }));
    },
    [itemHeight, calculateVisibleRange, state.containerHeight],
  );

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback(
    (index: number) => ({
      length: getItemHeight(index),
      offset: index * itemHeight,
      index,
    }),
    [itemHeight, getItemHeight],
  );

  // Initialize visible range
  useMemo(() => {
    if (items.length > 0 && state.visibleEndIndex === 0) {
      const range = calculateVisibleRange(0, state.containerHeight);
      setState((prev) => ({
        ...prev,
        visibleStartIndex: range.start,
        visibleEndIndex: range.end,
        totalHeight,
      }));
    }
  }, [
    items.length,
    state.visibleEndIndex,
    calculateVisibleRange,
    state.containerHeight,
    totalHeight,
  ]);

  return {
    // State
    visibleStartIndex: state.visibleStartIndex,
    visibleEndIndex: state.visibleEndIndex,
    scrollOffset: state.scrollOffset,
    containerHeight: state.containerHeight,
    totalHeight,
    isScrolling: state.isScrolling,

    // Computed values
    visibleItems,
    topSpacerHeight,
    bottomSpacerHeight,

    // Actions
    onScroll,
    onLayout,
    scrollToIndex,
    getItemLayout,
  };
}
