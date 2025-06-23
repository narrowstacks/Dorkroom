import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Animated } from 'react-native';
import { AnimatedBlade } from './AnimatedBlade.native';
import { debugLogAnimationFrame, debugLogPerformance } from '@/utils/debugLogger';

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
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Performance tracking for animation mode switching
  const lastUpdateTimeRef = useRef<number>(0);
  const rapidUpdatesCountRef = useRef<number>(0);
  const isInContinuousModeRef = useRef<boolean>(false);
  
  // Additional performance refs for throttling and FPS tracking
  const lastRenderTimeRef = useRef<number>(0);
  const throttleFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastFpsLogRef = useRef<number>(0);
  const frameTimes = useRef<number[]>([]);

  // Get static dimensions for calculations
  const staticDimensions = useMemo(() => ({
    width: calculation?.previewWidth || 0,
    height: calculation?.previewHeight || 0
  }), [calculation?.previewWidth, calculation?.previewHeight]);

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
    const hasChanged = !previousValuesRef.current || 
      previousValuesRef.current.previewWidth !== currentValues.previewWidth ||
      previousValuesRef.current.previewHeight !== currentValues.previewHeight ||
      previousValuesRef.current.printWidthPercent !== currentValues.printWidthPercent ||
      previousValuesRef.current.printHeightPercent !== currentValues.printHeightPercent ||
      previousValuesRef.current.leftBorderPercent !== currentValues.leftBorderPercent ||
      previousValuesRef.current.rightBorderPercent !== currentValues.rightBorderPercent ||
      previousValuesRef.current.topBorderPercent !== currentValues.topBorderPercent ||
      previousValuesRef.current.bottomBorderPercent !== currentValues.bottomBorderPercent;
    
    // Return cached transform if no changes
    if (!hasChanged && cachedTransformRef.current) {
      return cachedTransformRef.current;
    }
    
    // Calculate new transform values
    const containerWidth = currentValues.previewWidth;
    const containerHeight = currentValues.previewHeight;
    
    const printScaleX = currentValues.printWidthPercent / 100;
    const printScaleY = currentValues.printHeightPercent / 100;
    
    const printWidth = (currentValues.printWidthPercent / 100) * containerWidth;
    const printHeight = (currentValues.printHeightPercent / 100) * containerHeight;
    
    const printCenterX = (currentValues.leftBorderPercent / 100) * containerWidth + printWidth / 2;
    const printCenterY = (currentValues.topBorderPercent / 100) * containerHeight + printHeight / 2;
    
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

  // High-performance update function that bypasses animations during continuous input
  const updateValues = useCallback((values: NonNullable<typeof transformValues>, immediate = false) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // FPS tracking for legacy animations - track actual frame intervals
    if (lastFpsLogRef.current > 0) {
      const frameTime = now - lastFpsLogRef.current;
      frameTimes.current.push(frameTime);
      frameCountRef.current += 1;
      
      // Keep only last 60 frames for rolling average
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }
      
      // Log every 30 frames or every 1000ms, whichever comes first
      if (frameCountRef.current >= 30 || (now - (lastFpsLogRef.current + 1000)) > 0) {
        if (frameTimes.current.length > 0) {
          const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
          
          debugLogAnimationFrame('Legacy Animation', avgFrameTime);
          debugLogPerformance('Legacy Animation Stats', {
            fps: parseFloat((1000 / avgFrameTime).toFixed(1)),
            averageFrameTime: parseFloat(avgFrameTime.toFixed(2)),
            totalFrames: frameCountRef.current,
            animationEngine: 'legacy',
            isInContinuousMode: isInContinuousModeRef.current,
            sampleSize: frameTimes.current.length,
            timestamp: new Date().toISOString()
          });
        }
        
        frameCountRef.current = 0;
      }
    }
    lastFpsLogRef.current = now;
    
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

    // Cancel previous animation, timeout, and throttled frame
    if (currentAnimationRef.current) {
      currentAnimationRef.current.stop();
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (throttleFrameRef.current) {
      cancelAnimationFrame(throttleFrameRef.current);
    }

    const executeUpdate = () => {
      const isInContinuousMode = isInContinuousModeRef.current;
      
      if (immediate || isInContinuousMode) {
        // PERFORMANCE MODE: Use direct value updates - no animations, no JS thread overhead
        animatedValues.printTranslateX.setValue(values.printTranslateX);
        animatedValues.printTranslateY.setValue(values.printTranslateY);
        animatedValues.printScaleX.setValue(values.printScaleX);
        animatedValues.printScaleY.setValue(values.printScaleY);
        animatedValues.leftBladePosition.setValue(values.leftBorderPercent);
        animatedValues.rightBladePosition.setValue(values.rightBorderPercent);
        animatedValues.topBladePosition.setValue(values.topBorderPercent);
        animatedValues.bottomBladePosition.setValue(values.bottomBorderPercent);
      } else {
        // SMOOTH MODE: Use animations for discrete changes
        const nativeAnimationConfig = { 
          duration: 100, 
          useNativeDriver: true 
        };
        
        currentAnimationRef.current = Animated.parallel([
          Animated.timing(animatedValues.printTranslateX, { toValue: values.printTranslateX, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.printTranslateY, { toValue: values.printTranslateY, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.printScaleX, { toValue: values.printScaleX, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.printScaleY, { toValue: values.printScaleY, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.leftBladePosition, { toValue: values.leftBorderPercent, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.rightBladePosition, { toValue: values.rightBorderPercent, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.topBladePosition, { toValue: values.topBorderPercent, ...nativeAnimationConfig }),
          Animated.timing(animatedValues.bottomBladePosition, { toValue: values.bottomBorderPercent, ...nativeAnimationConfig }),
        ]);
        
        currentAnimationRef.current.start();
      }
    };

    if (immediate) {
      executeUpdate();
    } else if (isInContinuousModeRef.current) {
      // PERFORMANCE THROTTLING: Limit updates to 60fps during continuous mode
      const now = performance.now();
      if (now - lastRenderTimeRef.current >= 16.67) { // ~60fps
        lastRenderTimeRef.current = now;
        executeUpdate();
      } else {
        // Cancel previous throttled frame
        if (throttleFrameRef.current) {
          cancelAnimationFrame(throttleFrameRef.current);
        }
        // Schedule for next available frame
        throttleFrameRef.current = requestAnimationFrame(() => {
          lastRenderTimeRef.current = performance.now();
          executeUpdate();
        });
      }
    } else {
      // Minimal debouncing for discrete changes only
      animationTimeoutRef.current = setTimeout(executeUpdate, 8);
    }
  }, [animatedValues]);

  useEffect(() => {
    if (!transformValues) return;
    updateValues(transformValues);
  }, [transformValues, updateValues]);

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
      if (throttleFrameRef.current) {
        cancelAnimationFrame(throttleFrameRef.current);
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