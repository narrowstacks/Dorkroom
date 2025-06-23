import React, { useRef, useEffect, useMemo } from 'react';
import { Animated } from 'react-native';
import { AnimatedBlade } from './AnimatedBlade';

interface AnimatedPreviewProps {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}

export const AnimatedPreview = React.memo(({ calculation, showBlades, borderColor }: AnimatedPreviewProps) => {
  // Separate animated values: layout properties use different values than opacity
  const layoutAnimatedValues = useRef({
    previewWidth: new Animated.Value(calculation?.previewWidth || 0),
    previewHeight: new Animated.Value(calculation?.previewHeight || 0),
    printLeft: new Animated.Value(calculation?.leftBorderPercent || 0),
    printTop: new Animated.Value(calculation?.topBorderPercent || 0),
    printWidth: new Animated.Value(calculation?.printWidthPercent || 0),
    printHeight: new Animated.Value(calculation?.printHeightPercent || 0),
    leftBladePosition: new Animated.Value(calculation?.leftBorderPercent || 0),
    rightBladePosition: new Animated.Value(calculation?.rightBorderPercent || 0),
    topBladePosition: new Animated.Value(calculation?.topBorderPercent || 0),
    bottomBladePosition: new Animated.Value(calculation?.bottomBorderPercent || 0),
  }).current;

  // Separate animated value for opacity that can use native driver
  const opacityAnimatedValue = useRef(new Animated.Value(showBlades ? 1 : 0)).current;

  useEffect(() => {
    if (!calculation) return;
    
    // All layout animations must use native driver false (width, height, position properties)
    const layoutAnimationConfig = { duration: 100, useNativeDriver: false };
    
    Animated.parallel([
      // Size animations - must use native driver false for width/height
      Animated.timing(layoutAnimatedValues.previewWidth, { toValue: calculation.previewWidth, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.previewHeight, { toValue: calculation.previewHeight, ...layoutAnimationConfig }),
      
      // Layout animations - must use native driver false for interpolated position values
      Animated.timing(layoutAnimatedValues.printLeft, { toValue: calculation.leftBorderPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.printTop, { toValue: calculation.topBorderPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.printWidth, { toValue: calculation.printWidthPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.printHeight, { toValue: calculation.printHeightPercent, ...layoutAnimationConfig }),
      
      // Blade position animations - must use native driver false for interpolated values
      Animated.timing(layoutAnimatedValues.leftBladePosition, { toValue: calculation.leftBorderPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.rightBladePosition, { toValue: calculation.rightBorderPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.topBladePosition, { toValue: calculation.topBorderPercent, ...layoutAnimationConfig }),
      Animated.timing(layoutAnimatedValues.bottomBladePosition, { toValue: calculation.bottomBorderPercent, ...layoutAnimationConfig }),
    ]).start();
  }, [calculation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.timing(opacityAnimatedValue, { 
      toValue: showBlades ? 1 : 0, 
      duration: 100, 
      useNativeDriver: true // Opacity can use native driver since it's separate
    }).start();
  }, [showBlades, opacityAnimatedValue]);

  // Memoize blade props to prevent recreation on every render
  const bladeProps = useMemo(() => ({ 
    opacity: opacityAnimatedValue, 
    thickness: calculation?.bladeThickness, 
    borderColor 
  }), [opacityAnimatedValue, calculation?.bladeThickness, borderColor]);

  if (!calculation) return null;

  return (
    <Animated.View style={{ 
      position: 'relative', 
      backgroundColor: 'transparent', 
      overflow: 'hidden', 
      width: layoutAnimatedValues.previewWidth, 
      height: layoutAnimatedValues.previewHeight, 
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
        <Animated.View style={{ 
          position: 'absolute', 
          backgroundColor: 'grey', 
          left: layoutAnimatedValues.printLeft.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          top: layoutAnimatedValues.printTop.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          width: layoutAnimatedValues.printWidth.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          height: layoutAnimatedValues.printHeight.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
        }} />
        <AnimatedBlade 
          orientation="vertical" 
          position="left" 
          bladePositionValue={layoutAnimatedValues.leftBladePosition} 
          {...bladeProps} 
        />
        <AnimatedBlade 
          orientation="vertical" 
          position="right" 
          bladePositionValue={layoutAnimatedValues.rightBladePosition} 
          {...bladeProps} 
        />
        <AnimatedBlade 
          orientation="horizontal" 
          position="top" 
          bladePositionValue={layoutAnimatedValues.topBladePosition} 
          {...bladeProps} 
        />
        <AnimatedBlade 
          orientation="horizontal" 
          position="bottom" 
          bladePositionValue={layoutAnimatedValues.bottomBladePosition} 
          {...bladeProps} 
        />
      </Animated.View>
    </Animated.View>
  );
});

AnimatedPreview.displayName = 'AnimatedPreview'; 