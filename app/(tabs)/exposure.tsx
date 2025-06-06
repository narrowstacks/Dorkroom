import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useExposureCalculator } from "@/hooks/useExposureCalculator";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  Box,
  Text,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
} from "@gluestack-ui/themed";

export default function ExposureCalculator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const cardBackground = useThemeColor({}, "cardBackground");
  const inputBackground = useThemeColor({}, "inputBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const textSecondary = useThemeColor({}, "textSecondary");
  const surfaceVariant = useThemeColor({}, "surfaceVariant");
  const outline = useThemeColor({}, "outline");

  const {
    originalTime,
    setOriginalTime,
    newTime,
    stops,
    setStops,
    adjustStops,
  } = useExposureCalculator();

  const renderStopButton = (label: string, increment: number) => (
    <Button
      onPress={() => adjustStops(increment)}
      variant="outline"
      size="sm"
      className="py-2 px-2 rounded-lg justify-center items-center"
      style={{
        backgroundColor: surfaceVariant,
        borderColor,
      }}
    >
      <ButtonText
        className={`text-base ${Platform.OS === "web" ? "select-none" : ""}`}
        style={{ color: textColor }}
      >
        {label}
      </ButtonText>
    </Button>
  );

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
            exposure calculator
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
          {newTime && (
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
                {originalTime && newTime && (
                  <Box
                    className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                    style={[styles.resultRow, { borderBottomColor: outline }]}
                  >
                    <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                      {parseFloat(newTime) > parseFloat(originalTime) ? "add:" : "remove:"}
                    </Text>
                    <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                      {Math.abs(parseFloat(newTime) - parseFloat(originalTime)).toFixed(2)} seconds
                    </Text>
                  </Box>
                )}

                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>original time:</Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {originalTime} seconds
                  </Text>
                </Box>

                <Box className="flex-row w-full justify-between rounded-2xl gap-4 py-2" style={styles.resultRow}>
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    new time:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {newTime} seconds
                  </Text>
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
            {/* Original Time Input */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>
                original exposure time (seconds):
              </Text>
              <Input
                variant="outline"
                size="md"
                className="w-full border rounded-xl"
                style={{
                  backgroundColor: inputBackground,
                  borderColor,
                }}
              >
                <InputField
                  value={originalTime}
                  onChangeText={setOriginalTime}
                  keyboardType="numeric"
                  placeholder="Enter time"
                  maxLength={6}
                  className="text-base px-4 py-3"
                  style={{ color: textColor }}
                />
              </Input>
            </Box>

            {/* Stop Adjustment Section */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>stop adjustment:</Text>
              <HStack space="sm" className="items-center justify-center gap-2 my-2" alignItems="center" justifyContent="center">
                <HStack space="xs" className="items-center gap-1">
                  {renderStopButton("-1", -1)}
                  {renderStopButton("-1/2", -0.5)}
                  {renderStopButton("-1/3", -1 / 3)}
                </HStack>

                <Input
                  variant="outline"
                  size="md"
                  className="border rounded-lg"
                  style={{
                    width: 60,
                    backgroundColor: inputBackground,
                    borderColor,
                  }}
                >
                  <InputField
                    value={stops}
                    onChangeText={setStops}
                    keyboardType="numeric"
                    placeholder="1"
                    className="text-center"

                  />
                </Input>

                <HStack space="xs" className="items-center gap-1">
                  {renderStopButton("+1/3", 1 / 3)}
                  {renderStopButton("+1/2", 0.5)}
                  {renderStopButton("+1", 1)}
                </HStack>
              </HStack>
            </Box>
          </Box>
        </Box>

        {/* Information Section */}
        <Box className="p-5 rounded-2xl mt-8 border shadow-sm" style={[
          styles.infoSection,
          {
            borderColor: outline,
            backgroundColor: cardBackground,
            shadowColor,
          },
        ]}>
          <Text className="text-lg mb-3 font-semibold" style={styles.infoTitle}>
            about this tool
          </Text>

          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            The exposure calculator helps you adjust your exposure time by
            stops. Each stop represents a doubling or halving of the light
            reaching the paper. This is handy when you are changing your
            aperture or doing f-stop printing when darkroom printing.
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            how to use:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            1. Enter your original exposure time in seconds
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            2. Use the buttons to adjust the exposure by stops
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            3. The new exposure time will be calculated automatically
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            tips:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Each stop doubles or halves the exposure time
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Use 1/3 and 1/2 stop adjustments for fine-tuning
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Use 1 stop adjustments for significant changes
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Worth noting: Because exposure is logarithmic, half stops are not exactly half
            the exposure time
          </Text>
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
      Platform.OS === "ios" || Platform.OS === "android" ? 100 : 80,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  resultContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 480,
    padding: 24,
    borderRadius: 16,
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
    gap: 16,
    borderRadius: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultLabel: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 16,
    textAlign: "left",
    flex: 1,
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "600",
  },
  infoSubtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  infoContentText: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },
});