import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Pressable,
  Text,
  TextInput,
  Switch,
} from "react-native";
import { SelectList } from "../components/SelectList";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useBorderCalculator } from "../hooks/useBorderCalculator";
import { BLADE_THICKNESS } from "../constants/border";

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

export default function BorderCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;

  const {
    aspectRatio,
    setAspectRatio,
    paperSize,
    setPaperSize,
    customAspectWidth,
    setCustomAspectWidth,
    customAspectHeight,
    setCustomAspectHeight,
    customPaperWidth,
    setCustomPaperWidth,
    customPaperHeight,
    setCustomPaperHeight,
    minBorder,
    setMinBorder,
    enableOffset,
    setEnableOffset,
    horizontalOffset,
    setHorizontalOffset,
    verticalOffset,
    setVerticalOffset,
    showBlades,
    setShowBlades,
    isLandscape,
    setIsLandscape,
    isRatioFlipped,
    setIsRatioFlipped,
    offsetWarning,
    clampedHorizontalOffset,
    clampedVerticalOffset,
    calculation,
    previewScale,
  } = useBorderCalculator();

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
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Left Column - Form */}
          <View
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
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
                      style={[
                        styles.input,
                        offsetWarning &&
                          parseFloat(horizontalOffset) !==
                            clampedHorizontalOffset &&
                          styles.inputWarning,
                      ]}
                      value={horizontalOffset}
                      onChangeText={setHorizontalOffset}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>vertical offset:</Text>
                    <TextInput
                      style={[
                        styles.input,
                        offsetWarning &&
                          parseFloat(verticalOffset) !==
                            clampedVerticalOffset &&
                          styles.inputWarning,
                      ]}
                      value={verticalOffset}
                      onChangeText={setVerticalOffset}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
                {offsetWarning && (
                  <Text style={styles.warningText}>{offsetWarning}</Text>
                )}
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
                Platform.OS === "web" && isDesktop && styles.webPreviewSection,
              ]}
            >
              <View
                style={[
                  styles.paperPreview,
                  {
                    width: calculation.paperWidth * previewScale,
                    height: calculation.paperHeight * previewScale,
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
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>image dimensions:</Text>
                  <Text style={styles.resultValue}>
                    {calculation.printWidth.toFixed(2)} x{" "}
                    {calculation.printHeight.toFixed(2)} inches
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>left blade:</Text>
                  <Text style={styles.resultValue}>
                    {(
                      calculation.printWidth +
                      calculation.leftBorder -
                      calculation.rightBorder
                    ).toFixed(2)}{" "}
                    inches
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>right blade:</Text>
                  <Text style={styles.resultValue}>
                    {(
                      calculation.printWidth -
                      calculation.leftBorder +
                      calculation.rightBorder
                    ).toFixed(2)}{" "}
                    inches
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>top blade:</Text>
                  <Text style={styles.resultValue}>
                    {(
                      calculation.printHeight +
                      calculation.topBorder -
                      calculation.bottomBorder
                    ).toFixed(2)}{" "}
                    inches
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>bottom blade:</Text>
                  <Text style={styles.resultValue}>
                    {(
                      calculation.printHeight -
                      calculation.topBorder +
                      calculation.bottomBorder
                    ).toFixed(2)}{" "}
                    inches
                  </Text>
                </View>
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
    width: "100%",
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
    width: "100%",
    marginTop: Platform.OS === "web" ? 32 : 16,
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
    width: "100%",
    maxWidth: 400,
  },
  resultRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: "#000",
    textAlign: "right",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
    }),
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    color: "#000",
    textAlign: "left",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
    }),
    flex: 1,
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
    marginTop: 0,
  },
  inputWarning: {
    borderColor: "#FFA500",
    borderWidth: 2,
  },
  warningText: {
    color: "#FFA500",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
