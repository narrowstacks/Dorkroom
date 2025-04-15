import React from "react";
import { Platform, Linking, StyleSheet, View } from "react-native";
import {
  ScrollView,
  Box,
  Text,
  Heading,
  Link,
  LinkText,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
  Button,
  ButtonText,
} from "@gluestack-ui/themed";
import { useResizeCalculator } from "../hooks/useResizeCalculator";
import { NumberInput } from "../../components/NumberInput";
import Head from "expo-router/head";

export default function ResizeScreen() {
  const inverseSquareLawUrl = "https://en.wikipedia.org/wiki/Inverse-square_law";

  // Use the custom hook for state and logic
  const {
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
    calculateExposure,
  } = useResizeCalculator();

  // Define styles *before* using them in the return statement
  // Styles object will be partially unused after refactoring Text components
  const styles = StyleSheet.create({
    warningContainer: {
      marginBottom: 15,
      width: "100%",
      maxWidth: 500,
      alignItems: "center",
    },
    warningText: {
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "center",
    },
    exposureTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      justifyContent: "center",
      width: "100%",
      maxWidth: 400,
    },
    resultsContainer: {
      alignItems: "center",
      marginTop: 10,
    },
  });

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.select({ ios: 100, android: 100, default: 80 }),
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Head>
        <title>Print Resize Calculator</title>
        <meta name="description" content="Calculate the correct exposure time for your prints when resizing them." />
      </Head>
      <Box sx={{ flex: 1 }}>
        <Box className="w-full max-w-2xl mx-auto p-4 md:p-6">
          <Box className="items-center w-full mb-4">
            <Heading size="xl" className="text-center">
              Print Resize Calculator
            </Heading>
          </Box>

          <View className="w-full items-center pb-5">
            <HStack justifyContent="center" w="$full" maxWidth={500} mb="$8">
              {/* Initial image size */}
              <Box className="flex-1 max-w-[200px] mx-2.5">
                <Text size="lg" fontWeight="$bold" mb="$4" textAlign="center">
                  Initial Image Size
                </Text>
                <HStack alignItems="center" mb="$4" space="sm">
                  <Text w="$16" textAlign="right">Width:</Text>
                  <NumberInput
                    value={originalWidth}
                    onChangeText={setOriginalWidth}
                    placeholder="4"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
                <HStack alignItems="center" mb="$4" space="sm">
                  <Text w="$16" textAlign="right">Height:</Text>
                  <NumberInput
                    value={originalLength}
                    onChangeText={setOriginalLength}
                    placeholder="6"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
              </Box>

              {/* New image size */}
              <Box className="flex-1 max-w-[200px] mx-2.5">
                <Text size="lg" fontWeight="$bold" mb="$4" textAlign="center">New Image Size</Text>
                <HStack alignItems="center" mb="$4" space="sm">
                  <Text w="$16" textAlign="right">Width:</Text>
                  <NumberInput
                    value={newWidth}
                    onChangeText={setNewWidth}
                    placeholder="6"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
                <HStack alignItems="center" mb="$4" space="sm">
                  <Text w="$16" textAlign="right">Height:</Text>
                  <NumberInput
                    value={newLength}
                    onChangeText={setNewLength}
                    placeholder="9"
                  />
                  <Text minWidth={30} textAlign="left">in</Text>
                </HStack>
              </Box>
            </HStack>

            {/* Aspect Ratio Warning */}
            {!isAspectRatioMatched && (
              <Alert action="warning" variant="outline" mb="$4">
                <AlertIcon as={InfoIcon} size="lg" mr="$3" />
                <AlertText>
                  The aspect ratios of the initial and new sizes don't match!
                </AlertText>
              </Alert>
            )}

            {/* Original Exposure Time */}
            <View style={styles.exposureTimeContainer}>
              <Text mr="$2.5">Original Exposure Time:</Text>
              <NumberInput
                value={originalTime}
                onChangeText={setOriginalTime}
                placeholder="10"
              />
              <Text ml="$2.5" minWidth={30} textAlign="left">seconds</Text>
            </View>

            <Button
              onPress={calculateExposure}
              mb="$8"
              w="100%"
              maxWidth={350}
              action="positive"
            >
              <ButtonText>Calculate New Exposure Time</ButtonText>
            </Button>

            {/* Results */}
            <View style={styles.resultsContainer}>
              <Text size="lg" mb="$2.5">
                New Exposure Time: {newTime || "---"} seconds
              </Text>
              <Text size="lg" mb="$2.5">
                Stops Difference: {stopsDifference || "---"} stops
              </Text>
            </View>
          </View>
        </Box>

        <Divider my="$4" />

        {Platform.OS === "web" ? (
          <HStack space="md" justifyContent="center" alignItems="flex-start">
            {/* Empty Box for spacing on the left */}
            <Box flex={1} />

            {/* Original Content Box */}
            <Box
              className="rounded-xl p-4 md:p-6 max-w-xs"
              sx={{
                p: "$4",
                borderWidth: 1,
                borderColor: "$coolGray300",
                _dark: {
                  borderColor: "$coolGray600",
                  bg: "$black",
                },
                _light: { bg: "$coolGray100" },
                flex: 1,
                rounded: "$xl",
              }}            >
              <Heading size="lg" className="text-center mb-4">
                About This Tool
              </Heading>
              <VStack space="sm">
                <Text>
                  The print resize calculator helps you determine the correct exposure
                  time when enlarging or reducing the size of your darkroom prints.
                </Text>

                <Heading size="md" className="mt-4 mb-2">
                  How to use:
                </Heading>
                <Text>1. Enter the width and height of your original print</Text>
                <Text>2. Enter the width and height of your desired new print size</Text>
                <Text>3. Enter the original exposure time in seconds</Text>
                <Text>4. Click "Calculate New Exposure Time" to see the results</Text>

                <Heading size="md" className="mt-4 mb-2">
                  How it works:
                </Heading>
                <Text>
                  When you change the size of a print, the light is spread across a
                  different area, affecting the exposure needed. This is caused by the{" "}
                  <Link href={inverseSquareLawUrl} isExternal>
                    <LinkText>inverse-square law</LinkText>
                  </Link>
                  . This calculator uses the ratio of the areas to determine the new
                  exposure time.
                </Text>
                <Text>
                  The formula used is:
                </Text>
                <Text bold>
                  New Time = Original Time × (New Area ÷ Original Area)
                </Text>

                <Heading size="md" className="mt-4 mb-2">
                  Tips:
                </Heading>
                <Text>
                  • The results of this should only be treated as a best-guess
                  estimate. Always make a test strip when resizing prints!
                </Text>
                <Text>
                  • The "stops difference" shows how much you're changing exposure in
                  photographic stops.
                </Text>
                <Text>
                  • A positive stops value means more exposure is needed (larger
                  print).
                </Text>
                <Text>
                  • A negative stops value means less exposure is needed (smaller
                  print).
                </Text>
              </VStack>
            </Box>

            {/* Empty Box for spacing on the right */}
            <Box flex={1} />
          </HStack>
        ) : (
          <Box
            className="p-4 md:p-6 max-w-sm mx-auto"
            sx={{
              borderWidth: 0,
              borderColor: "$coolGray300",
              _dark: {
                borderColor: "$coolGray600",
              },
              _light: { bg: "$coolGray100" },
            }}>
            <Heading size="lg" className="text-center mb-4">
              About This Tool
            </Heading>
            <VStack space="sm">
              <Text>
                The print resize calculator helps you determine the correct exposure
                time when enlarging or reducing the size of your darkroom prints.
              </Text>

              <Heading size="md" className="mt-4 mb-2">
                How to use:
              </Heading>
              <Text>1. Enter the width and height of your original print</Text>
              <Text>2. Enter the width and height of your desired new print size</Text>
              <Text>3. Enter the original exposure time in seconds</Text>
              <Text>4. Click "Calculate New Exposure Time" to see the results</Text>

              <Heading size="md" className="mt-4 mb-2">
                How it works:
              </Heading>
              <Text>
                When you change the size of a print, the light is spread across a
                different area, affecting the exposure needed. This is caused by the{" "}
                <Link href={inverseSquareLawUrl} isExternal>
                  <LinkText>inverse-square law</LinkText>
                </Link>
                . This calculator uses the ratio of the areas to determine the new
                exposure time.
              </Text>
              <Text>
                The formula used is:
              </Text>
              <Text bold className="text-left">
                New Time =
              </Text>
              <Text bold className="text-center">
                Original Time × (New Area ÷ Prev. Area)
              </Text>
              <Text bold className="text-center">
                
              </Text>
              <Heading size="md" className="mt-4 mb-2">
                Tips:
              </Heading>
              <Text>
                • The results of this should only be treated as a best-guess
                estimate. Always make a test strip when resizing prints!
              </Text>
              <Text>
                • The "stops difference" shows how much you're changing exposure in
                photographic stops.
              </Text>
              <Text>
                • A positive stops value means more exposure is needed (larger
                print).
              </Text>
              <Text>
                • A negative stops value means less exposure is needed (smaller
                print).
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}
