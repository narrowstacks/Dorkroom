import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInputProps,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface NumberInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export const NumberInput = ({
  value,
  onChangeText,
  placeholder,
  ...rest
}: NumberInputProps) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const placeholderTextColor = useThemeColor({}, "tabIconDefault"); // Or another subtle color

  const increment = () => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0; // Handle NaN case
    const newValue = (numValue + 0.1).toFixed(1);
    onChangeText(newValue);
  };

  const decrement = () => {
    let numValue = parseFloat(value);
     if (isNaN(numValue)) numValue = 0.1; // Handle NaN case, default to 0.1 to avoid going below 0
    const newValue = (numValue - 0.1).toFixed(1);
    // Allow zero but not negative numbers
    if (parseFloat(newValue) >= 0) {
      onChangeText(newValue);
    } else {
       onChangeText("0.0"); // Set to 0 if decrement goes below 0
    }
  };

  const handleTextChange = (text: string) => {
    // Allow only numbers and a single decimal point
    // Allow empty string for clearing input
     if (text === '' || /^\d*\.?\d*$/.test(text)) {
       onChangeText(text);
     }
  };

  return (
    <View style={styles.numberInputContainer}>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: borderColor }]}
        value={value}
        onChangeText={handleTextChange} // Use the validated change handler
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        {...rest}
      />
      {Platform.OS === "web" && (
        <View style={[styles.spinnerButtons, { borderLeftColor: borderColor }]}>
          <TouchableOpacity style={styles.spinnerButton} onPress={increment}>
            <ThemedText style={styles.spinnerButtonText}>▲</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.spinnerButton} onPress={decrement}>
            <ThemedText style={styles.spinnerButtonText}>▼</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative", // Needed for absolute positioning of spinner
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 10, // Adjusted padding
    width: 65, // Slightly wider to accommodate spinner space better
    textAlign: "center",
    ...(Platform.OS === "web"
      ? {
          paddingRight: 25, // Make room for spinner buttons
          appearance: "textfield", // Standard appearance for number input
          MozAppearance: "textfield", // Firefox specific
          WebkitAppearance: "none", // Remove default spinner on Webkit
        }
      : {}),
  },
  spinnerButtons: {
    position: "absolute",
    right: 1, // Position inside the border
    top: 1, // Position inside the border
    bottom: 1, // Position inside the border
    width: 20,
    justifyContent: "space-evenly", // Evenly space buttons
    alignItems: "center",
    borderLeftWidth: 1,
    backgroundColor: 'transparent', // Or a subtle background
  },
  spinnerButton: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'rgba(0,0,0,0.05)', // Subtle background for hit area
    // borderRadius: 2, // Optional rounding
  },
  spinnerButtonText: {
    fontSize: 8,
    lineHeight: 8, // Ensure text is vertically centered
  },
}); 