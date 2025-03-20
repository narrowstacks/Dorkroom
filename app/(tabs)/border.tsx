import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Dimensions,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
  TextInputProps,
  Text,
} from "react-native";
import { Switch } from "react-native";

// Common aspect ratios
const ASPECT_RATIOS = [
  {
    label: "3:2 (35mm standard frame, 6x9)",
    value: "3/2",
    width: 3,
    height: 2,
  },
  { label: "65:24 (XPan Pano)", value: "65/24", width: 65, height: 24 },
  { label: "6:4.5", value: "6/4.5", width: 6, height: 4.5 },
  { label: "1:1 (Square/6x6)", value: "1/1", width: 1, height: 1 },
  { label: "7:6 (6x7)", value: "7/6", width: 7, height: 6 },
  { label: "8:6 (6x8)", value: "8/6", width: 8, height: 6 },
  { label: "5:4 (4x5)", value: "5/4", width: 5, height: 4 },
  { label: "7:5 (5x7)", value: "7/5", width: 7, height: 5 },
  { label: "4:3", value: "4/3", width: 4, height: 3 },
  { label: "custom", value: "custom" },
];

// Common paper sizes in inches
const PAPER_SIZES = [
  { label: "4x5", value: "4x5", width: 4, height: 5 },
  { label: "4x6 (postcard)", value: "4x6", width: 4, height: 6 },
  { label: "5x7", value: "5x7", width: 5, height: 7 },
  { label: "8x10", value: "8x10", width: 8, height: 10 },
  { label: "11x14", value: "11x14", width: 11, height: 14 },
  { label: "16x20", value: "16x20", width: 16, height: 20 },
  { label: "20x24", value: "20x24", width: 20, height: 24 },
  { label: "custom", value: "custom" },
];

// UI Constants
const BLADE_THICKNESS = 15;

interface BorderCalculation {
  leftBorder: number;
  rightBorder: number;
  topBorder: number;
  bottomBorder: number;
  printWidth: number;
  printHeight: number;
  paperWidth: number;
  paperHeight: number;
}

