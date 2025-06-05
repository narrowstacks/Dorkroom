import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  SelectScrollView,
} from "@/components/ui/select";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useReciprocityCalculator } from "@/hooks/useReciprocityCalculator";
import { FILM_TYPES, EXPOSURE_PRESETS } from "@/constants/reciprocity";
import { Box, Text } from "@gluestack-ui/themed";
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
    items: { label: string; value: string }[]
  ) => {
    const selectedItem = items.find(item => item.value === value);
    
    return (
      <Select
        selectedValue={value}
        onValueChange={onValueChange}
        className={`w-full border rounded-xl`}
        style={{
          backgroundColor: inputBackground,
          borderColor,
        }}
      >
        <SelectTrigger
          className={`h-12 flex-row items-center justify-between px-4`}
          style={{
            backgroundColor: inputBackground,
            borderColor,
          }}
        >
          <SelectInput
            placeholder="Select an option"
            value={selectedItem?.label || ""}
            editable={false}
            className={`flex-1 text-base`}
            style={{ color: textColor }}
          />
          <SelectIcon className={`ml-2`}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={textColor} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className={`bg-background rounded-t-xl`}>
            <SelectScrollView>
              {items.map((item) => (
                <SelectItem
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  className={`py-4 px-6 border-b border-outline-200`}
                />
              ))}
            </SelectScrollView>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Box
        className="flex-1 p-4 web:max-w-5xl web:mx-auto web:w-full web:p-6"
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <Box className="flex-row justify-center items-center w-full mb-6 pb-4 border-b" style={[styles.header, { borderBottomColor: outline }]}>
          <Text className="text-3xl text-center font-semibold" style={styles.title}>
            reciprocity calculator
          </Text>
        </Box>

        <Box
          className="w-full web:flex-row web:gap-10 web:items-start"
          style={[
            styles.mainContent,
            Platform.OS === "web" && isDesktop && styles.webMainContent,
          ]}
        >
          {/* Results Section */}
          {calculation && (
            <Box
              className="gap-5 items-center w-full mb-8 web:flex-1 web:self-stretch web:mb-0"
              style={[
                styles.resultsSection,
                Platform.OS === "web" && isDesktop && styles.webResultsSection,
              ]}
            >
              <Text className="text-2xl mb-4 text-center font-semibold" style={styles.subtitle}>
                result
              </Text>

              <Box
                className="items-center gap-4 w-full max-w-lg p-6 rounded-2xl shadow-lg"
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor: cardBackground,
                    shadowColor,
                  },
                ]}
              >
                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>film:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {calculation.filmName}
                  </Text>
                </Box>

                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>increase:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {Math.round(calculation.percentageIncrease)}%
                  </Text>
                </Box>

                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>formula:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {calculation.originalTime}
                    <Text className="text-xs leading-6 relative px-1 py-0.5 rounded border" style={[
                      styles.subscript, 
                      { 
                        backgroundColor: 'transparent',
                        borderColor: textColor,
                        borderWidth: 1,
                      }
                    ]}>
                      {calculation.factor.toFixed(2)}
                    </Text>
                    {" = "}
                    {Math.round(calculation.adjustedTime * 10) / 10}
                  </Text>
                </Box>

                <Box className="flex-row w-full justify-between rounded-2xl gap-4 py-2" style={styles.resultRow}>
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    metered time:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {formatTime(calculation.originalTime)}
                  </Text>
                </Box>

                <Box className="flex-row w-full justify-between rounded-2xl gap-4 py-2" style={styles.resultRow}>
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    adjusted time:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {formatTime(calculation.adjustedTime)}
                  </Text>
                </Box>

                {/* Visual Time Comparison */}
                <Box className="w-full mt-4 gap-3" style={styles.timeComparisonContainer}>
                  <Text className="text-base mb-2 font-semibold text-center" style={styles.timeComparisonTitle}>
                    Time Comparison
                  </Text>
                  <Box className="w-full h-5 rounded-lg overflow-hidden relative" style={[styles.timeBarContainer, { backgroundColor: `${textSecondary}20` }]}>
                    <Box
                      className="absolute left-0 top-0 h-full rounded-lg z-10 w-3/10"
                      style={[
                        styles.timeBar,
                        styles.meteredTimeBar,
                        { backgroundColor: tintColor },
                      ]}
                    />
                    <Box
                      className="absolute left-0 top-0 h-full rounded-lg z-20"
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
                  </Box>
                  <Box className="flex-row justify-between w-full mt-2" style={styles.timeBarLabels}>
                    <Text className="text-xs" style={[styles.timeBarLabel, { color: textSecondary }]}>
                      Metered: {formatTime(calculation.originalTime)}
                    </Text>
                    <Text className="text-xs" style={[styles.timeBarLabel, { color: textSecondary }]}>
                      Adjusted: {formatTime(calculation.adjustedTime)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Form Section */}
          <Box
            className="gap-5 w-full web:flex-1 web:max-w-lg"
            style={[
              styles.form,
              Platform.OS === "web" && isDesktop && styles.webForm,
            ]}
          >
            {/* Film Type Selection */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>film type:</Text>
              {renderPicker(filmType, setFilmType, FILM_TYPES)}
            </Box>

            {/* Custom Factor Input */}
            {filmType === "custom" && (
              <Box className="gap-3" style={styles.formGroup}>
                <Text className="text-base font-medium mb-1" style={styles.label}>
                  reciprocity factor:
                </Text>
                <Textarea
                  className={`w-full border rounded-xl`}
                  style={{
                    backgroundColor: inputBackground,
                    borderColor,
                    height: 48,
                  }}
                >
                  <TextareaInput
                    value={customFactor}
                    onChangeText={setCustomFactor}
                    keyboardType="numeric"
                    placeholder="1.3"
                    placeholderTextColor={textMuted}
                    multiline={false}
                    className={`text-base px-4 py-3`}
                    style={{ color: textColor }}
                  />
                </Textarea>
                <Text className="text-xs italic mt-1.5" style={[styles.infoText, { color: textMuted }]}>
                  Higher values mean more compensation needed
                </Text>
              </Box>
            )}

            {/* Metered Time Input */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>
                metered exposure time:
              </Text>
              <Textarea
                className={`w-full border rounded-xl`}
                style={{
                  backgroundColor: inputBackground,
                  borderColor: timeFormatError ? errorColor : borderColor,
                  height: 48,
                }}
              >
                <TextareaInput
                  value={meteredTime}
                  onChangeText={setMeteredTime}
                  placeholder="e.g. 30s, 1m30s, 2h"
                  placeholderTextColor={textMuted}
                  multiline={false}
                  className={`text-base px-4 py-3`}
                  style={{ color: textColor }}
                />
              </Textarea>
              {formattedTime && (
                <Text className="text-xs italic mt-1.5" style={[styles.helpText, { color: textMuted }]}>
                  Parsed as: {formattedTime}
                </Text>
              )}
              {timeFormatError && (
                <Text className="text-xs mt-1.5 font-medium" style={[styles.errorText, { color: errorColor }]}>
                  {timeFormatError}
                </Text>
              )}
            </Box>

            {/* Common Exposure Presets */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>common presets:</Text>
              <Box className="flex-row flex-wrap gap-3 mt-2" style={styles.presetsContainer}>
                {EXPOSURE_PRESETS.map((seconds: number) => (
                  <Button
                    key={seconds}
                    variant="outline"
                    action="default"
                    size="sm"
                    className={`min-w-20 rounded-xl border`}
                    style={{
                      borderColor,
                      backgroundColor: surfaceVariant,
                    }}
                    onPress={() => setMeteredTime(seconds.toString() + "s")}
                  >
                    <ButtonText
                      className={`text-sm font-medium`}
                      style={{ color: textColor }}
                    >
                      {formatTime(seconds)}
                    </ButtonText>
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Explanation Section */}
            <Box className="p-5 rounded-2xl mt-6 border shadow-sm" style={[
              styles.explanationBox,
              {
                borderColor: outline,
                backgroundColor: cardBackground,
                shadowColor,
              },
            ]}>
              <Text
                className="text-lg mb-3 font-semibold"
                style={styles.explanationTitle}
              >
                What is reciprocity failure?
              </Text>
              <Text className="text-base leading-6" style={[styles.explanationText, { color: textSecondary }]}>
                Film becomes less sensitive to light during long exposures,
                requiring additional exposure time beyond what your light meter
                indicates. Different films have different characteristics,
                represented by the reciprocity factor.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
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
    // backgroundColor: "#282828",
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
