import React from 'react';
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

export const AnimatedBlade = ({ 
  orientation, 
  position, 
  bladePositionValue, 
  opacity, 
  thickness, 
  borderColor,
  containerWidth = 100,
  containerHeight = 100
}: AnimatedBladeProps) => {
  
  // Convert percentage to pixel position for transforms
  const transformValue = bladePositionValue.interpolate({
    inputRange: [0, 100],
    outputRange: orientation === 'vertical' 
      ? [0, containerWidth] 
      : [0, containerHeight]
  });
  
  const commonStyle = { 
    position: 'absolute' as const, 
    backgroundColor: borderColor,
    // Use opacity from animated value with native driver support
  };
  
  // Base positioning and sizing
  const orientationStyle = orientation === 'vertical' 
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
      };
  
  // Calculate transform based on position and orientation
  const getTransform = () => {
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
  };
  
  return (
    <Animated.View 
      style={[
        commonStyle, 
        orientationStyle,
        {
          opacity, // Animated opacity value
          transform: getTransform()
        }
      ]} 
    />
  );
};