// Custom SelectList component
const SelectList = ({
  value,
  onValueChange,
  items,
  placeholder,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = items.find((item) => item.value === value);

  // Use native select on web
  if (Platform.OS === "web") {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        style={{
          ...styles.webSelect,
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage:
            'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px top 50%",
          backgroundSize: "12px auto",
          cursor: "pointer",
        }}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectButtonText}>
          {selectedItem?.label || placeholder || "Select an option"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {placeholder || "Select an option"}
            </Text>
            <ScrollView>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.modalOption,
                    item.value === value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      item.value === value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function BorderCalculator() {
  // Form state
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [paperSize, setPaperSize] = useState(PAPER_SIZES[0].value);
  const [customAspectWidth, setCustomAspectWidth] = useState("");
  const [customAspectHeight, setCustomAspectHeight] = useState("");
  const [customPaperWidth, setCustomPaperWidth] = useState("");
  const [customPaperHeight, setCustomPaperHeight] = useState("");
  const [minBorder, setMinBorder] = useState("0.5");
  const [enableOffset, setEnableOffset] = useState(false);
  const [horizontalOffset, setHorizontalOffset] = useState("0");
  const [verticalOffset, setVerticalOffset] = useState("0");
  const [showBlades, setShowBlades] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isRatioFlipped, setIsRatioFlipped] = useState(false);

  // Calculate dimensions and borders
  const calculation = useMemo(() => {
    let paperWidth: number;
    let paperHeight: number;
    let ratioWidth: number;
    let ratioHeight: number;

    // Get paper dimensions
    if (paperSize === "custom") {
      paperWidth = parseFloat(customPaperWidth) || 0;
      paperHeight = parseFloat(customPaperHeight) || 0;
    } else {
      const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize);
      paperWidth = selectedPaper?.width ?? 0;
      paperHeight = selectedPaper?.height ?? 0;
    }

    // Get aspect ratio dimensions
    if (aspectRatio === "custom") {
      ratioWidth = parseFloat(customAspectWidth) || 0;
      ratioHeight = parseFloat(customAspectHeight) || 0;
    } else {
      const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
      ratioWidth = selectedRatio?.width ?? 0;
      ratioHeight = selectedRatio?.height ?? 0;
    }

    // Apply orientation
    if (isLandscape) {
      [paperWidth, paperHeight] = [paperHeight, paperWidth];
    }

    // Apply ratio flip
    if (isRatioFlipped) {
      [ratioWidth, ratioHeight] = [ratioHeight, ratioWidth];
    }

    // Calculate print size to fit within paper with minimum borders
    const minBorderValue = parseFloat(minBorder) || 0;
    const horizontalOffsetValue = enableOffset
      ? parseFloat(horizontalOffset) || 0
      : 0;
    const verticalOffsetValue = enableOffset
      ? parseFloat(verticalOffset) || 0
      : 0;

    const availableWidth = paperWidth - 2 * minBorderValue;
    const availableHeight = paperHeight - 2 * minBorderValue;
    const printRatio = ratioWidth / ratioHeight;

    let printWidth: number;
    let printHeight: number;

    if (availableWidth / availableHeight > printRatio) {
      // Height limited
      printHeight = availableHeight;
      printWidth = availableHeight * printRatio;
    } else {
      // Width limited
      printWidth = availableWidth;
      printHeight = availableWidth / printRatio;
    }

    const leftBorder = (paperWidth - printWidth) / 2 + horizontalOffsetValue;
    const rightBorder = (paperWidth - printWidth) / 2 - horizontalOffsetValue;
    const topBorder = (paperHeight - printHeight) / 2 + verticalOffsetValue;
    const bottomBorder = (paperHeight - printHeight) / 2 - verticalOffsetValue;

    return {
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder,
      printWidth,
      printHeight,
      paperWidth,
      paperHeight,
    };
  }, [
    paperSize,
    customPaperWidth,
    customPaperHeight,
    aspectRatio,
    customAspectWidth,
    customAspectHeight,
    minBorder,
    horizontalOffset,
    verticalOffset,
    isLandscape,
    isRatioFlipped,
    enableOffset,
  ]);

  // Preview scaling
  const previewScale = useMemo(() => {
    if (!calculation) return 1;
    const { width } = Dimensions.get("window");
    const maxPreviewWidth = Math.min(width - 32, 400);
    const selectedPaper = PAPER_SIZES.find((p) => p.value === paperSize);
    const paperWidth = isLandscape
      ? selectedPaper?.height ?? (parseFloat(customPaperHeight) || 0)
      : selectedPaper?.width ?? (parseFloat(customPaperWidth) || 0);
    return maxPreviewWidth / (paperWidth || 1);
  }, [paperSize, customPaperWidth, customPaperHeight, isLandscape]);

  return (
    <ScrollView style={styles.container}>
      <View
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>border calculator</Text>
        </View>

        <View
          style={[
            styles.mainContent,
            Platform.OS === "web" && styles.webMainContent,
          ]}
        >
          {/* Left Column - Form */}
          <View style={[styles.form, Platform.OS === "web" && styles.webForm]}>
            {/* Aspect Ratio Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>aspect ratio:</Text>
              <SelectList
                value={aspectRatio}
                onValueChange={setAspectRatio}
                items={ASPECT_RATIOS}
                placeholder="Select aspect ratio"
              />
            </View>

            {/* Custom Aspect Ratio Inputs */}
            {aspectRatio === "custom" && (
              <View style={styles.formGroup}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>width:</Text>
                    <TextInput
                      style={styles.input}
                      value={customAspectWidth}
                      onChangeText={setCustomAspectWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>height:</Text>
                    <TextInput
                      style={styles.input}
                      value={customAspectHeight}
                      onChangeText={setCustomAspectHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Paper Size Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>paper size:</Text>
              <SelectList
                value={paperSize}
                onValueChange={setPaperSize}
                items={PAPER_SIZES}
                placeholder="Select paper size"
              />
            </View>

            {/* Custom Paper Size Inputs */}
            {paperSize === "custom" && (
              <View style={styles.formGroup}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>width (inches):</Text>
                    <TextInput
                      style={styles.input}
                      value={customPaperWidth}
                      onChangeText={setCustomPaperWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>height (inches):</Text>
                    <TextInput
                      style={styles.input}
                      value={customPaperHeight}
                      onChangeText={setCustomPaperHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Minimum Border Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>minimum border (inches):</Text>
              <TextInput
                style={styles.input}
                value={minBorder}
                onChangeText={setMinBorder}
                keyboardType="numeric"
                placeholder="0.5"
              />
            </View>

            {/* Offset Toggle and Inputs */}
            <View style={styles.formGroup}>
              <View style={styles.row}>
                <Text style={styles.label}>enable offsets:</Text>
                <Switch value={enableOffset} onValueChange={setEnableOffset} />
              </View>
            </View>

            {enableOffset && (
              <View style={styles.formGroup}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>horizontal offset:</Text>
                    <TextInput
                      style={styles.input}
                      value={horizontalOffset}
                      onChangeText={setHorizontalOffset}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>vertical offset:</Text>
                    <TextInput
                      style={styles.input}
                      value={verticalOffset}
                      onChangeText={setVerticalOffset}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Blade Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.row}>
                <Text style={styles.label}>show blades:</Text>
                <Switch value={showBlades} onValueChange={setShowBlades} />
              </View>
            </View>
          </View>

          {/* Right Column - Preview and Results */}
          {calculation && (
            <View
              style={[
                styles.previewSection,
                Platform.OS === "web" && styles.webPreviewSection,
              ]}
            >
              <View
                style={[
                  styles.paperPreview,
                  {
                    width:
                      (isLandscape
                        ? PAPER_SIZES.find((p) => p.value === paperSize)
                            ?.height ??
                          (parseFloat(customPaperHeight) || 0)
                        : PAPER_SIZES.find((p) => p.value === paperSize)
                            ?.width ??
                          (parseFloat(customPaperWidth) || 0)) * previewScale,
                    height:
                      (isLandscape
                        ? PAPER_SIZES.find((p) => p.value === paperSize)
                            ?.width ??
                          (parseFloat(customPaperWidth) || 0)
                        : PAPER_SIZES.find((p) => p.value === paperSize)
                            ?.height ??
                          (parseFloat(customPaperHeight) || 0)) * previewScale,
                  },
                ]}
              >
                <View
                  style={[
                    styles.printPreview,
                    {
                      width: calculation.printWidth * previewScale,
                      height: calculation.printHeight * previewScale,
                      left: calculation.leftBorder * previewScale,
                      top: calculation.topBorder * previewScale,
                    },
                  ]}
                />
                {showBlades && (
                  <>
                    <View
                      style={[
                        styles.blade,
                        styles.bladeVertical,
                        {
                          left:
                            calculation.leftBorder * previewScale -
                            BLADE_THICKNESS,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.blade,
                        styles.bladeVertical,
                        {
                          right:
                            calculation.rightBorder * previewScale -
                            BLADE_THICKNESS,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.blade,
                        styles.bladeHorizontal,
                        {
                          top:
                            calculation.topBorder * previewScale -
                            BLADE_THICKNESS,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.blade,
                        styles.bladeHorizontal,
                        {
                          bottom:
                            calculation.bottomBorder * previewScale -
                            BLADE_THICKNESS,
                        },
                      ]}
                    />
                  </>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={styles.button}
                  onPress={() => setIsLandscape(!isLandscape)}
                >
                  <Text style={styles.buttonText}>flip paper orientation</Text>
                </Pressable>
                <Pressable
                  style={styles.button}
                  onPress={() => setIsRatioFlipped(!isRatioFlipped)}
                >
                  <Text style={styles.buttonText}>flip aspect ratio</Text>
                </Pressable>
              </View>

              <View style={styles.resultContainer}>
                <Text style={styles.subtitle}>result</Text>
                <Text style={styles.resultText}>
                  image dimensions: {calculation.printWidth.toFixed(2)} x{" "}
                  {calculation.printHeight.toFixed(2)} inches
                </Text>
                <Text style={styles.resultText}>
                  left blade:{" "}
                  {(
                    calculation.printWidth +
                    calculation.leftBorder -
                    calculation.rightBorder
                  ).toFixed(2)}{" "}
                  inches
                </Text>
                <Text style={styles.resultText}>
                  right blade:{" "}
                  {(
                    calculation.printWidth -
                    calculation.leftBorder +
                    calculation.rightBorder
                  ).toFixed(2)}{" "}
                  inches
                </Text>
                <Text style={styles.resultText}>
                  top blade:{" "}
                  {(
                    calculation.printHeight +
                    calculation.topBorder -
                    calculation.bottomBorder
                  ).toFixed(2)}{" "}
                  inches
                </Text>
                <Text style={styles.resultText}>
                  bottom blade:{" "}
                  {(
                    calculation.printHeight -
                    calculation.topBorder +
                    calculation.bottomBorder
                  ).toFixed(2)}{" "}
                  inches
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    gap: 24,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: "#000",
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    ...Platform.select({
      ios: {
        height: 120,
      },
      android: {
        height: 50,
      },
    }),
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  previewSection: {
    gap: 16,
    alignItems: "center",
  },
  paperPreview: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    position: "relative",
  },
  printPreview: {
    position: "absolute",
    backgroundColor: "#8d8d8d",
  },
  blade: {
    position: "absolute",
    backgroundColor: "#333333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bladeVertical: {
    width: BLADE_THICKNESS,
    top: 0,
    bottom: 0,
  },
  bladeHorizontal: {
    height: BLADE_THICKNESS,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
    }),
  },
  selectButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: "#4CAF50",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000",
  },
  modalOptionTextSelected: {
    color: "#fff",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  webContent: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
  },
  mainContent: {
    width: "100%",
  },
  webMainContent: {
    flexDirection: "row",
    gap: 32,
    alignItems: "flex-start",
  },
  webForm: {
    flex: 1,
    maxWidth: 480,
  },
  webPreviewSection: {
    flex: 1,
    alignSelf: "stretch",
    gap: 24,
  },
  webSelect: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
    width: "100%",
  },
});
