import React from "react";
import { Platform, Linking } from "react-native";
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
  Switch,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  View,
} from "@gluestack-ui/themed";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { useResizeCalculator } from "@/hooks/useResizeCalculator";
import { NumberInput } from "@/components/NumberInput";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ResizeScreen() {
  const inverseSquareLawUrl = "https://en.wikipedia.org/wiki/Inverse-square_law";
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 600; // Define narrow screens as less than 600px
  const backgroundColor = useThemeColor({}, "background");

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
      style={[{ flex: 1, backgroundColor }]}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.select({ ios: 100, android: 100, default: 80 }),
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Box flex={1}>
        <Box className="w-full max-w-2xl mx-auto p-4 md:p-6">
          <Box className="flex items-center justify-center w-full mb-4">
            <Heading size="xl" className="text-center" textAlign="center" width="100%">
              Print Resize Calculator
            </Heading>
          </Box>

          {/* Mode Toggle */}
          <Box width="100%" alignItems="center" mb="$4">
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

          <Box className="w-full items-center pb-5" alignItems="center">
            {!isEnlargerHeightMode ? (
              <HStack justifyContent="center" alignItems="center" w="$full" space="lg" mb="$8">
                {/* Initial image size */}
                <Box className="max-w-[200px]">
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
                <Box className="max-w-[200px]">
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
            ) : (
              <VStack width="100%" maxWidth={350} space="md" mb="$8" alignItems="center">
                <Text size="lg" fontWeight="$bold" mb="$2" textAlign="center">
                  Enlarger Heights
                </Text>
                <HStack alignItems="center" mb="$2" space="sm" width="100%" justifyContent="center">
                  <Text w="$16" textAlign="right">Original Height:</Text>
                  <NumberInput
                    value={originalHeight}
                    onChangeText={setOriginalHeight}
                    placeholder="500"
                  />
                  <Text minWidth={30} textAlign="left">cm</Text>
                </HStack>
                <HStack alignItems="center" mb="$2" space="sm" width="100%" justifyContent="center">
                  <Text w="$16" textAlign="right">New Height:</Text>
                  <NumberInput
                    value={newHeight}
                    onChangeText={setNewHeight}
                    placeholder="600"
                  />
                  <Text minWidth={30} textAlign="left">cm</Text>
                </HStack>
              </VStack>
            )}

            {/* Aspect Ratio Warning */}
            {!isEnlargerHeightMode && !isAspectRatioMatched && (
              <Alert action="warning" variant="outline" mb="$4" width="100%" maxWidth={350}>
                <AlertIcon as={InfoIcon} size="lg" mr="$3" />
                <AlertText>
                  The aspect ratios of the initial and new sizes don't match!
                </AlertText>
              </Alert>
            )}

            {/* Original Exposure Time */}
            <HStack justifyContent="center" alignItems="center" mb="$4" width="100%" maxWidth={350}>
              <Text mr="$2.5">Original Exposure Time:</Text>
              <NumberInput
                value={originalTime}
                onChangeText={setOriginalTime}
                placeholder="10"
              />
              <Text ml="$2.5" minWidth={30} textAlign="left">seconds</Text>
            </HStack>

            {/* Results */}
            <VStack alignItems="center" space="sm" width="100%" alignSelf="center">
              <Text size="lg" mb="$2" textAlign="center">
                New Exposure Time: {newTime || "---"} seconds
              </Text>
              <Text size="lg" mb="$2" textAlign="center">
                Difference in Stops: {stopsDifference || "---"} stops
              </Text>
            </VStack>
          </Box>
        </Box>

        <Divider my="$4" />

        {/* About This Tool with conditional container */}
        <Box
          className={Platform.OS === "web" && !isNarrowScreen ? "rounded-xl p-4 md:p-6 max-w-md sm:max-w-md" : "p-4 md:p-6 mx-auto"}
          sx={{
            p: "$4",
            borderWidth: Platform.OS === "web" && !isNarrowScreen ? 1 : 0,
            borderColor: "$coolGray300",
            _dark: {
              borderColor: "$coolGray600",
              bg: Platform.OS === "web" && !isNarrowScreen ? "$black" : undefined,
            },
            _light: { bg: "$coolGray100" },
            flex: Platform.OS === "web" && !isNarrowScreen ? 1 : undefined,
            rounded: Platform.OS === "web" && !isNarrowScreen ? "$xl" : undefined,
            width: Platform.OS === "web" && !isNarrowScreen ? "50%" : "100%",
            maxWidth: Platform.OS === "web" && !isNarrowScreen ? undefined : 500,
            marginLeft: Platform.OS === "web" && !isNarrowScreen ? "auto" : undefined,
            marginRight: Platform.OS === "web" && !isNarrowScreen ? "auto" : undefined,
            marginHorizontal: Platform.OS === "web" && !isNarrowScreen ? "10%" : undefined,
          }}
        >
          <Heading 
            size="lg" 
            className="text-center mb-4" 
            textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
            width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
          >
            About This Tool
          </Heading>
          <VStack 
            space="sm" 
            alignItems={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
            width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
          >
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              The print resize calculator helps you determine the correct exposure
              time when enlarging or reducing the size of your darkroom prints.
            </Text>

            <Heading 
              size="md" 
              className="mt-4 mb-2" 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
            >
              How to use:
            </Heading>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              1. Choose your calculation method: Print Size or Enlarger Height. Print size is easier to use, but using enlarger height with a well calibrated enlarger is more accurate.
            </Text>
            {isEnlargerHeightMode ? (
              <>
                <Text 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                  paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
                >
                  2. Enter the original and new enlarger heights (lens to paper distance)
                </Text>
                <Text 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                  paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
                >
                  3. Enter the original exposure time in seconds
                </Text>
              </>
            ) : (
              <>
                <Text 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                  paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
                >
                  2. Enter the width and height of your original print
                </Text>
                <Text 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                  paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
                >
                  3. Enter the width and height of your desired new print size
                </Text>
                <Text 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                  paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
                >
                  4. Enter the original exposure time in seconds
                </Text>
              </>
            )}
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              {isEnlargerHeightMode ? "4" : "5"}. Click "Calculate New Exposure Time" to see the results
            </Text>

            <Heading 
              size="md" 
              className="mt-4 mb-2" 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
            >
              How it works:
            </Heading>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              When you change the size of a print, the light is spread across a
              different area, affecting the exposure needed. This is caused by the{" "}
              <Link href={inverseSquareLawUrl} isExternal>
                <LinkText>inverse-square law</LinkText>
              </Link>
              .
            </Text>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              The formula used depends on your selected mode:
            </Text>
            {isEnlargerHeightMode ? (
              <Text 
                fontWeight="bold" 
                textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : "left"} 
                width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
              >
                New Time = Original Time × (New Height)² ÷ (Original Height)²
              </Text>
            ) : Platform.OS === "web" && !isNarrowScreen ? (
              <Text fontWeight="bold" textAlign="center">
                New Time = Original Time × (New Area ÷ Original Area)
              </Text>
            ) : (
              <>
                <Text 
                  fontWeight="bold" 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : "center"} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
                >
                  New Time =
                </Text>
                <Text 
                  fontWeight="bold" 
                  textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : "center"} 
                  width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
                >
                  Original Time × (New Area ÷ Prev. Area)
                </Text>
                <Text fontWeight="bold" className="text-center">
                  
                </Text>
              </>
            )}

            <Heading 
              size="md" 
              className="mt-4 mb-2" 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined}
            >
              Tips:
            </Heading>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              • The results of this should only be treated as a best-guess
              estimate. Always make a test strip when resizing prints!
            </Text>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              • The "stops difference" shows how much you're changing exposure in
              photographic stops.
            </Text>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              • A positive stops value means more exposure is needed (larger
              print).
            </Text>
            <Text 
              textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
              width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
              paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
            >
              • A negative stops value means less exposure is needed (smaller
              print).
            </Text>
            {isEnlargerHeightMode && (
              <Text 
                textAlign={Platform.OS === "web" && isNarrowScreen ? "center" : undefined} 
                width={Platform.OS === "web" && isNarrowScreen ? "100%" : undefined} 
                paddingHorizontal={Platform.OS === "web" && isNarrowScreen ? 0 : undefined}
              >
                • Using enlarger height is often more accurate when the enlarger stays in the same position.
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  );
}
