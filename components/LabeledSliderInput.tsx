import React, { useMemo, useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
// import Slider from '@react-native-community/slider';
import {
  Box,
  Text,
  Input,
  InputField,
} from '@gluestack-ui/themed';

// Use the proven native slider for reliable visuals
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { getPlatformFont } from '@/styles/common';
import { COMMON_INPUT_HEIGHT, COMMON_BORDER_RADIUS } from '@/constants/borderCalc';

// Throttle helper function
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T => {
  const { leading = true, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    const execute = () => {
      lastCallTime = now;
      func(...args);
    };

    if (leading && now - lastCallTime >= delay) {
      execute();
    } else if (trailing) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
          lastCallTime = Date.now();
        }
      }, delay - (now - lastCallTime));
    }
  };

  return throttled as T;
};

interface LabeledSliderInputProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step: number;
  labels?: string[];
  textColor: string;
  borderColor: string;
  tintColor: string;
  warning?: boolean;
  inputWidth?: number;
  /**
   * If true, call `onChange` continuously while the user is sliding.
   * Otherwise, the value is committed only on slide end (default).
   */
  continuousUpdate?: boolean;
  /**
   * If true, render the slider above the input field.
   * Default is false (input field above slider).
   */
  sliderOnTop?: boolean;
}

const SLIDER_THROTTLE_MS = 30; // ~33 FPS for smooth but efficient updates

export const LabeledSliderInput: React.FC<LabeledSliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  labels = [],
  textColor,
  borderColor,
  tintColor,
  warning = false,
  inputWidth,
  continuousUpdate = false,
  sliderOnTop = false,
}) => {
  // Convert the incoming value to a number for Slider compatibility
  const numericValue = Number(value) || 0;

  // Throttled onChange for continuous updates
  const onChangeThrottled = useMemo(() =>
    throttle(onChange, SLIDER_THROTTLE_MS, { leading: true, trailing: true })
  , [onChange]);

  // Handlers -------------------------------------------------
  const handleValueChange = useCallback((v: number) => {
    // Trigger light haptic feedback for every increment
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (continuousUpdate) {
      onChangeThrottled(v.toString());
    }
  }, [continuousUpdate, onChangeThrottled]);

  const handleSlidingComplete = useCallback((v: number) => {
    if (!continuousUpdate) {
      onChange(v.toString());
    } else {
      // Ensure final value is set even with throttling
      onChange(v.toString());
    }
  }, [continuousUpdate, onChange]);

  // Memoized input field component
  const renderInputField = useCallback(() => (
    <Input
      variant="outline"
      size="md"
      isDisabled={false}
      isInvalid={warning}
      isReadOnly={false}
      style={[
        styles.inputContainer,
        { borderColor: warning ? '#FFA500' : borderColor, width: inputWidth },
        warning && styles.inputWarning,
        sliderOnTop && styles.inputWithTopMargin,
      ]}
    >
      <InputField
        style={[styles.inputText, { color: textColor }]}
        value={String(value)}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={borderColor}
      />
    </Input>
  ), [warning, borderColor, inputWidth, sliderOnTop, textColor, value, onChange]);

  // Memoized slider component
  const renderSlider = useCallback(() => (
    <Box style={styles.sliderWrapper}>
      <Slider
        style={styles.slider}
        value={numericValue}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={tintColor}
        maximumTrackTintColor={borderColor}
        thumbTintColor={tintColor}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
      />
    </Box>
  ), [numericValue, min, max, step, tintColor, borderColor, handleValueChange, handleSlidingComplete]);

  // Memoized slider labels component
  const renderSliderLabels = useCallback(() => (
    labels.length > 0 && (
      <Box style={styles.sliderLabels}>
        {labels.map((lbl) => (
          <Text key={lbl} style={[styles.sliderLabel, { color: textColor }]}> 
            {lbl}"{/* inches symbol */}
          </Text>
        ))}
      </Box>
    )
  ), [labels, textColor]);

  //----------------------------------------------------------
  return (
    <Box style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      {sliderOnTop ? (
        <>
          {/* Slider first, then input */}
          {renderSlider()}
          {renderSliderLabels()}
          {renderInputField()}
        </>
      ) : (
        <>
          {/* Input first, then slider (default) */}
          {renderInputField()}
          {renderSlider()}
          {renderSliderLabels()}
        </>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  label: { fontSize: 16, fontFamily: getPlatformFont() },
  inputContainer: { // Style for the Gluestack Input container
    height: COMMON_INPUT_HEIGHT,
    borderRadius: COMMON_BORDER_RADIUS, // Gluestack Input typically handles its own border radius via variants
    borderWidth: 1, // Gluestack Input handles its own border width
  },
  inputText: { // Style for the Gluestack InputField (the text part)
    fontSize: 16,
    // paddingHorizontal: 12, // Gluestack InputField has its own padding
    // marginBottom: 4, // Spacing handled by container gap or Gluestack Slider mt
  },
  inputWarning: {
    borderColor: '#FFA500', // This will be overridden by Input's isInvalid prop or sx prop
    borderWidth: 2,         // This might need specific handling if Gluestack Input variant doesn't allow direct borderWidth override easily
  },
  inputWithTopMargin: {
    marginTop: 16, // Add extra spacing when slider is positioned above input
  },
  sliderWrapper: {
    width: '100%',
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8, // Increased margin for better spacing
  },
  sliderLabel: { fontSize: 12, textAlign: 'center', fontFamily: getPlatformFont() },
}); 