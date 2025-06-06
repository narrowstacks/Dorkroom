import React from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import {
  Box,
  Text,
  Link,
  LinkText,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
  Switch,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useResizeCalculator } from "@/hooks/useResizeCalculator";
import { NumberInput } from "@/components/NumberInput";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ResizeScreen() {
  const inverseSquareLawUrl = "https://en.wikipedia.org/wiki/Inverse-square_law";
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cardBackground");
  const shadowColor = useThemeColor({}, "shadowColor");
  const textSecondary = useThemeColor({}, "textSecondary");
  const outline = useThemeColor({}, "outline");

  // Use the custom hook for state and logic
  const {
    isEnlargerHeightMode,
    setIsEnlargerHeightMode,
    originalWidth,
    setOriginalWidth,
    originalLength,
    setOriginalLength,
    newWidth,
    setNewWidth,
    newLength,
    setNewLength,
    originalTime,
    setOriginalTime,
    newTime,
    stopsDifference,
    isAspectRatioMatched,
    originalHeight,
    setOriginalHeight,
    newHeight,
    setNewHeight,
  } = useResizeCalculator();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Box
        className="flex-1 p-4 web:max-w-5xl web:mx-auto web:w-full web:p-6"
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
      >
        <Box className="flex-row justify-center items-center w-full mb-6 pb-4 border-b" style={[styles.header, { borderBottomColor: outline }]}>
          <Text className="text-3xl text-center font-semibold" style={styles.title}>
            print resize calculator
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
                <Box
                  className="flex-row w-full justify-between rounded-2xl gap-4 py-2 border-b"
                  style={[styles.resultRow, { borderBottomColor: outline }]}
                >
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    new time:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {newTime} seconds
                  </Text>
                </Box>

                <Box className="flex-row w-full justify-between rounded-2xl gap-4 py-2" style={styles.resultRow}>
                  <Text className="text-base text-right flex-1 font-medium" style={[styles.resultLabel, { color: textSecondary }]}>
                    difference:
                  </Text>
                  <Text className="text-base text-left flex-1 font-semibold" style={styles.resultValue}>
                    {stopsDifference} stops
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
            {/* Mode Toggle */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>calculation method:</Text>
              <FormControl>
                <HStack space="md" alignItems="center" justifyContent="center" paddingTop={10}>
                  <FormControlLabel>
                    <FormControlLabelText>Print Size</FormControlLabelText>
                  </FormControlLabel>
                  <Switch
                    value={isEnlargerHeightMode}
                    onValueChange={(value) => {
                      setIsEnlargerHeightMode(value);
                    }}
                  />
                  <FormControlLabel>
                    <FormControlLabelText>Enlarger Height</FormControlLabelText>
                  </FormControlLabel>
                </HStack>
              </FormControl>
            </Box>

            {!isEnlargerHeightMode ? (
              <>
                {/* Print Size Inputs */}
                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>initial image size:</Text>
                  <VStack space="sm">
                    <HStack alignItems="center" space="sm">
                      <Text w="$16" textAlign="right">Width:</Text>
                      <NumberInput
                        value={originalWidth}
                        onChangeText={setOriginalWidth}
                        placeholder="4"
                      />
                      <Text minWidth={30} textAlign="left">in</Text>
                    </HStack>
                    <HStack alignItems="center" space="sm">
                      <Text w="$16" textAlign="right">Height:</Text>
                      <NumberInput
                        value={originalLength}
                        onChangeText={setOriginalLength}
                        placeholder="6"
                      />
                      <Text minWidth={30} textAlign="left">in</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box className="gap-3" style={styles.formGroup}>
                  <Text className="text-base font-medium mb-1" style={styles.label}>new image size:</Text>
                  <VStack space="sm">
                    <HStack alignItems="center" space="sm">
                      <Text w="$16" textAlign="right">Width:</Text>
                      <NumberInput
                        value={newWidth}
                        onChangeText={setNewWidth}
                        placeholder="6"
                      />
                      <Text minWidth={30} textAlign="left">in</Text>
                    </HStack>
                    <HStack alignItems="center" space="sm">
                      <Text w="$16" textAlign="right">Height:</Text>
                      <NumberInput
                        value={newLength}
                        onChangeText={setNewLength}
                        placeholder="9"
                      />
                      <Text minWidth={30} textAlign="left">in</Text>
                    </HStack>
                  </VStack>
                </Box>
              </>
            ) : (
              <Box className="gap-3" style={styles.formGroup}>
                <Text className="text-base font-medium mb-1" style={styles.label}>enlarger heights:</Text>
                <VStack space="sm">
                  <HStack alignItems="center" space="sm">
                    <Text w="$20" textAlign="right">Original:</Text>
                    <NumberInput
                      value={originalHeight}
                      onChangeText={setOriginalHeight}
                      placeholder="500"
                    />
                    <Text minWidth={30} textAlign="left">cm</Text>
                  </HStack>
                  <HStack alignItems="center" space="sm">
                    <Text w="$20" textAlign="right">New:</Text>
                    <NumberInput
                      value={newHeight}
                      onChangeText={setNewHeight}
                      placeholder="600"
                    />
                    <Text minWidth={30} textAlign="left">cm</Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            {/* Aspect Ratio Warning */}
            {!isEnlargerHeightMode && !isAspectRatioMatched && (
              <Alert action="warning" variant="outline" mb="$4" width="100%">
                <AlertIcon as={InfoIcon} size="lg" mr="$3" />
                <AlertText>
                  The aspect ratios of the initial and new sizes don&apos;t match!
                </AlertText>
              </Alert>
            )}

            {/* Original Exposure Time */}
            <Box className="gap-3" style={styles.formGroup}>
              <Text className="text-base font-medium mb-1" style={styles.label}>original exposure time:</Text>
              <HStack alignItems="center" space="sm">
                <NumberInput
                  value={originalTime}
                  onChangeText={setOriginalTime}
                  placeholder="10"
                />
                <Text minWidth={60} textAlign="left">seconds</Text>
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
            The print resize calculator helps you determine the correct exposure
            time when enlarging or reducing the size of your darkroom prints.
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            how to use:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            1. Choose your calculation method: Print Size or Enlarger Height
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            2. Print size is easier to use, but enlarger height is more accurate
          </Text>
          {isEnlargerHeightMode ? (
            <>
              <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
                3. Enter the original and new enlarger heights (lens to paper distance)
              </Text>
              <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
                4. Enter the original exposure time in seconds
              </Text>
            </>
          ) : (
            <>
              <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
                3. Enter the width and height of your original print
              </Text>
              <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
                4. Enter the width and height of your desired new print size
              </Text>
              <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
                5. Enter the original exposure time in seconds
              </Text>
            </>
          )}
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            {isEnlargerHeightMode ? "5" : "6"}. The new exposure time will be calculated automatically
          </Text>

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            how it works:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            When you change the size of a print, the light is spread across a
            different area, affecting the exposure needed. This is caused by the{" "}
            <Link href={inverseSquareLawUrl} isExternal>
              <LinkText>inverse-square law</LinkText>
            </Link>
            .
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            The formula used depends on your selected mode:
          </Text>
          {isEnlargerHeightMode ? (
            <Text className="text-base leading-6 font-semibold" style={[styles.infoContentText, { fontWeight: "600" }]}>
              New Time = Original Time × (New Height)² ÷ (Original Height)²
            </Text>
          ) : (
            <Text className="text-base leading-6 font-semibold" style={[styles.infoContentText, { fontWeight: "600" }]}>
              New Time = Original Time × (New Area ÷ Original Area)
            </Text>
          )}

          <Text className="text-base mt-4 mb-2 font-semibold" style={styles.infoSubtitle}>
            tips:
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • The results should only be treated as a best-guess estimate
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Always make a test strip when resizing prints!
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • The &quot;stops difference&quot; shows exposure change in photographic stops
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Positive stops = more exposure needed (larger print)
          </Text>
          <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
            • Negative stops = less exposure needed (smaller print)
          </Text>
          {isEnlargerHeightMode && (
            <Text className="text-base leading-6" style={[styles.infoContentText, { color: textSecondary }]}>
              • Enlarger height method is more accurate when properly calibrated
            </Text>
          )}
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
