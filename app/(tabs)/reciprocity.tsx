import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useReciprocityCalculator } from "@/hooks/useReciprocityCalculator";
import { FILM_TYPES, EXPOSURE_PRESETS } from "@/constants/reciprocity";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fonts } from "@/styles/common";

export default function ReciprocityCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const inputBackground = useThemeColor({}, "inputBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const errorColor = useThemeColor({}, "errorColor");
  const surfaceVariant = useThemeColor({}, "surfaceVariant");
  const outline = useThemeColor({}, "outline");

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
        <ThemedView
          style={[
            styles.pickerContainer,
            { borderColor, backgroundColor: inputBackground },
          ]}
        >
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
            backgroundColor: inputBackground,
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
        <ThemedView style={[styles.header, { borderBottomColor: outline }]}>
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

              <ThemedView
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: cardBackground,
                    shadowColor,
                  },
                ]}
              >
                <ThemedView
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>film:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.filmName}
                  </ThemedText>
                </ThemedView>

                <ThemedView
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>increase:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {Math.round(calculation.percentageIncrease)}%
                  </ThemedText>
                </ThemedView>

                <ThemedView
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>formula:</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {calculation.originalTime}
                    <ThemedText style={[
                      styles.subscript, 
                      { 
                        backgroundColor: 'transparent',
                        borderColor: textColor,
                        borderWidth: 1,
                      }
                    ]}>
                      {calculation.factor.toFixed(2)}
                    </ThemedText>
                    {" = "}
                    {Math.round(calculation.adjustedTime * 10) / 10}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>
                    metered time:
                  </ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {formatTime(calculation.originalTime)}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.resultRow}>
                  <ThemedText style={[styles.resultLabel, { color: textSecondary }]}>
                    adjusted time:
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.resultValue}>
                    {formatTime(calculation.adjustedTime)}
                  </ThemedText>
                </ThemedView>

                {/* Visual Time Comparison */}
                <ThemedView style={styles.timeComparisonContainer}>
                  <ThemedText style={styles.timeComparisonTitle}>
                    Time Comparison
                  </ThemedText>
                  <ThemedView style={[styles.timeBarContainer, { backgroundColor: `${textSecondary}20` }]}>
                    <ThemedView
                      style={[
                        styles.timeBar,
                        styles.meteredTimeBar,
                        { backgroundColor: tintColor },
                      ]}
                    />
                    <ThemedView
                      style={[
                        styles.timeBar,
                        styles.adjustedTimeBar,
                        {
                          backgroundColor: `${tintColor}66`,
                          width: `${Math.min(
                            (calculation.adjustedTime / calculation.originalTime) * 100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </ThemedView>
                  <ThemedView style={styles.timeBarLabels}>
                    <ThemedText style={[styles.timeBarLabel, { color: textSecondary }]}>
                      Metered: {formatTime(calculation.originalTime)}
                    </ThemedText>
                    <ThemedText style={[styles.timeBarLabel, { color: textSecondary }]}>
                      Adjusted: {formatTime(calculation.adjustedTime)}
                    </ThemedText>
                  </ThemedView>
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
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor,
                      backgroundColor: inputBackground,
                    },
                  ]}
                  value={customFactor}
                  onChangeText={setCustomFactor}
                  keyboardType="numeric"
                  placeholder="1.3"
                  placeholderTextColor={textMuted}
                />
                <ThemedText style={[styles.infoText, { color: textMuted }]}>
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
                  {
                    color: textColor,
                    borderColor: timeFormatError ? errorColor : borderColor,
                    backgroundColor: inputBackground,
                  },
                ]}
                value={meteredTime}
                onChangeText={setMeteredTime}
                placeholder="e.g. 30s, 1m30s, 2h"
                placeholderTextColor={textMuted}
              />
              {formattedTime && (
                <ThemedText style={[styles.helpText, { color: textMuted }]}>
                  Parsed as: {formattedTime}
                </ThemedText>
              )}
              {timeFormatError && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
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
                    style={[
                      styles.presetButton,
                      {
                        borderColor,
                        backgroundColor: surfaceVariant,
                      },
                    ]}
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
            <ThemedView style={[
              styles.explanationBox,
              {
                borderColor: outline,
                backgroundColor: cardBackground,
                shadowColor,
              },
            ]}>
              <ThemedText
                style={styles.explanationTitle}
                type="defaultSemiBold"
              >
                What is reciprocity failure?
              </ThemedText>
              <ThemedText style={[styles.explanationText, { color: textSecondary }]}>
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
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  mainContent: {
    width: "100%",
  },
  webMainContent: {
    flexDirection: "row",
    gap: 40,
    alignItems: "flex-start",
  },
  resultsSection: {
    gap: 20,
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
    gap: 20,
    width: "100%",
  },
  webForm: {
    flex: 1,
    maxWidth: 480,
  },
  formGroup: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    // backgroundColor set dynamically
  },
  picker: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    // backgroundColor set dynamically
    ...Platform.select({
      android: {
        marginVertical: 0,
        height: 70,
      },
      web: {
        marginVertical: 4,
        height: 48,
        paddingHorizontal: 16,
      },
      ios: {
        marginVertical: 48,
      },
    }),
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    // backgroundColor set dynamically
    overflow: "hidden",
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    // backgroundColor set dynamically
    minWidth: 80,
    alignItems: "center",
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 480,
    // backgroundColor set dynamically
    padding: 24,
    borderRadius: 16,
    // shadowColor set dynamically
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  resultRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    borderRadius: 16,
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically
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
    // color set dynamically
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
    fontWeight: "600",
  },
  subscript: {
    fontSize: 12,
    lineHeight: 25,
    textAlignVertical: "bottom",
    position: "relative",
    bottom: 0,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  visualContainer: {
    width: "100%",
    maxWidth: 400,
    marginTop: 16,
    gap: 4,
  },
  timeBarValue: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: fonts.ios.primary,
      android: fonts.android.primary,
      web: fonts.web.primary,
    }),
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
    marginTop: 6,
    // color set dynamically
  },
  errorText: {
    fontSize: 12,
    // color set dynamically
    marginTop: 6,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
    // color set dynamically
  },
  explanationBox: {
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    // borderColor set dynamically
    // backgroundColor set dynamically
    // shadowColor set dynamically
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  explanationTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    // color set dynamically
  },
  timeComparisonContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  timeComparisonTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  timeBarContainer: {
    width: "100%",
    height: 20,
    // backgroundColor set dynamically
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  timeBar: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 10,
  },
  meteredTimeBar: {
    width: "30%",
    zIndex: 1,
  },
  adjustedTimeBar: {
    zIndex: 2,
  },
  timeBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  timeBarLabel: {
    fontSize: 12,
    // color set dynamically
  },
});
