import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useExposureCalculator } from "@/hooks/useExposureCalculator";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const {
    originalTime,
    setOriginalTime,
    newTime,
    stops,
    setStops,
    adjustStops,
  } = useExposureCalculator();

  const renderStopButton = (label: string, increment: number) => (
    <Pressable
      style={[styles.stopButton, { backgroundColor: tintColor }]}
      onPress={() => adjustStops(increment)}
    >
      <ThemedText style={styles.buttonText}>{label}</ThemedText>
    </Pressable>
  );

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
            exposure calculator
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Input Section */}
          <ThemedView
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
            <ThemedView style={[styles.formGroup, styles.timeFormGroup]}>
              <ThemedText style={[styles.label, styles.timeLabel]}>
                original exposure time (seconds):
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.timeInput,
                  { color: textColor, borderColor },
                ]}
                value={originalTime}
                onChangeText={setOriginalTime}
                keyboardType="numeric"
                placeholder="Enter time"
                placeholderTextColor={borderColor}
                maxLength={6}
              />
            </ThemedView>

            {/* Stop Adjustment Section */}
            <ThemedView
              style={[
                styles.formGroup,
                Platform.OS === "web" && isDesktop && styles.webStopGroup,
              ]}
            >
              <ThemedText style={styles.label}>stop adjustment:</ThemedText>
              <ThemedView style={styles.stopAdjustmentContainer}>
                <ThemedView style={styles.stopButtonGroup}>
                  {renderStopButton("-1", -1)}
                  {renderStopButton("-1/2", -0.5)}
                  {renderStopButton("-1/3", -1 / 3)}
                </ThemedView>

                <TextInput
                  style={[
                    styles.stopInput,
                    { color: textColor, borderColor, backgroundColor },
                  ]}
                  value={stops}
                  onChangeText={setStops}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={borderColor}
                />

                <ThemedView style={styles.stopButtonGroup}>
                  {renderStopButton("+1/3", 1 / 3)}
                  {renderStopButton("+1/2", 0.5)}
                  {renderStopButton("+1", 1)}
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Result Section */}
            {newTime && (
              <ThemedView style={styles.resultContainer}>
                {/* Time difference display */}
                {originalTime && newTime && (
                  <ThemedView style={styles.timeDifferenceContainer}>
                    <ThemedText style={styles.timeDifferenceLabel}>
                      {parseFloat(newTime) > parseFloat(originalTime) 
                        ? "add:" 
                        : "remove:"}
                    </ThemedText>
                    <ThemedText style={styles.timeDifferenceValue}>
                      {Math.abs(parseFloat(newTime) - parseFloat(originalTime)).toFixed(2)} seconds
                    </ThemedText>
                  </ThemedView>
                )}
                <ThemedText type="largeSemiBold" style={styles.subtitle}>
                  new exposure time
                </ThemedText>
                <ThemedText style={styles.resultValue}>
                  {newTime} seconds
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        {/* Information Section */}
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
            The exposure calculator helps you adjust your exposure time by
            stops. Each stop represents a doubling or halving of the light
            reaching the paper. This is handy when you are changing your
            aperture or doing f-stop printing when darkroom printing.
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            how to use:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            1. Enter your original exposure time in seconds
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            2. Use the buttons to adjust the exposure by stops
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            3. The new exposure time will be calculated automatically
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.infoSubtitle}>
            tips:
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Each stop doubles or halves the exposure time
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Use 1/3 and 1/2 stop adjustments for fine-tuning
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Use 1 stop adjustments for significant changes
          </ThemedText>
          <ThemedText style={styles.infoContentText}>
            • Worth noting: Because exposure is logarithmic, half stops are not exactly half
            the exposure time
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
      Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80,
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
  webForm: {
    maxWidth: 600,
    alignSelf: "center",
  },
  formGroup: {
    gap: 8,
  },
  timeFormGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  label: {
    fontSize: 16,
  },
  timeLabel: {
    flex: 1,
    paddingRight: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  timeInput: {
    width: 120,
  },
  stopAdjustmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 8,
  },
  stopInput: {
    height: 40,
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
  },
  stopButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stopButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resultContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  timeDifferenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
    padding: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  timeDifferenceLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeDifferenceValue: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
    }),
  },
  resultValue: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
    }),
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
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
  buttonText: {
    color: "#000000",
    fontSize: 16,
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
  webStopGroup: {
    alignItems: "center",
  },
});
