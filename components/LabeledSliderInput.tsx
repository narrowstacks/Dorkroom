import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { Box, Text } from '@gluestack-ui/themed';

import { getPlatformFont } from '@/styles/common';
import { COMMON_INPUT_HEIGHT, COMMON_BORDER_RADIUS } from '@/constants/borderCalc';

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
}

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
}) => {
  const numericValue = parseFloat(String(value)) || 0;

  // Keep a local slider value to avoid re-rendering the whole parent tree on every tick
  const [internalValue, setInternalValue] = React.useState<number>(numericValue);

  // Sync internal value if external prop changes via text input or programmatically
  React.useEffect(() => {
    if (numericValue !== internalValue) {
      setInternalValue(numericValue);
    }
  }, [numericValue]);

  return (
    <Box style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor, width: inputWidth },
          warning && styles.inputWarning,
        ]}
        value={String(value)}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={borderColor}
      />

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={internalValue}
        // Update local value continuously; defer external state update unless opted-in
        onValueChange={(v: number) => {
          setInternalValue(v);
          if (continuousUpdate) {
            onChange(v.toString());
          }
        }}
        onSlidingComplete={(v: number) => {
          if (!continuousUpdate) onChange(v.toString());
        }}
        minimumTrackTintColor={tintColor}
        maximumTrackTintColor={borderColor}
        thumbTintColor={tintColor}
      />

      {labels.length > 0 && (
        <Box style={styles.sliderLabels}>
          {labels.map((lbl) => (
            <Text key={lbl} style={styles.sliderLabel}>
              {lbl}"{/* inches symbol */}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  label: { fontSize: 16, fontFamily: getPlatformFont() },
  input: {
    height: COMMON_INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: COMMON_BORDER_RADIUS,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  inputWarning: { borderColor: '#FFA500', borderWidth: 2 },
  slider: { width: '100%', height: 40, marginTop: 4 },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  sliderLabel: { fontSize: 12, textAlign: 'center', fontFamily: getPlatformFont() },
}); 