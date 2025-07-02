import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { Animated } from "react-native";
import { AnimatedBlade } from "./AnimatedBlade.native";
// Removed debug imports - no longer needed with simplified animation system

interface AnimatedPreviewProps {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}

export const AnimatedPreview = React.memo(
  ({ calculation, showBlades, borderColor }: AnimatedPreviewProps) => {
    // Pure transform approach - ALL animations use native driver
    const animatedValues = useRef({
      // Print area positioning and scaling (native driver compatible)
      printTranslateX: new Animated.Value(0),
      printTranslateY: new Animated.Value(0),
      printScaleX: new Animated.Value(0),
      printScaleY: new Animated.Value(0),

      // Blade opacity and positioning (native driver compatible)
      bladeOpacity: new Animated.Value(showBlades ? 1 : 0),
      leftBladePosition: new Animated.Value(
        calculation?.leftBorderPercent || 0,
      ),
      rightBladePosition: new Animated.Value(
        calculation?.rightBorderPercent || 0,
      ),
      topBladePosition: new Animated.Value(calculation?.topBorderPercent || 0),
      bottomBladePosition: new Animated.Value(
        calculation?.bottomBorderPercent || 0,
      ),
    }).current;

    // Animation control with debouncing to prevent excessive restarts
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const animationTimeoutRef = useRef<number | null>(null);

    // Get static dimensions for calculations
    const staticDimensions = useMemo(
      () => ({
        width: calculation?.previewWidth || 0,
        height: calculation?.previewHeight || 0,
      }),
      [calculation?.previewWidth, calculation?.previewHeight],
    );

    // Smart change detection - track individual values instead of entire calculation object
    const currentValues = useMemo(() => {
      if (!calculation) return null;

      return {
        previewWidth: calculation.previewWidth || 0,
        previewHeight: calculation.previewHeight || 0,
        printWidthPercent: calculation.printWidthPercent || 0,
        printHeightPercent: calculation.printHeightPercent || 0,
        leftBorderPercent: calculation.leftBorderPercent || 0,
        rightBorderPercent: calculation.rightBorderPercent || 0,
        topBorderPercent: calculation.topBorderPercent || 0,
        bottomBorderPercent: calculation.bottomBorderPercent || 0,
      };
    }, [calculation]);

    // Cache refs for smart change detection
    const previousValuesRef = useRef<typeof currentValues>(null);
    const cachedTransformRef = useRef<any>(null);

    // Only recalculate transform values when meaningful changes occur
    const transformValues = useMemo(() => {
      if (!currentValues) return null;

      // Check if any actual values have changed
      const hasChanged =
        !previousValuesRef.current ||
        previousValuesRef.current.previewWidth !== currentValues.previewWidth ||
        previousValuesRef.current.previewHeight !==
          currentValues.previewHeight ||
        previousValuesRef.current.printWidthPercent !==
          currentValues.printWidthPercent ||
        previousValuesRef.current.printHeightPercent !==
          currentValues.printHeightPercent ||
        previousValuesRef.current.leftBorderPercent !==
          currentValues.leftBorderPercent ||
        previousValuesRef.current.rightBorderPercent !==
          currentValues.rightBorderPercent ||
        previousValuesRef.current.topBorderPercent !==
          currentValues.topBorderPercent ||
        previousValuesRef.current.bottomBorderPercent !==
          currentValues.bottomBorderPercent;

      // Return cached transform if no changes
      if (!hasChanged && cachedTransformRef.current) {
        return cachedTransformRef.current;
      }

      // Calculate new transform values
      const containerWidth = currentValues.previewWidth;
      const containerHeight = currentValues.previewHeight;

      const printScaleX = currentValues.printWidthPercent / 100;
      const printScaleY = currentValues.printHeightPercent / 100;

      const printWidth =
        (currentValues.printWidthPercent / 100) * containerWidth;
      const printHeight =
        (currentValues.printHeightPercent / 100) * containerHeight;

      const printCenterX =
        (currentValues.leftBorderPercent / 100) * containerWidth +
        printWidth / 2;
      const printCenterY =
        (currentValues.topBorderPercent / 100) * containerHeight +
        printHeight / 2;

      const printTranslateX = printCenterX - containerWidth / 2;
      const printTranslateY = printCenterY - containerHeight / 2;

      // Fix blade positioning - right blade position should be inverted from rightBorderPercent
      // Bottom blade position should be inverted from bottomBorderPercent
      const result = {
        printTranslateX,
        printTranslateY,
        printScaleX,
        printScaleY,
        leftBorderPercent: currentValues.leftBorderPercent,
        rightBorderPercent: 100 - currentValues.rightBorderPercent, // Invert for correct positioning
        topBorderPercent: currentValues.topBorderPercent,
        bottomBorderPercent: 100 - currentValues.bottomBorderPercent, // Invert for correct positioning
      };

      // Update caches
      previousValuesRef.current = { ...currentValues };
      cachedTransformRef.current = result;

      return result;
    }, [currentValues]);

    // Debounced update function to prevent excessive animation restarts
    const updateValues = useCallback(
      (values: NonNullable<typeof transformValues>) => {
        // Clear previous timeout
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        // Debounce animation updates - prevents excessive restarts during rapid changes
        animationTimeoutRef.current = setTimeout(() => {
          // Cancel any running animation
          if (animationRef.current) {
            animationRef.current.stop();
          }

          // Optimized animation config for native - shorter duration for snappier response
          const animationConfig = {
            duration: 100, // Reduced from 150ms for snappier response
            useNativeDriver: true,
          };

          animationRef.current = Animated.parallel([
            Animated.timing(animatedValues.printTranslateX, {
              toValue: values.printTranslateX,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.printTranslateY, {
              toValue: values.printTranslateY,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.printScaleX, {
              toValue: values.printScaleX,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.printScaleY, {
              toValue: values.printScaleY,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.leftBladePosition, {
              toValue: values.leftBorderPercent,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.rightBladePosition, {
              toValue: values.rightBorderPercent,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.topBladePosition, {
              toValue: values.topBorderPercent,
              ...animationConfig,
            }),
            Animated.timing(animatedValues.bottomBladePosition, {
              toValue: values.bottomBorderPercent,
              ...animationConfig,
            }),
          ]);

          animationRef.current.start();
        }, 16); // 16ms debounce - roughly one frame at 60fps
      },
      [animatedValues],
    );

    useEffect(() => {
      if (!transformValues) return;
      updateValues(transformValues);
    }, [transformValues, updateValues]);

    useEffect(() => {
      Animated.timing(animatedValues.bladeOpacity, {
        toValue: showBlades ? 1 : 0,
        duration: 100,
        useNativeDriver: true, // Opacity can use native driver
      }).start();
    }, [showBlades, animatedValues.bladeOpacity]);

    // Cleanup animation and timeouts on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
      };
    }, []);

    // Memoize blade props to prevent recreation on every render
    const bladeProps = useMemo(
      () => ({
        opacity: animatedValues.bladeOpacity,
        thickness: calculation?.bladeThickness,
        borderColor,
        containerWidth: staticDimensions.width,
        containerHeight: staticDimensions.height,
      }),
      [
        animatedValues.bladeOpacity,
        calculation?.bladeThickness,
        borderColor,
        staticDimensions.width,
        staticDimensions.height,
      ],
    );

    if (!calculation) return null;

    return (
      <Animated.View
        style={{
          position: "relative",
          backgroundColor: "transparent",
          overflow: "hidden",
          width: calculation?.previewWidth || 0,
          height: calculation?.previewHeight || 0,
          borderColor,
        }}
      >
        <Animated.View
          style={{
            position: "relative",
            borderWidth: 1,
            backgroundColor: "white",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            borderColor,
          }}
        >
          {/* Print area using pure transforms - no layout property animations */}
          <Animated.View
            style={{
              position: "absolute",
              backgroundColor: "grey",
              left: 0,
              top: 0,
              width: staticDimensions.width,
              height: staticDimensions.height,
              transform: [
                { translateX: animatedValues.printTranslateX },
                { translateY: animatedValues.printTranslateY },
                { scaleX: animatedValues.printScaleX },
                { scaleY: animatedValues.printScaleY },
              ],
            }}
          />

          <AnimatedBlade
            orientation="vertical"
            position="left"
            bladePositionValue={animatedValues.leftBladePosition}
            {...bladeProps}
          />
          <AnimatedBlade
            orientation="vertical"
            position="right"
            bladePositionValue={animatedValues.rightBladePosition}
            {...bladeProps}
          />
          <AnimatedBlade
            orientation="horizontal"
            position="top"
            bladePositionValue={animatedValues.topBladePosition}
            {...bladeProps}
          />
          <AnimatedBlade
            orientation="horizontal"
            position="bottom"
            bladePositionValue={animatedValues.bottomBladePosition}
            {...bladeProps}
          />
        </Animated.View>
      </Animated.View>
    );
  },
);

AnimatedPreview.displayName = "AnimatedPreview";
