import React, { useRef, useEffect, useMemo } from "react";
import { Animated } from "react-native";
import { AnimatedBlade } from "./AnimatedBlade";

interface AnimatedPreviewProps {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}

export const AnimatedPreview = React.memo(
  ({ calculation, showBlades, borderColor }: AnimatedPreviewProps) => {
    // Simplified animated values structure
    const animatedValues = useRef({
      previewWidth: new Animated.Value(calculation?.previewWidth || 0),
      previewHeight: new Animated.Value(calculation?.previewHeight || 0),
      printLeft: new Animated.Value(calculation?.leftBorderPercent || 0),
      printTop: new Animated.Value(calculation?.topBorderPercent || 0),
      printWidth: new Animated.Value(calculation?.printWidthPercent || 0),
      printHeight: new Animated.Value(calculation?.printHeightPercent || 0),
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
      bladeOpacity: new Animated.Value(showBlades ? 1 : 0),
    }).current;

    // Animation control
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
      if (!calculation) return;

      // Cancel any running animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Unified animation configuration
      const animationConfig = { duration: 150, useNativeDriver: false };

      animationRef.current = Animated.parallel([
        // Size and position animations
        Animated.timing(animatedValues.previewWidth, {
          toValue: calculation.previewWidth,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.previewHeight, {
          toValue: calculation.previewHeight,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.printLeft, {
          toValue: calculation.leftBorderPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.printTop, {
          toValue: calculation.topBorderPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.printWidth, {
          toValue: calculation.printWidthPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.printHeight, {
          toValue: calculation.printHeightPercent,
          ...animationConfig,
        }),

        // Blade position animations
        Animated.timing(animatedValues.leftBladePosition, {
          toValue: calculation.leftBorderPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.rightBladePosition, {
          toValue: calculation.rightBorderPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.topBladePosition, {
          toValue: calculation.topBorderPercent,
          ...animationConfig,
        }),
        Animated.timing(animatedValues.bottomBladePosition, {
          toValue: calculation.bottomBorderPercent,
          ...animationConfig,
        }),
      ]);

      animationRef.current.start();
    }, [calculation, animatedValues]);

    useEffect(() => {
      Animated.timing(animatedValues.bladeOpacity, {
        toValue: showBlades ? 1 : 0,
        duration: 150,
        useNativeDriver: false, // Consistent with other animations
      }).start();
    }, [showBlades, animatedValues.bladeOpacity]);

    // Memoized blade props
    const bladeProps = useMemo(
      () => ({
        opacity: animatedValues.bladeOpacity,
        thickness: calculation?.bladeThickness,
        borderColor,
      }),
      [animatedValues.bladeOpacity, calculation?.bladeThickness, borderColor],
    );

    if (!calculation) return null;

    return (
      <Animated.View
        style={{
          position: "relative",
          backgroundColor: "transparent",
          overflow: "hidden",
          width: animatedValues.previewWidth,
          height: animatedValues.previewHeight,
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
          <Animated.View
            style={{
              position: "absolute",
              backgroundColor: "grey",
              left: animatedValues.printLeft.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              top: animatedValues.printTop.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              width: animatedValues.printWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              height: animatedValues.printHeight.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
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
