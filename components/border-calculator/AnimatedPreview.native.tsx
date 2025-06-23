import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Animated } from 'react-native';
import { AnimatedBlade } from './AnimatedBlade';

interface AnimatedPreviewProps {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}

export const AnimatedPreview = React.memo(({ calculation, showBlades, borderColor }: AnimatedPreviewProps) => {
  // Pure transform approach - ALL animations use native driver
  const animatedValues = useRef({
    // Print area positioning and scaling (native driver compatible)
    printTranslateX: new Animated.Value(0),
    printTranslateY: new Animated.Value(0),
    printScaleX: new Animated.Value(0),
    printScaleY: new Animated.Value(0),
    
    // Blade opacity and positioning (native driver compatible)
    bladeOpacity: new Animated.Value(showBlades ? 1 : 0),
    leftBladePosition: new Animated.Value(calculation?.leftBorderPercent || 0),
    rightBladePosition: new Animated.Value(calculation?.rightBorderPercent || 0),
    topBladePosition: new Animated.Value(calculation?.topBorderPercent || 0),
    bottomBladePosition: new Animated.Value(calculation?.bottomBorderPercent || 0),
  }).current;

  // Animation control refs for debouncing and cancellation
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Performance tracking for animation mode switching
  const lastUpdateTimeRef = useRef<number>(0);
  const rapidUpdatesCountRef = useRef<number>(0);
  const isInContinuousModeRef = useRef<boolean>(false);

  // Get static dimensions for calculations
  const staticDimensions = useMemo(() => ({
    width: calculation?.previewWidth || 0,
    height: calculation?.previewHeight || 0
  }), [calculation?.previewWidth, calculation?.previewHeight]);

  // Memoize expensive transform calculations to prevent recalculation on every render
  const transformValues = useMemo(() => {
    if (!calculation) return null;
    
    const containerWidth = calculation.previewWidth || 0;
    const containerHeight = calculation.previewHeight || 0;
    
    // Convert percentage sizes to scale values (0-1 range)
    const printScaleX = calculation.printWidthPercent / 100;
    const printScaleY = calculation.printHeightPercent / 100;
    
    // Calculate print area dimensions
    const printWidth = (calculation.printWidthPercent / 100) * containerWidth;
    const printHeight = (calculation.printHeightPercent / 100) * containerHeight;
    
    // Calculate position accounting for scale transform origin (center)
    const printCenterX = (calculation.leftBorderPercent / 100) * containerWidth + printWidth / 2;
    const printCenterY = (calculation.topBorderPercent / 100) * containerHeight + printHeight / 2;
    
    // Translate to position the center of the scaled element
    const printTranslateX = printCenterX - containerWidth / 2;
    const printTranslateY = printCenterY - containerHeight / 2;

    return {
      printTranslateX,
      printTranslateY,
      printScaleX,
      printScaleY,
      leftBorderPercent: calculation.leftBorderPercent,
      rightBorderPercent: calculation.rightBorderPercent,
      topBorderPercent: calculation.topBorderPercent,
      bottomBorderPercent: calculation.bottomBorderPercent,
    };
  }, [calculation]);

  // Intelligent animation function that switches modes based on input frequency
  const animateToValues = useCallback((values: NonNullable<typeof transformValues>, immediate = false) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Track rapid updates to determine if we're in continuous mode (like slider dragging)
    if (timeSinceLastUpdate < 50) { // Updates within 50ms are considered rapid
      rapidUpdatesCountRef.current += 1;
      if (rapidUpdatesCountRef.current >= 3) {
        isInContinuousModeRef.current = true;
      }
    } else {
      // Reset rapid update tracking after a pause
      rapidUpdatesCountRef.current = 0;
      if (timeSinceLastUpdate > 200) { // 200ms pause means we're back to discrete mode
        isInContinuousModeRef.current = false;
      }
    }
    
    lastUpdateTimeRef.current = now;

    // Cancel previous animation and timeout
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop();
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    const executeAnimation = () => {
      // Continuous mode: use minimal or no animation for performance
      // Discrete mode: use smooth animations for better UX
      const isInContinuousMode = isInContinuousModeRef.current;
      const nativeAnimationConfig = { 
        duration: immediate ? 0 : (isInContinuousMode ? 16 : 100), // Very fast in continuous mode
        useNativeDriver: true 
      };
      
      currentAnimationRef.current = Animated.parallel([
        // Transform-based positioning and scaling (all native driver compatible)
        Animated.timing(animatedValues.printTranslateX, { toValue: values.printTranslateX, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.printTranslateY, { toValue: values.printTranslateY, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.printScaleX, { toValue: values.printScaleX, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.printScaleY, { toValue: values.printScaleY, ...nativeAnimationConfig }),
        
        // Blade positions (native driver compatible) 
        Animated.timing(animatedValues.leftBladePosition, { toValue: values.leftBorderPercent, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.rightBladePosition, { toValue: values.rightBorderPercent, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.topBladePosition, { toValue: values.topBorderPercent, ...nativeAnimationConfig }),
        Animated.timing(animatedValues.bottomBladePosition, { toValue: values.bottomBorderPercent, ...nativeAnimationConfig }),
      ]);
      
      currentAnimationRef.current.start();
    };

    if (immediate) {
      executeAnimation();
    } else {
      // In continuous mode, use minimal debouncing to maintain responsiveness
      // In discrete mode, use normal debouncing for smoothness
      const debounceTime = isInContinuousModeRef.current ? 8 : 16;
      animationTimeoutRef.current = setTimeout(executeAnimation, debounceTime);
    }
  }, [animatedValues]);

  useEffect(() => {
    if (!transformValues) return;
    animateToValues(transformValues);
  }, [transformValues, animateToValues]);

  useEffect(() => {
    Animated.timing(animatedValues.bladeOpacity, { 
      toValue: showBlades ? 1 : 0, 
      duration: 100, 
      useNativeDriver: true // Opacity can use native driver
    }).start();
  }, [showBlades, animatedValues.bladeOpacity]);

  // Cleanup animation refs on unmount
  useEffect(() => {
    return () => {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.stop();
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Memoize blade props to prevent recreation on every render
  const bladeProps = useMemo(() => ({ 
    opacity: animatedValues.bladeOpacity, 
    thickness: calculation?.bladeThickness, 
    borderColor,
    containerWidth: staticDimensions.width,
    containerHeight: staticDimensions.height,
  }), [animatedValues.bladeOpacity, calculation?.bladeThickness, borderColor, staticDimensions.width, staticDimensions.height]);

  if (!calculation) return null;

  return (
    <Animated.View style={{ 
      position: 'relative', 
      backgroundColor: 'transparent', 
      overflow: 'hidden', 
      width: calculation?.previewWidth || 0, 
      height: calculation?.previewHeight || 0, 
      borderColor 
    }}>
      <Animated.View style={{ 
        position: 'relative', 
        borderWidth: 1, 
        backgroundColor: 'white', 
        overflow: 'hidden', 
        width: '100%', 
        height: '100%', 
        borderColor 
      }}>
        {/* Print area using pure transforms - no layout property animations */}
        <Animated.View style={{ 
          position: 'absolute', 
          backgroundColor: 'grey',
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
        }} />
        
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
});

AnimatedPreview.displayName = 'AnimatedPreview';