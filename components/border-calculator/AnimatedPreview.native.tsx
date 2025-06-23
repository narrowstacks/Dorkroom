import React, { useRef, useEffect, useMemo } from 'react';
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

  // Get static dimensions for calculations
  const staticDimensions = useMemo(() => ({
    width: calculation?.previewWidth || 0,
    height: calculation?.previewHeight || 0
  }), [calculation?.previewWidth, calculation?.previewHeight]);

  useEffect(() => {
    if (!calculation) return;
    
    // Calculate transform values from percentages  
    const containerWidth = calculation.previewWidth || 0;
    const containerHeight = calculation.previewHeight || 0;
    
    // Convert percentage sizes to scale values (0-1 range)
    const printScaleX = calculation.printWidthPercent / 100;
    const printScaleY = calculation.printHeightPercent / 100;
    
    // Calculate print area dimensions
    const printWidth = (calculation.printWidthPercent / 100) * containerWidth;
    const printHeight = (calculation.printHeightPercent / 100) * containerHeight;
    
    // Calculate position accounting for scale transform origin (center)
    // The print area should be positioned based on its center, not top-left
    const printCenterX = (calculation.leftBorderPercent / 100) * containerWidth + printWidth / 2;
    const printCenterY = (calculation.topBorderPercent / 100) * containerHeight + printHeight / 2;
    
    // Translate to position the center of the scaled element
    const printTranslateX = printCenterX - containerWidth / 2;
    const printTranslateY = printCenterY - containerHeight / 2;

    // ALL animations use native driver - no layout properties
    const nativeAnimationConfig = { duration: 100, useNativeDriver: true };
    
    Animated.parallel([
      // Transform-based positioning and scaling (all native driver compatible)
      Animated.timing(animatedValues.printTranslateX, { toValue: printTranslateX, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.printTranslateY, { toValue: printTranslateY, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.printScaleX, { toValue: printScaleX, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.printScaleY, { toValue: printScaleY, ...nativeAnimationConfig }),
      
      // Blade positions (native driver compatible)
      Animated.timing(animatedValues.leftBladePosition, { toValue: calculation.leftBorderPercent, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.rightBladePosition, { toValue: calculation.rightBorderPercent, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.topBladePosition, { toValue: calculation.topBorderPercent, ...nativeAnimationConfig }),
      Animated.timing(animatedValues.bottomBladePosition, { toValue: calculation.bottomBorderPercent, ...nativeAnimationConfig }),
    ]).start();
    
  }, [calculation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.timing(animatedValues.bladeOpacity, { 
      toValue: showBlades ? 1 : 0, 
      duration: 100, 
      useNativeDriver: true // Opacity can use native driver
    }).start();
  }, [showBlades, animatedValues.bladeOpacity]);

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