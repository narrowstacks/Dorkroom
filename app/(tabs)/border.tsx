import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { useBorderCalculator } from "../hooks/useBorderCalculator";
import { BLADE_THICKNESS } from "../constants/border";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useThemeColor } from "../hooks/useThemeColor";

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
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

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
    ignoreMinBorder,
    setIgnoreMinBorder,
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
    bladeWarning,
    calculation,
    minBorderWarning,
    calculateOptimalMinBorder,
  } = useBorderCalculator();

  const renderPicker = (
    value: string,
    onValueChange: (value: string) => void,
    items: Array<{ label: string; value: string }>
  ) => {
    if (Platform.OS === "ios") {
      return (
        <ThemedView style={[styles.pickerContainer, { borderColor }]}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            itemStyle={{ color: textColor, height: 120 }}
          >
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </ThemedView>
      );
    }

    return (
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[
          styles.picker,
          {
            backgroundColor,
            color: textColor,
            borderColor,
          },
        ]}
        dropdownIconColor={textColor}
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="large" style={styles.title}>
            border calculator
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Preview and Results Section - Now shown first on mobile */}
          {calculation && (
            <ThemedView
              style={[
                styles.previewSection,
                Platform.OS === "web" && isDesktop && styles.webPreviewSection,
              ]}
            >
              <ThemedView
                style={[
                  styles.previewContainer,
                  {
                    height: calculation.previewHeight,
                    width: calculation.previewWidth,
                    borderColor,
                  },
                ]}
              >
                <ThemedView
                  style={[
                    styles.paperPreview,
                    {
                      width: "100%",
                      height: "100%",
                      borderColor,
                    },
                  ]}
                >
                  <ThemedView
                    style={[
                      styles.printPreview,
                      {
                        width: `${calculation.printWidthPercent}%`,
                        height: `${calculation.printHeightPercent}%`,
                        left: `${calculation.leftBorderPercent}%`,
                        top: `${calculation.topBorderPercent}%`,
                        backgroundColor: borderColor,
                      },
                    ]}
                  />
                  {showBlades && (
                    <>
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeVertical,
                          {
                            left: `${calculation.leftBorderPercent}%`,
                            transform: [
                              { translateX: -calculation.bladeThickness },
                            ],
                            backgroundColor: borderColor,
                            width: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeVertical,
                          {
                            right: `${calculation.rightBorderPercent}%`,
                            transform: [
                              { translateX: calculation.bladeThickness },
                            ],
                            backgroundColor: borderColor,
                            width: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeHorizontal,
                          {
                            top: `${calculation.topBorderPercent}%`,
                            transform: [
                              { translateY: -calculation.bladeThickness },
                            ],
                            backgroundColor: borderColor,
                            height: calculation.bladeThickness,
                          },
                        ]}
                      />
                      <ThemedView
                        style={[
                          styles.blade,
                          styles.bladeHorizontal,
                          {
                            bottom: `${calculation.bottomBorderPercent}%`,
                            transform: [
                              { translateY: calculation.bladeThickness },
                            ],
                            backgroundColor: borderColor,
                            height: calculation.bladeThickness,
                          },
                        ]}
                      />
                    </>
                  )}
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, { backgroundColor: tintColor }]}
                  onPress={() => setIsLandscape(!isLandscape)}
                >
                  <ThemedText style={styles.buttonText}>
                    flip paper orientation
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, { backgroundColor: tintColor }]}
                  onPress={() => setIsRatioFlipped(!isRatioFlipped)}
                >
                  <ThemedText style={styles.buttonText}>
                    flip aspect ratio
                  </ThemedText>
                </Pressable>
              </ThemedView>

              <ThemedView style={styles.resultContainer}>
                <ThemedText type="largeSemiBold" style={styles.subtitle}>
                  result
                </ThemedText>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    image dimensions:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.printWidth.toFixed(2)} x{" "}
                    {calculation.printHeight.toFixed(2)} inches
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    left blade:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.leftBladePos.toFixed(2)} inches
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    right blade:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.rightBladePos.toFixed(2)} inches
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>top blade:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.topBladePos.toFixed(2)} inches
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    bottom blade:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.bottomBladePos.toFixed(2)} inches
                  </ThemedText>
                </ThemedView>
                {calculation.isNonStandardSize && (
                  <ThemedView
                    style={[
                      styles.easelInstructionBox,
                      {
                        borderColor: tintColor,
                        backgroundColor: tintColor + "20",
                      },
                    ]}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.easelInstructionTitle}
                    >
                      Non-Standard Paper Size
                    </ThemedText>

                    <ThemedText style={styles.easelInstructionText}>
                      {" "}
                      Position paper in the {calculation.easelSize.width}x
                      {calculation.easelSize.height} slot all the way to the
                      left.
                    </ThemedText>
                  </ThemedView>
                )}
                {bladeWarning && (
                  <ThemedText style={styles.warningText}>
                    {bladeWarning}
                  </ThemedText>
                )}
                {minBorderWarning && (
                  <ThemedText style={styles.warningText}>
                    {minBorderWarning}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}

          {/* Form Section */}
          <ThemedView
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
            {/* Aspect Ratio Selection */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>aspect ratio:</ThemedText>
              {renderPicker(aspectRatio, setAspectRatio, ASPECT_RATIOS)}
            </ThemedView>

            {/* Custom Aspect Ratio Inputs */}
            {aspectRatio === "custom" && (
              <ThemedView style={styles.formGroup}>
                <ThemedView style={styles.row}>
                  <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>width:</ThemedText>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={customAspectWidth}
                      onChangeText={setCustomAspectWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                      defaultValue="2"
                      placeholderTextColor={borderColor}
                    />
                  </ThemedView>
                  <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>height:</ThemedText>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={customAspectHeight}
                      onChangeText={setCustomAspectHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                      defaultValue="3"
                      placeholderTextColor={borderColor}
                    />
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            )}

            {/* Paper Size Selection */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>paper size:</ThemedText>
              {renderPicker(paperSize, setPaperSize, PAPER_SIZES)}
            </ThemedView>

            {/* Custom Paper Size Inputs */}
            {paperSize === "custom" && (
              <ThemedView style={styles.formGroup}>
                <ThemedView style={styles.row}>
                  <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>
                      width (inches):
                    </ThemedText>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={customPaperWidth}
                      onChangeText={setCustomPaperWidth}
                      keyboardType="numeric"
                      placeholder="Width"
                      defaultValue="8"
                      placeholderTextColor={borderColor}
                    />
                  </ThemedView>
                  <ThemedView style={styles.inputGroup}>
                    <ThemedText style={styles.label}>
                      height (inches):
                    </ThemedText>
                    <TextInput
                      style={[styles.input, { color: textColor, borderColor }]}
                      value={customPaperHeight}
                      onChangeText={setCustomPaperHeight}
                      keyboardType="numeric"
                      placeholder="Height"
                      defaultValue="10"
                      placeholderTextColor={borderColor}
                    />
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            )}

            {/* Minimum Border Input */}
            <ThemedView style={styles.formGroup}>
              <ThemedView style={styles.row}>
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    minimum border (inches):
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    value={minBorder}
                    onChangeText={setMinBorder}
                    keyboardType="numeric"
                    placeholder="0.5"
                    placeholderTextColor={borderColor}
                  />
                </ThemedView>
                <Pressable
                  style={[styles.roundButton, { backgroundColor: tintColor }]}
                  onPress={calculateOptimalMinBorder}
                >
                  <ThemedText style={styles.buttonText}>
                    round to 0.25"
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>

            {/* Toggles Row */}
            <ThemedView style={styles.togglesRow}>
              {/* Offset Toggle */}
              <ThemedView style={styles.toggleColumn}>
                <ThemedView style={styles.row}>
                  <ThemedText style={styles.label}>enable offsets:</ThemedText>
                  <Switch
                    value={enableOffset}
                    onValueChange={setEnableOffset}
                    trackColor={{ false: borderColor, true: tintColor }}
                    thumbColor={enableOffset ? tintColor : "#f4f3f4"}
                  />
                </ThemedView>
              </ThemedView>

              {/* Blade Toggle */}
              <ThemedView style={styles.toggleColumn}>
                <ThemedView style={styles.row}>
                  <ThemedText style={styles.label}>show blades:</ThemedText>
                  <Switch
                    value={showBlades}
                    onValueChange={setShowBlades}
                    trackColor={{ false: borderColor, true: tintColor }}
                    thumbColor={showBlades ? tintColor : "#f4f3f4"}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {enableOffset && (
              <>
                <ThemedView style={styles.formGroup}>
                  <ThemedView style={styles.row}>
                    <ThemedText style={styles.label}>
                      ignore min border:
                    </ThemedText>
                    <Switch
                      value={ignoreMinBorder}
                      onValueChange={setIgnoreMinBorder}
                      trackColor={{ false: borderColor, true: tintColor }}
                      thumbColor={ignoreMinBorder ? tintColor : "#f4f3f4"}
                    />
                  </ThemedView>
                  {ignoreMinBorder && (
                    <ThemedText style={styles.infoText}>
                      Print can be positioned freely but will stay within paper
                      edges
                    </ThemedText>
                  )}
                </ThemedView>

                <ThemedView style={styles.formGroup}>
                  <ThemedView style={styles.row}>
                    <ThemedView style={styles.inputGroup}>
                      <ThemedText style={styles.label}>
                        horizontal offset:
                      </ThemedText>
                      <TextInput
                        style={[
                          styles.input,
                          { color: textColor, borderColor },
                          offsetWarning && styles.inputWarning,
                        ]}
                        value={horizontalOffset}
                        onChangeText={setHorizontalOffset}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={borderColor}
                      />
                    </ThemedView>
                    <ThemedView style={styles.inputGroup}>
                      <ThemedText style={styles.label}>
                        vertical offset:
                      </ThemedText>
                      <TextInput
                        style={[
                          styles.input,
                          { color: textColor, borderColor },
                          offsetWarning && styles.inputWarning,
                        ]}
                        value={verticalOffset}
                        onChangeText={setVerticalOffset}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={borderColor}
                      />
                    </ThemedView>
                  </ThemedView>
                  {offsetWarning && (
                    <ThemedText style={styles.warningText}>
                      {offsetWarning}
                    </ThemedText>
                  )}
                </ThemedView>
              </>
            )}
          </ThemedView>
        </ThemedView>

        {/* Information about the tool */}
        <ThemedView
          style={[
            styles.infoSection,
            Platform.OS === "web" && isDesktop && styles.webInfoSection,
          ]}
        >
          <ThemedText type="largeSemiBold" style={styles.infoTitle}>
            about this tool
          </ThemedText>

          <ThemedText style={styles.infoContentText}>
            The border calculator helps you determine the optimal placement of
            your enlarger easel blades when printing photos, ensuring consistent
            and aesthetically pleasing borders.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how to use:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            1. Select your desired aspect ratio (the ratio of your negative or
            image)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            2. Choose your paper size (the size of photo paper you're printing
            on)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            3. Set your minimum border width (at least 0.5" recommended for
            handling)
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            4. Optionally enable offsets to shift the image from center
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            5. View the blade positions in the results section
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            blade measurements:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            The measurements shown are distances from the edge of your enlarger
            baseboard to where each blade should be positioned. For non-standard
            paper sizes, follow the instructions to place your paper in the
            appropriate easel slot.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            tips:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • The "round to 0.25" button suggests a border size that results in
            measurements aligned to quarter-inch increments
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • For uniform borders, keep offsets at 0
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • The "flip paper orientation" button rotates the paper between
            portrait and landscape
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • The "flip aspect ratio" button swaps the width and height of your
            image
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom:
      Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80, // Extra padding for tab bar
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
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
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  previewSection: {
    gap: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: Platform.OS === "web" ? 0 : 32,
  },
  previewContainer: {
    position: "relative",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  paperPreview: {
    position: "relative",
    borderWidth: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  printPreview: {
    position: "absolute",
  },
  blade: {
    position: "absolute",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
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
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000000",
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
    marginBottom: 0,
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
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  picker: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    ...Platform.select({
      android: {
        marginVertical: 0,
      },
      web: {
        marginVertical: 4,
      },
    }),
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  togglesRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  toggleColumn: {
    flex: 1,
  },
  easelInstructionBox: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    width: "100%",
  },
  easelInstructionTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  easelInstructionText: {
    fontSize: 14,
    textAlign: "center",
  },
  roundButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: "flex-end",
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  infoTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  infoSubtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  infoContentText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  webInfoSection: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
