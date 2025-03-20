import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface NumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const NumberInput = ({
  value,
  onChangeText,
  placeholder,
}: NumberInputProps) => {
  const increment = () => {
    const newValue = (parseFloat(value) + 0.1).toFixed(1);
    onChangeText(newValue);
  };

  const decrement = () => {
    const newValue = (parseFloat(value) - 0.1).toFixed(1);
    if (parseFloat(newValue) > 0) {
      onChangeText(newValue);
    }
  };

  return (
    <View style={styles.numberInputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />
      {Platform.OS === "web" && (
        <View style={styles.spinnerButtons}>
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

export const ResizeCalculator = () => {
  const [originalWidth, setOriginalWidth] = useState("4");
  const [originalLength, setOriginalLength] = useState("6");
  const [newWidth, setNewWidth] = useState("6");
  const [newLength, setNewLength] = useState("9");
  const [originalTime, setOriginalTime] = useState("10");
  const [newTime, setNewTime] = useState("");
  const [stopsDifference, setStopsDifference] = useState("");

  const calculateExposure = () => {
    const originalArea = parseFloat(originalWidth) * parseFloat(originalLength);
    const newArea = parseFloat(newWidth) * parseFloat(newLength);
    const ratio = newArea / originalArea;
    const newTimeValue = parseFloat(originalTime) * ratio;
    const stops = Math.log2(ratio);

    setNewTime(newTimeValue.toFixed(1));
    setStopsDifference(stops.toFixed(2));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>Print Resizing Calculator</ThemedText>

        <View style={styles.columnsContainer}>
          {/* Initial image size */}
          <View style={styles.column}>
            <ThemedText style={styles.groupLabel}>
              Initial Image Size
            </ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Width:</ThemedText>
              <NumberInput
                value={originalWidth}
                onChangeText={setOriginalWidth}
                placeholder="4"
              />
              <ThemedText style={styles.unit}>in</ThemedText>
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Height:</ThemedText>
              <NumberInput
                value={originalLength}
                onChangeText={setOriginalLength}
                placeholder="6"
              />
              <ThemedText style={styles.unit}>in</ThemedText>
            </View>
          </View>

          {/* New image size */}
          <View style={styles.column}>
            <ThemedText style={styles.groupLabel}>New Image Size</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Width:</ThemedText>
              <NumberInput
                value={newWidth}
                onChangeText={setNewWidth}
                placeholder="6"
              />
              <ThemedText style={styles.unit}>in</ThemedText>
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Height:</ThemedText>
              <NumberInput
                value={newLength}
                onChangeText={setNewLength}
                placeholder="9"
              />
              <ThemedText style={styles.unit}>in</ThemedText>
            </View>
          </View>
        </View>

        {/* Original Exposure Time */}
        <View style={styles.exposureTimeContainer}>
          <ThemedText style={styles.label}>Original Exposure Time:</ThemedText>
          <NumberInput
            value={originalTime}
            onChangeText={setOriginalTime}
            placeholder="10"
          />
          <ThemedText style={styles.unit}>seconds</ThemedText>
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateExposure}
        >
          <ThemedText style={styles.buttonText}>
            Calculate New Exposure Time
          </ThemedText>
        </TouchableOpacity>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <ThemedText style={styles.result}>
            New Exposure Time: {newTime} seconds
          </ThemedText>
          <ThemedText style={styles.result}>
            Stops Difference: {stopsDifference} stops
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    maxWidth: 600,
    marginBottom: 30,
  },
  column: {
    flex: 1,
    alignItems: "center",
    maxWidth: 250,
  },
  groupLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "flex-end",
    width: "100%",
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  label: {
    minWidth: 50,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: "center",
    color: "#FFFFFF",
    ...(Platform.OS === "web" && {
      paddingRight: 20, // Make room for spinner buttons
      appearance: "none", // Remove default browser styling
      MozAppearance: "none",
      WebkitAppearance: "none",
    }),
  },
  spinnerButtons: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
  },
  spinnerButton: {
    width: 20,
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerButtonText: {
    fontSize: 8,
    color: "#FFFFFF",
  },
  unit: {
    marginLeft: 10,
    minWidth: 30,
  },
  exposureTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
  },
  calculateButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
    maxWidth: 600,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    alignItems: "center",
  },
  result: {
    fontSize: 18,
    marginBottom: 10,
  },
});
