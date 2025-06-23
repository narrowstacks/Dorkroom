import React, { useMemo } from 'react';
import { Animated } from 'react-native';

interface AnimatedBladeProps {
  orientation: 'vertical' | 'horizontal';
  position: 'left' | 'right' | 'top' | 'bottom';
  bladePositionValue: Animated.Value;
  opacity: Animated.Value;
  thickness: number;
  borderColor: string;
  containerWidth?: number;
  containerHeight?: number;
}

export const AnimatedBlade = React.memo(({ 
  orientation, 
  position, 
  bladePositionValue, 
  opacity, 
  thickness, 
  borderColor,
  containerWidth = 100,
  containerHeight = 100
}: AnimatedBladeProps) => {
  
  // Memoize interpolation to prevent recreation on every render 
  const transformValue = useMemo(() => 
    bladePositionValue.interpolate({
      inputRange: [0, 100],
      outputRange: orientation === 'vertical' 
        ? [0, containerWidth] 
        : [0, containerHeight]
    }), 
    [bladePositionValue, orientation, containerWidth, containerHeight]
  );
  
  // Memoize common styles to prevent object recreation
  const commonStyle = useMemo(() => ({ 
    position: 'absolute' as const, 
    backgroundColor: borderColor,
  }), [borderColor]);
  
  // Memoize orientation-specific styles
  const orientationStyle = useMemo(() => 
    orientation === 'vertical' 
      ? { 
          top: -1000, 
          bottom: -1000, 
          width: thickness,
          left: 0, // Base position, will be overridden by transform
        } 
      : { 
          left: -1000, 
          right: -1000, 
          height: thickness,
          top: 0, // Base position, will be overridden by transform
        },
    [orientation, thickness]
  );
  
  // Memoize transform calculation to prevent recalculation on every render
  const transform = useMemo(() => {
    const offsetTranslation = position === 'left' 
      ? [{ translateX: -thickness }] 
      : position === 'right' 
        ? [{ translateX: thickness }] 
        : position === 'top' 
          ? [{ translateY: -thickness }] 
          : [{ translateY: thickness }];
    
    // Combine position transform with offset transform
    if (orientation === 'vertical') {
      return [
        { translateX: transformValue },
        ...offsetTranslation
      ];
    } else {
      return [
        { translateY: transformValue },
        ...offsetTranslation
      ];
    }
  }, [orientation, position, thickness, transformValue]);
  
  return (
    <Animated.View 
      style={[
        commonStyle, 
        orientationStyle,
        {
          opacity, // Animated opacity value
          transform
        }
      ]} 
    />
  );
});

AnimatedBlade.displayName = 'AnimatedBlade';