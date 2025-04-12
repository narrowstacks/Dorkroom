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
import { useReciprocityCalculator } from "../hooks/useReciprocityCalculator";
import { FILM_TYPES, EXPOSURE_PRESETS } from "../constants/reciprocity";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useThemeColor } from "../hooks/useThemeColor";
import { fonts } from "../styles/common";

export default function ReciprocityCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const {
    filmType,
    setFilmType,
    meteredTime,
    setMeteredTime,
    customFactor,
    setCustomFactor,
    formattedTime,
    timeFormatError,
    calculation,
    formatTime,
  } = useReciprocityCalculator();

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
            reciprocity calculator
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Results Section */}
          {calculation && (
            <ThemedView
              style={[
                styles.resultsSection,
                Platform.OS === "web" && isDesktop && styles.webResultsSection,
              ]}
            >
              <ThemedText type="largeSemiBold" style={styles.subtitle}>
                result
              </ThemedText>

              <ThemedView style={styles.resultContainer}>
                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>film:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.filmName}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>increase:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {Math.round(calculation.percentageIncrease)}%
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>formula:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.originalTime}
                    <ThemedText style={styles.subscript}>
                      {calculation.factor.toFixed(2)}
                    </ThemedText>
                    {" = "}
                    {Math.round(calculation.adjustedTime * 10) / 10}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    metered time:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {formatTime(calculation.originalTime)}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={styles.resultLabel}>
                    adjusted time:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {formatTime(calculation.adjustedTime)}
                  </ThemedText>
                </ThemedView>
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
            {/* Film Type Selection */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>film type:</ThemedText>
              {renderPicker(filmType, setFilmType, FILM_TYPES)}
            </ThemedView>

            {/* Custom Factor Input */}
            {filmType === "custom" && (
              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>
                  reciprocity factor:
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor }]}
                  value={customFactor}
                  onChangeText={setCustomFactor}
                  keyboardType="numeric"
                  placeholder="1.3"
                  placeholderTextColor={borderColor}
                />
                <ThemedText style={styles.infoText}>
                  Higher values mean more compensation needed
                </ThemedText>
              </ThemedView>
            )}

            {/* Metered Time Input */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>
                metered exposure time:
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor },
                  timeFormatError && styles.inputError,
                ]}
                value={meteredTime}
                onChangeText={setMeteredTime}
                placeholder="e.g. 30s, 1m30s, 2h"
                placeholderTextColor={borderColor}
              />
              {formattedTime && (
                <ThemedText style={styles.helpText}>
                  Parsed as: {formattedTime}
                </ThemedText>
              )}
              {timeFormatError && (
                <ThemedText style={styles.errorText}>
                  {timeFormatError}
                </ThemedText>
              )}
            </ThemedView>

            {/* Common Exposure Presets */}
            <ThemedView style={styles.formGroup}>
              <ThemedText style={styles.label}>common presets:</ThemedText>
              <ThemedView style={styles.presetsContainer}>
                {EXPOSURE_PRESETS.map((seconds: number) => (
                  <Pressable
                    key={seconds}
                    style={[styles.presetButton, { borderColor }]}
                    onPress={() => setMeteredTime(seconds.toString() + "s")}
                  >
                    <ThemedText style={styles.presetButtonText}>
                      {formatTime(seconds)}
                    </ThemedText>
                  </Pressable>
                ))}
              </ThemedView>
            </ThemedView>

            {/* Explanation Section */}
            <ThemedView style={styles.explanationBox}>
              <ThemedText
                style={styles.explanationTitle}
                type="defaultSemiBold"
              >
                What is reciprocity failure?
              </ThemedText>
              <ThemedText style={styles.explanationText}>
                Film becomes less sensitive to light during long exposures,
                requiring additional exposure time beyond what your light meter
                indicates. Different films have different characteristics,
                represented by the reciprocity factor.
              </ThemedText>
            </ThemedView>
          </ThemedView>
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
  webContent: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    width: "100%",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  mainContent: {
    width: "100%",
  },
  webMainContent: {
    flexDirection: "row",
    gap: 32,
    alignItems: "flex-start",
  },
  resultsSection: {
    gap: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },
  webResultsSection: {
    flex: 1,
    alignSelf: "stretch",
    marginBottom: 0,
  },
  form: {
    gap: 16,
    width: "100%",
  },
  webForm: {
    flex: 1,
    maxWidth: 480,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  picker: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    ...Platform.select({
      android: {
        marginVertical: 0,
        height: 70,
      },
      web: {
        marginVertical: 4,
      },
      ios: {
        marginVertical: 48,
      },
    }),
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: 14,
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
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
    flex: 1,
  },
  subscript: {
    fontSize: 10,
    lineHeight: 25,
    textAlignVertical: "bottom",
    position: "relative",
    bottom: 0,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
  },
  visualContainer: {
    width: "100%",
    maxWidth: 400,
    marginTop: 16,
    gap: 4,
  },
  timeBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  timeBarLabel: {
    fontSize: 14,
  },
  timeBarValue: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
  },
  timeBar: {
    height: 20,
    borderRadius: 4,
  },
  timeSuggestion: {
    marginTop: 16,
    alignItems: "center",
  },
  timeSuggestionText: {
    fontSize: 14,
  },
  timeSuggestionValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
  },
  helpText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  explanationBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  explanationTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
