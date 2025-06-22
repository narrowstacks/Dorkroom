import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { AnimatedBlade } from './AnimatedBlade';

interface AnimatedPreviewProps {
  calculation: any;
  showBlades: boolean;
  borderColor: string;
}

export const AnimatedPreview = ({ calculation, showBlades, borderColor }: AnimatedPreviewProps) => {
  const animatedValues = useRef({
    previewWidth: new Animated.Value(calculation?.previewWidth || 0),
    previewHeight: new Animated.Value(calculation?.previewHeight || 0),
    printLeft: new Animated.Value(calculation?.leftBorderPercent || 0),
    printTop: new Animated.Value(calculation?.topBorderPercent || 0),
    printWidth: new Animated.Value(calculation?.printWidthPercent || 0),
    printHeight: new Animated.Value(calculation?.printHeightPercent || 0),
    bladeOpacity: new Animated.Value(showBlades ? 1 : 0),
    leftBladePosition: new Animated.Value(calculation?.leftBorderPercent || 0),
    rightBladePosition: new Animated.Value(calculation?.rightBorderPercent || 0),
    topBladePosition: new Animated.Value(calculation?.topBorderPercent || 0),
    bottomBladePosition: new Animated.Value(calculation?.bottomBorderPercent || 0),
  }).current;

  useEffect(() => {
    if (!calculation) return;
    const animationConfig = { duration: 100, useNativeDriver: false };
    Animated.parallel([
      Animated.timing(animatedValues.previewWidth, { toValue: calculation.previewWidth, ...animationConfig }),
      Animated.timing(animatedValues.previewHeight, { toValue: calculation.previewHeight, ...animationConfig }),
      Animated.timing(animatedValues.printLeft, { toValue: calculation.leftBorderPercent, ...animationConfig }),
      Animated.timing(animatedValues.printTop, { toValue: calculation.topBorderPercent, ...animationConfig }),
      Animated.timing(animatedValues.printWidth, { toValue: calculation.printWidthPercent, ...animationConfig }),
      Animated.timing(animatedValues.printHeight, { toValue: calculation.printHeightPercent, ...animationConfig }),
      Animated.timing(animatedValues.leftBladePosition, { toValue: calculation.leftBorderPercent, ...animationConfig }),
      Animated.timing(animatedValues.rightBladePosition, { toValue: calculation.rightBorderPercent, ...animationConfig }),
      Animated.timing(animatedValues.topBladePosition, { toValue: calculation.topBorderPercent, ...animationConfig }),
      Animated.timing(animatedValues.bottomBladePosition, { toValue: calculation.bottomBorderPercent, ...animationConfig }),
    ]).start();
  }, [calculation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Animated.timing(animatedValues.bladeOpacity, { 
      toValue: showBlades ? 1 : 0, 
      duration: 100, 
      useNativeDriver: false 
    }).start();
  }, [showBlades]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!calculation) return null;

  const bladeProps = { 
    opacity: animatedValues.bladeOpacity, 
    thickness: calculation.bladeThickness, 
    borderColor 
  };

  return (
    <Animated.View style={{ 
      position: 'relative', 
      backgroundColor: 'transparent', 
      overflow: 'hidden', 
      width: animatedValues.previewWidth, 
      height: animatedValues.previewHeight, 
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
          left: animatedValues.printLeft.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          top: animatedValues.printTop.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          width: animatedValues.printWidth.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
          height: animatedValues.printHeight.interpolate({ 
            inputRange: [0, 100], 
            outputRange: ['0%', '100%'] 
          }), 
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
}; 