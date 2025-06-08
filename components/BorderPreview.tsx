import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { Box, Button, ButtonText } from '@gluestack-ui/themed';
import { ThemedView } from '@/components/ThemedView';

interface BorderPreviewProps {
  calculation: any;
  animatedValues: {
    printScaleX: SharedValue<number>;
    printScaleY: SharedValue<number>;
    printTranslateX: SharedValue<number>;
    printTranslateY: SharedValue<number>;
    leftBladeTranslateX: SharedValue<number>;
    rightBladeTranslateX: SharedValue<number>;
    topBladeTranslateY: SharedValue<number>;
    bottomBladeTranslateY: SharedValue<number>;
  };
  showBlades: boolean;
  borderColor: string;
  isDesktop?: boolean;
  isLandscape: boolean;
  isRatioFlipped: boolean;
  onFlipOrientation: () => void;
  onFlipAspectRatio: () => void;
}

export const BorderPreview = memo<BorderPreviewProps>(({
  calculation,
  animatedValues,
  showBlades,
  borderColor,
  isDesktop = false,
  isLandscape,
  isRatioFlipped,
  onFlipOrientation,
  onFlipAspectRatio,
}) => {
  if (!calculation) return null;

  // Memoize style objects to reduce computation
  const previewContainerStyle = useMemo(() => [
    styles.previewContainer,
    {
      height: calculation.containerHeight,
      width: calculation.containerWidth,
      borderColor,
    },
  ], [calculation.containerHeight, calculation.containerWidth, borderColor]);

  const paperPreviewStyle = useMemo(() => [
    styles.paperPreview,
    {
      width: calculation.previewWidth,
      height: calculation.previewHeight,
      borderColor,
      backgroundColor: 'white',
      position: 'absolute' as const,
      top: (calculation.containerHeight - calculation.previewHeight) / 2,
      left: (calculation.containerWidth - calculation.previewWidth) / 2,
    },
  ], [calculation, borderColor]);

  // Reanimated animated styles
  const printPreviewAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: calculation.previewWidth,
      height: calculation.previewHeight,
      backgroundColor: 'grey',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      transform: [
        { scaleX: animatedValues.printScaleX.value },
        { scaleY: animatedValues.printScaleY.value },
        { translateX: animatedValues.printTranslateX.value },
        { translateY: animatedValues.printTranslateY.value },
      ],
    };
  }, [calculation.previewWidth, calculation.previewHeight]);

  const leftBladeAnimatedStyle = useAnimatedStyle(() => {
    return {
      ...styles.blade,
      ...styles.bladeVertical,
      backgroundColor: borderColor,
      width: calculation.bladeThickness,
      transform: [
        { translateX: animatedValues.leftBladeTranslateX.value },
      ],
    };
  }, [borderColor, calculation.bladeThickness]);

  const rightBladeAnimatedStyle = useAnimatedStyle(() => {
    return {
      ...styles.blade,
      ...styles.bladeVertical,
      backgroundColor: borderColor,
      width: calculation.bladeThickness,
      right: 0,
      transform: [
        { translateX: animatedValues.rightBladeTranslateX.value },
      ],
    };
  }, [borderColor, calculation.bladeThickness]);

  const topBladeAnimatedStyle = useAnimatedStyle(() => {
    return {
      ...styles.blade,
      ...styles.bladeHorizontal,
      backgroundColor: borderColor,
      height: calculation.bladeThickness,
      transform: [
        { translateY: animatedValues.topBladeTranslateY.value },
      ],
    };
  }, [borderColor, calculation.bladeThickness]);

  const bottomBladeAnimatedStyle = useAnimatedStyle(() => {
    return {
      ...styles.blade,
      ...styles.bladeHorizontal,
      backgroundColor: borderColor,
      height: calculation.bladeThickness,
      bottom: 0,
      transform: [
        { translateY: animatedValues.bottomBladeTranslateY.value },
      ],
    };
  }, [borderColor, calculation.bladeThickness]);

  const flipButtonsStyle = useMemo(() => [
    styles.flipButtons,
    !isDesktop && styles.flipButtonsNarrow,
  ], [isDesktop]);

  return (
    <Box style={styles.container}>
      {/* Fixed container for preview */}
      <ThemedView style={previewContainerStyle}>
        {/* Paper preview - positioned within fixed container */}
        <ThemedView style={paperPreviewStyle}>
          {/* Print area with transform-based animation */}
          <Animated.View style={printPreviewAnimatedStyle} />
          
          {/* Easel blades with transform-based positioning */}
          {showBlades && (
            <>
              <Animated.View style={leftBladeAnimatedStyle} />
              <Animated.View style={rightBladeAnimatedStyle} />
              <Animated.View style={topBladeAnimatedStyle} />
              <Animated.View style={bottomBladeAnimatedStyle} />
            </>
          )}
        </ThemedView>
      </ThemedView>

      {/* Orientation controls */}
      <Box style={flipButtonsStyle}>
        <Button onPress={onFlipOrientation} variant="outline">
          <ButtonText>Flip Paper Orientation</ButtonText>
        </Button>
        <Button onPress={onFlipAspectRatio} variant="outline">
          <ButtonText>Flip Aspect Ratio</ButtonText>
        </Button>
      </Box>
    </Box>
  );
});

BorderPreview.displayName = 'BorderPreview';

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  previewContainer: {
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  paperPreview: {
    position: 'relative',
    borderWidth: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  blade: {
    position: 'absolute',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
    elevation: 5,
  },
  bladeVertical: {
    top: -1000,
    bottom: -1000,
  },
  bladeHorizontal: {
    left: -1000,
    right: -1000,
  },
  flipButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flipButtonsNarrow: {
    flexDirection: 'column',
  },
}); 